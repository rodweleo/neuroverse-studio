import LLM "mo:llm";
import IC "ic:aaaaa-aa";
import HashMap "mo:base/HashMap";
import Types "Types";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Time "mo:base/Time";
import Int "mo:base/Int";
import BitcoinAPI "BitcoinAPI";
import Utils "Utils";
import P2pkh "P2pkh";
import P2trKeyOnly "P2trKeyOnly";
import P2tr "P2tr";
import Helpers "Helpers";
import ToolRegistry "ToolRegistry";
import Tool "./Tool";
import HttpClient "./HttpClient";
import Cycles "mo:base/ExperimentalCycles";
import TokenHelper "./TokenHelper";
import Icrc1Ledger "canister:icrc1_ledger_canister";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import TransactionTypes "./types/transaction.type";
import TransactionModule "./modules/transaction.module";
import SubscriptionTypes "./types/subscription.type";
import SubscriptionModule "./modules/subscription.module";
import SubscriptionType "types/subscription.type";

persistent actor NeuroVerse {

  /// The Bitcoin network to connect to.
  ///
  /// When developing locally this should be `regtest`.
  /// When deploying to the IC this should be `testnet`.
  /// `mainnet` is currently unsupported.
  // Set the network here: #regtest for local, #testnet for IC
  transient let network : Types.Network = #regtest;
  let NETWORK : Types.Network = network;

  /// The derivation path to use for ECDSA secp256k1 or Schnorr BIP340/BIP341 key
  /// derivation.
  transient let DERIVATION_PATH : [[Nat8]] = [];

  // The ECDSA key name.
  transient let KEY_NAME : Text = switch NETWORK {
    // For local development, we use a special test key with dfx.
    case (#regtest) "dfx_test_key";
    // On the IC we're using a test ECDSA key.
    case _ "test_key_1";
  };

  // Threshold signing APIs instantiated with the management canister ID. Can be
  // replaced for cheaper testing.
  transient var ecdsa_canister_actor : Types.EcdsaCanisterActor = actor ("aaaaa-aa");
  transient var schnorr_canister_actor : Types.SchnorrCanisterActor = actor ("aaaaa-aa");

  private transient var agents = HashMap.HashMap<Text, Types.Agent>(10, Text.equal, Text.hash);
  private transient var userAgents = HashMap.HashMap<Principal, Types.AgentsMap>(
    10,
    Principal.equal,
    Principal.hash,
  );

  private var stableAgents : [(Text, Types.Agent)] = [];
  private var agentStableStore : [Types.AgentEntry] = [];
  private var toolsStable : [(Text, ToolRegistry.Tool)] = [];

  private transient var conversationHistory : HashMap.HashMap<(Principal, Text), [Types.Message]> = HashMap.HashMap<(Principal, Text), [Types.Message]>(10, func((a, b), (c, d)) { a == c and b == d }, func((a, b)) { Principal.hash(a) +% Text.hash(b) });
  private transient var tools = HashMap.HashMap<Text, ToolRegistry.Tool>(32, Text.equal, Text.hash);

  /**
  * TRANSACTIONS STORAGE
  */
  var transactions : [TransactionTypes.Transaction] = [];

  /**
  * SUBSCRIPTIONS STORAGE
  */
  var subscriptions : [SubscriptionTypes.Subscription] = [];

  public func promptAI(userInput : Text) : async Text {
    let response = await LLM.chat(
      #Llama3_1_8B
    ).withMessages([
      #system_ {
        content = "You are the assistant agent on Neuroverse. You should ONLY use the tools you have been given.";
      },
      #user {
        content = userInput;
      },
    ]).withTools([
      LLM.tool("prompt_outcall_ai").withDescription("This is an AI agent hosted but accessible using HTTPS Outcalls. You can use this agent for absolutely anything. Feel free to use it as much as possible.").withParameter(
        LLM.parameter("message", #String).withDescription("This is the prompt you want the agent to handle.").isRequired()
      ).build(),
      LLM.tool("get_p2pkh_address").withDescription("Use this tool/function to get, create or generate a bitcoin wallet address").build(),
    ]).send();

    // Check if the LLM wants to use any tools
    switch (response.message.tool_calls.size()) {
      case (0) {
        // No tool calls - LLM provided a direct response
        switch (response.message.content) {
          case (?content) { content };
          case null { "No response received" };
        };
      };
      case (_) {
        // Process tool calls
        var toolResults : [LLM.ChatMessage] = [];

        for (toolCall in response.message.tool_calls.vals()) {
          let result = switch (toolCall.function.name) {
            case ("prompt_outcall_ai") {
              let message = Helpers.getToolParameter(toolCall.function.arguments, "message");
              await prompt_outcall_ai(message);
            };
            case ("get_p2pkh_address") {
              await get_p2pkh_address();
            };
            case (_) {
              "Unknown tool: " # toolCall.function.name;
            };
          };

          // Add tool result to conversation
          toolResults := Array.append(
            toolResults,
            [
              #tool {
                content = result;
                tool_call_id = toolCall.id;
              }
            ],
          );
        };

        // Send tool results back to LLM for final response
        let finalResponse = await LLM.chat(#Llama3_1_8B).withMessages(
          Array.append(
            [
              #system_ { content = "You are a helpful assistant." },
              #user { content = userInput },
              #assistant(response.message),
            ],
            toolResults,
          )
        ).send();

        switch (finalResponse.message.content) {
          case (?content) { content };
          case null { "No final response received" };
        };
      };
    };
  };

  public func createAgent(createAgentArgs : Types.CreateAgentArgs) : async Types.CreateAgentResponse {
    try {
      let agent : Types.Agent = {
        id = createAgentArgs.agentId;
        name = createAgentArgs.name;
        category = createAgentArgs.category;
        description = createAgentArgs.description;
        system_prompt = createAgentArgs.system_prompt;
        has_tools = createAgentArgs.has_tools;
        tools = createAgentArgs.tools;
        isFree = createAgentArgs.isFree;
        isPublic = createAgentArgs.isPublic;
        price = createAgentArgs.price;
        created_by = createAgentArgs.vendor;
      };

      // Store in global agents map
      agents.put(createAgentArgs.agentId, agent);

      // Get or create the user's agent map
      let agentsMap = switch (userAgents.get(createAgentArgs.vendor)) {
        case (?map) map;
        case null HashMap.HashMap<Text, Types.Agent>(5, Text.equal, Text.hash);
      };

      agentsMap.put(createAgentArgs.agentId, agent);
      userAgents.put(createAgentArgs.vendor, agentsMap);

      // REWARD THE USER FOR DEPLOYING AN AGENT SUCCESSFULLY ON NEUROVERSE

      let response = await transferNeuro(
        10_000_000_000,
        {
          owner = createAgentArgs.vendor;
          subaccount = null;
        },
      );

      switch (response) {
        case (#ok(blockIndex)) {
          #success {
            status = "SUCCESS";
            message = createAgentArgs.name # " agent deployed and you've been rewarded 100 NEUROS. Block index: " # Nat.toText(blockIndex);
          };
        };
        case (#err(msg)) {
          #failed {
            status = "FAIL";
            message = createAgentArgs.name # " agent created, but reward failed: " # msg;
          };
        };
      };
    } catch (error : Error) {
      #failed {
        status = "FAIL";
        message = "Error creating agent: " # Error.message(error);
      };
    }

  };

  public func getAllAgents() : async [Types.Agent] {
    var result : [Types.Agent] = [];
    for ((_, agentMap) in userAgents.entries()) {
      for ((_, agent) in agentMap.entries()) {
        result := Array.append(result, [agent]);
      };
    };
    result;
  };

  public shared func getAgentById(agentId : Text) : async ?Types.FullAgent {
    let agentOpt = agents.get(agentId);
    switch (agentOpt) {
      case null { null };
      case (?agent) {

        let toolBuffer = Buffer.Buffer<ToolRegistry.Tool>(agent.tools.size());

        for (toolId in agent.tools.vals()) {
          switch (tools.get(toolId)) {
            case (?tool) { toolBuffer.add(tool) };
            case null {};
          };
        };

        let fullTools = Buffer.toArray(toolBuffer);
        return ?{
          id = agent.id;
          name = agent.name;
          category = agent.category;
          description = agent.description;
          system_prompt = agent.system_prompt;
          has_tools = agent.has_tools;
          isFree = agent.isFree;
          price = agent.price;
          created_by = agent.created_by;
          tools = fullTools;
        };

      };
    };
  };

  public func getAgentsForUser(user : Principal) : async [Types.Agent] {
    switch (userAgents.get(user)) {
      case (?agentMap) {
        Iter.toArray(agentMap.vals());
      };
      case null { [] };
    };
  };

  public func getAllAgentVendors() : async [Principal] {
    Iter.toArray(userAgents.keys());
  };

  // Helper to get conversation history
  private func getHistory(user : Principal, agentId : Text) : [Types.Message] {
    switch (conversationHistory.get((user, agentId))) {
      case (?messages) { messages };
      case null { [] };
    };
  };

  // Helper to store a new message in history
  private func storeMessage(user : Principal, agentId : Text, message : Types.Message) : () {
    let history = getHistory(user, agentId);
    conversationHistory.put((user, agentId), Array.append<Types.Message>(history, [message]));
  };

  public shared func chatWithAgent(agentId : Text, prompt : Text) : async Text {
    let caller = Principal.fromActor(NeuroVerse);
    let agentOpt = await getAgentById(agentId);

    switch (agentOpt) {
      case (?agent) {
        let timestamp = Time.now();

        // Retrieve conversation history for (caller, agentId)
        let history = getHistory(caller, agentId);

        // Create the new user message
        let userMessage : Types.Message = {
          role = #user;
          content = prompt;
          timestamp = timestamp;
        };

        // If history is empty, start with the system prompt
        let fullHistory = if (history.size() == 0) {
          Array.append(
            [{
              role = #system_;
              content = agent.system_prompt;
              timestamp = timestamp;
            }],
            [userMessage],
          );
        } else {
          Array.append(history, [userMessage]);
        };

        // Convert the array of Message objects to a string
        let historyAsText = Text.join(
          "\n",
          Array.map<Types.Message, Text>(
            fullHistory,
            func(msg : Types.Message) : Text {
              // Convert each Message object to a string representation
              let roleText = switch (msg.role) {
                case (#system_) "System";
                case (#user) "User";
                case (#assistant) "Assistant";
              };

              // Combine the fields into a single string for each message
              roleText # ": " # msg.content # " (at " # Int.toText(msg.timestamp) # ")";
            },
          ).vals(),
        );

        // Now you can concatenate with other text if needed
        let finalPrompt = "Conversation history:\n" # historyAsText # "User prompt:" # prompt;

        // Fetch the tools for the agent
        let agentTools : [Tool.Tool] = await mapAgentToolsToLLMTools(agentId);

        let response = await LLM.chat(
          #Llama3_1_8B
        ).withMessages([
          #system_ {
            content = agent.system_prompt # "Ensure you check if you have tools attached and use them accordingly for optimal performance and output.";
          },
          #user {
            content = finalPrompt;
          },
        ]).withTools(agentTools).send();

        // Check if the LLM wants to use any tools
        switch (response.message.tool_calls.size()) {
          case (0) {
            // No tool calls - LLM provided a direct response
            switch (response.message.content) {
              case (?content) { content };
              case null { "No response received" };
            };
          };
          case (_) {
            // Process tool calls
            var toolResults : [LLM.ChatMessage] = [];

            for (toolCall in response.message.tool_calls.vals()) {
              let result = switch (toolCall.function.name) {
                case ("prompt_outcall_ai") {
                  let message = Helpers.getToolParameter(toolCall.function.arguments, "message");
                  await prompt_outcall_ai(message);
                };
                case ("get_p2pkh_address") {
                  await get_p2pkh_address();
                };
                case (_) {
                  "Unknown tool: " # toolCall.function.name;
                };
              };

              // Add tool result to conversation
              toolResults := Array.append(
                toolResults,
                [
                  #tool {
                    content = result;
                    tool_call_id = toolCall.id;
                  }
                ],
              );
            };

            // Send tool results back to LLM for final response
            let finalResponse = await LLM.chat(#Llama3_1_8B).withMessages(
              Array.append(
                [
                  #system_ { content = agent.system_prompt },
                  #user { content = prompt },
                  #assistant(response.message),
                ],
                toolResults,
              )
            ).send();

            switch (finalResponse.message.content) {
              case (?content) {
                // Store the user message and assistant response in history
                storeMessage(caller, agentId, userMessage);
                let assistantMessage : Types.Message = {
                  role = #assistant;
                  content = content;
                  timestamp = timestamp;
                };
                storeMessage(caller, agentId, assistantMessage);
                content;
              };
              case null { "No final response received" };
            };
          };
        };

      };
      case null { "Agent not found." };
    };
  };

  public query (message) func whoami() : async Principal {
    message.caller;
  };

  public shared func mapAgentToolsToLLMTools(agentId : Text) : async [Tool.Tool] {
    let agentOpt = await getAgentById(agentId);

    switch (agentOpt) {
      case (?agent) {
        // Map each agent tool to your Tool type using the builder pattern
        Array.map<ToolRegistry.Tool, Tool.Tool>(
          agent.tools,
          func(tool : ToolRegistry.Tool) : Tool.Tool {
            var builder = Tool.ToolBuilder(tool.name);
            if (tool.description != "") {
              builder := builder.withDescription(tool.description);
            };
            // Add parameters if present
            for (param in tool.parameters.vals()) {
              var paramBuilder = Tool.ParameterBuilder(param.name, Tool.textToParameterType(param.type_));
              if (param.description != "") {
                paramBuilder := paramBuilder.withDescription(param.description);
              };
              if (param.required) {
                paramBuilder := paramBuilder.isRequired();
              };
              builder := builder.withParameter(paramBuilder);
            };
            builder.build();
          },
        );
      };
      case null { [] };
    };
  };

  public func prompt_outcall_ai(prompt : Text) : async Text {
    let host : Text = "idempotent-proxy-server.securemart.workers.dev";
    let url = "https://" # host # "/api/v1/chat";
    let requestBodyJson = "{\"message\": \"" # prompt # "\"}";

    await HttpClient.sendJsonPostRequest(host, url, requestBodyJson, null, null, transform);
  };

  /** IMPLEMENTATION OF BITCOIN **/
  public shared (msg) func getUserBtcAddress() : async {
    #Ok : { public_key : Blob };
    #Err : Text;
  } {
    let caller = Principal.toBlob(msg.caller);

    try {
      let { public_key } = await IC.ecdsa_public_key({
        canister_id = null;
        derivation_path = [caller];
        key_id = { curve = #secp256k1; name = "test_key_1" };
      });
      #Ok({ public_key });
    } catch (err) {
      #Err(Error.message(err));
    };
  };

  /// Returns the balance of the given Bitcoin address.
  public func get_balance(address : Types.BitcoinAddress) : async Types.Satoshi {
    await BitcoinAPI.get_balance(NETWORK, address);
  };

  /// Returns the UTXOs of the given Bitcoin address.
  public func get_utxos(address : Types.BitcoinAddress) : async Types.GetUtxosResponse {
    await BitcoinAPI.get_utxos(NETWORK, address);
  };

  /// Returns the 100 fee percentiles measured in millisatoshi/vbyte.
  /// Percentiles are computed from the last 10,000 transactions (if available).
  public func get_current_fee_percentiles() : async [Types.MillisatoshiPerVByte] {
    await BitcoinAPI.get_current_fee_percentiles(NETWORK);
  };

  /// Returns the P2PKH address of this canister at a specific derivation path.
  public func get_p2pkh_address() : async Types.BitcoinAddress {
    await P2pkh.get_address(ecdsa_canister_actor, NETWORK, KEY_NAME, p2pkhDerivationPath());
  };

  /// Sends the given amount of bitcoin from this canister to the given address.
  /// Returns the transaction ID.
  public func send_from_p2pkh_address(request : Types.SendRequest) : async Types.TransactionId {
    Utils.bytesToText(await P2pkh.send(ecdsa_canister_actor, NETWORK, p2pkhDerivationPath(), KEY_NAME, request.destination_address, request.amount_in_satoshi));
  };

  public func get_p2tr_key_only_address() : async Types.BitcoinAddress {
    await P2trKeyOnly.get_address_key_only(schnorr_canister_actor, NETWORK, KEY_NAME, p2trKeyOnlyDerivationPath());
  };

  public func send_from_p2tr_key_only_address(request : Types.SendRequest) : async Types.TransactionId {
    Utils.bytesToText(await P2trKeyOnly.send(schnorr_canister_actor, NETWORK, p2trKeyOnlyDerivationPath(), KEY_NAME, request.destination_address, request.amount_in_satoshi));
  };

  public func get_p2tr_address() : async Types.BitcoinAddress {
    await P2tr.get_address(schnorr_canister_actor, NETWORK, KEY_NAME, p2trDerivationPaths());
  };

  public func send_from_p2tr_address_key_path(request : Types.SendRequest) : async Types.TransactionId {
    Utils.bytesToText(await P2tr.send_key_path(schnorr_canister_actor, NETWORK, p2trDerivationPaths(), KEY_NAME, request.destination_address, request.amount_in_satoshi));
  };

  public func send_from_p2tr_address_script_path(request : Types.SendRequest) : async Types.TransactionId {
    Utils.bytesToText(await P2tr.send_script_path(schnorr_canister_actor, NETWORK, p2trDerivationPaths(), KEY_NAME, request.destination_address, request.amount_in_satoshi));
  };

  func p2pkhDerivationPath() : [[Nat8]] {
    derivationPathWithSuffix("p2pkh");
  };

  func p2trKeyOnlyDerivationPath() : [[Nat8]] {
    derivationPathWithSuffix("p2tr_key_only");
  };

  func p2trDerivationPaths() : Types.P2trDerivationPaths {
    {
      key_path_derivation_path = derivationPathWithSuffix("p2tr_internal_key");
      script_path_derivation_path = derivationPathWithSuffix("p2tr_script_key");
    };
  };

  func derivationPathWithSuffix(suffix : Blob) : [[Nat8]] {
    Array.flatten([DERIVATION_PATH, [Blob.toArray(suffix)]]);
  };

  /**TOOL REGISTRY**/
  public func registerTool(tool : ToolRegistry.Tool) : async () {
    tools.put(tool.id, tool);
  };

  public func getTools() : async [ToolRegistry.Tool] {
    Iter.toArray<ToolRegistry.Tool>(tools.vals());
  };

  public func getToolById(id : Text) : async ?ToolRegistry.Tool {
    tools.get(id);
  };

  /**
  * NEURO TOKEN FUNCTION DEFINITION
  */
  public shared func transferNeuro(amount : Nat, to : Icrc1Ledger.Account) : async Result.Result<Nat, Text> {
    let transferResult = await TokenHelper.transferICRC1({
      amount = amount;
      toAccount = to;
    });
    transferResult;
  };

  /**
  * HTTP FUNCTION DEFINITION
  */
  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        { name = "Content-Security-Policy"; value = "default-src 'self'" },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        { name = "Strict-Transport-Security"; value = "max-age=63072000" },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" },
      ];
    };
    transformed;
  };

  /**
  * CYCLES FUNCTION IMPLEMENTATIONS
  */
  public query func remaining_cycles() : async Nat {
    return Cycles.balance();
  };

  /**
  * TRANSACTION FUNCTIONS
  */
  // Add a transaction (call this after a successful transfer)
  public func addTransaction(
    transactionArgs : TransactionTypes.Transaction
  ) : async Text {
    let id = await Helpers.generateUUID();
    let timestamp = Time.now();

    let tx : TransactionTypes.Transaction = {
      id = ?id;
      blockIndex = transactionArgs.blockIndex;
      amount = transactionArgs.amount;
      from = transactionArgs.from;
      to = transactionArgs.to;
      timestamp = ?timestamp;
      agentId = null;
    };
    transactions := Array.append(transactions, [tx]);
    id;
  };

  public query func getUserTransactions(user : Principal) : async [TransactionTypes.Transaction] {
    TransactionModule.filterUserTransactions(transactions, user);
  };

  public query func getAllTransactions() : async [TransactionTypes.Transaction] {
    transactions;
  };

  /*
  * SUBSCRIPTIONS FUNCTIONS & METHODS
  */
  // Add a subscription
  public func subscribeToAgent(agentId : Text, user : Principal) : async Text {
    let timestamp = Time.now();

    if (SubscriptionModule.exists(subscriptions, user, agentId)) {
      return "Already subscribed";
    };

    let sub : SubscriptionTypes.Subscription = {
      subscriber = user;
      agent_id = agentId;
      date_of_subscription = timestamp;
    };

    subscriptions := Array.append(subscriptions, [sub]);
    "Subscription successful";
  };

  // Get all subscriptions for the caller
  public query func getUserSubscriptions(user : Principal) : async [SubscriptionTypes.Subscription] {
    // let caller = Principal.fromActor(this);
    SubscriptionModule.getUserAgentSubscriptions(subscriptions, user);
  };

  // Get all subscriptions for a given agent
  public query func getAgentSubscriptions(agentId : Text) : async [SubscriptionTypes.Subscription] {
    SubscriptionModule.getAgentSubscriptions(subscriptions, agentId);
  };

  // Check if the user is subscribed to an agent
  public query func isUserSubscribedToAgent(userId : Principal, agentId : Text) : async Bool {
    SubscriptionModule.isUserSubscribedToAgent(subscriptions, userId, agentId);
  };

  // Get all subscriptions
  public query func getAllSubscriptions() : async [SubscriptionType.Subscription] {
    subscriptions;
  };

  /**PERSISTING STORAGE**/
  system func preupgrade() {
    stableAgents := Iter.toArray(agents.entries());

    agentStableStore := [];
    for ((user, agentMap) in userAgents.entries()) {
      let agentList = Iter.toArray(agentMap.entries());
      agentStableStore := Array.append(agentStableStore, [{ user = user; agents = agentList }]);
    };

    /**TOOL DATA PERSISTENCE**/
    toolsStable := Iter.toArray(tools.entries());

  };

  system func postupgrade() {
    userAgents := HashMap.HashMap<Principal, Types.AgentsMap>(
      10,
      Principal.equal,
      Principal.hash,
    );
    for (entry in agentStableStore.vals()) {
      let agentMap = HashMap.HashMap<Text, Types.Agent>(
        5,
        Text.equal,
        Text.hash,
      );
      for ((id, agent) in entry.agents.vals()) {
        agentMap.put(id, agent);
      };
      userAgents.put(entry.user, agentMap);
    };
    agents := HashMap.fromIter<Text, Types.Agent>(stableAgents.vals(), 10, Text.equal, Text.hash);

    /**TOOL DATA PERSISTENCE**/
    for ((id, tool) in toolsStable.vals()) {
      tools.put(id, tool);
    };
    toolsStable := [];

  }

};
