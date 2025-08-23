import Curves "mo:bitcoin/ec/Curves";
import HashMap "mo:base/HashMap";
import ToolRegistry "ToolRegistry";

module Types {
  public type Agent = {
    id : Text;
    name : Text;
    category : Text;
    description : Text;
    system_prompt : Text;
    has_tools : Bool;
    tools : [Text];
    isFree : Bool;
    isPublic : Bool;
    price : Nat;
    created_by : Principal;
  };
  public type FullAgent = {
    id : Text;
    name : Text;
    category : Text;
    description : Text;
    system_prompt : Text;
    has_tools : Bool;
    tools : [ToolRegistry.Tool];
    isFree : Bool;
    price : Nat;
    created_by : Principal;
  };
  public type AgentEntry = {
    user : Principal;
    agents : [(Text, Agent)];
  };
  public type Message = {
    role : { #user; #assistant; #system_ };
    content : Text;
    timestamp : Int;
  };
  public type Conversation = {
    conversation_id : Text;
    llm_id : Text;
    messages : [Message];
  };
  public type File = {
    name : Text;
    content : Blob;
    contentType : Text;
    uploadedAt : Nat64;
  };

  public type Property = {
    type_ : Text;
    name : Text;
    description : ?Text;
    enum_ : ?[Text];
  };
  public type Parameters = {
    type_ : Text;
    properties : ?[Property];
    required : ?[Text];
  };
  public type Function = {
    name : Text;
    description : ?Text;
    parameters : ?Parameters;
  };
  public type Tool = {
    #function : Function;
  };
  public type Tokens = {
    e8s : Nat64;
  };

  public type ToolCallArgument = {
    name : Text;
    value : Text;
  };

  public type SendRequest = {
    destination_address : Text;
    amount_in_satoshi : Satoshi;
  };

  public type ECDSAPublicKeyReply = {
    public_key : Blob;
    chain_code : Blob;
  };

  public type EcdsaKeyId = {
    curve : EcdsaCurve;
    name : Text;
  };

  public type EcdsaCurve = {
    #secp256k1;
  };

  public type SignWithECDSAReply = {
    signature : Blob;
  };

  public type ECDSAPublicKey = {
    canister_id : ?Principal;
    derivation_path : [Blob];
    key_id : EcdsaKeyId;
  };

  public type SignWithECDSA = {
    message_hash : Blob;
    derivation_path : [Blob];
    key_id : EcdsaKeyId;
  };

  public type SchnorrKeyId = {
    algorithm : SchnorrAlgorithm;
    name : Text;
  };

  public type SchnorrAlgorithm = {
    #bip340secp256k1;
  };

  public type SchnorrPublicKeyArgs = {
    canister_id : ?Principal;
    derivation_path : [Blob];
    key_id : SchnorrKeyId;
  };

  public type SchnorrPublicKeyReply = {
    public_key : Blob;
    chain_code : Blob;
  };

  public type SignWithSchnorrArgs = {
    message : Blob;
    derivation_path : [Blob];
    key_id : SchnorrKeyId;
    aux : ?SchnorrAux;
  };

  public type SchnorrAux = {
    #bip341 : {
      merkle_root_hash : Blob;
    };
  };

  public type SignWithSchnorrReply = {
    signature : Blob;
  };

  public type Satoshi = Nat64;
  public type MillisatoshiPerVByte = Nat64;
  public type Cycles = Nat;
  public type BitcoinAddress = Text;
  public type BlockHash = [Nat8];
  public type Page = [Nat8];

  public let CURVE = Curves.secp256k1;

  /// The type of Bitcoin network the dapp will be interacting with.
  public type Network = {
    #mainnet;
    #testnet;
    #regtest;
  };

  /// The type of Bitcoin network as defined by the Bitcoin Motoko library
  /// (Note the difference in casing compared to `Network`)
  public type NetworkCamelCase = {
    #Mainnet;
    #Testnet;
    #Regtest;
  };

  public func network_to_network_camel_case(network : Network) : NetworkCamelCase {
    switch (network) {
      case (#regtest) {
        #Regtest;
      };
      case (#testnet) {
        #Testnet;
      };
      case (#mainnet) {
        #Mainnet;
      };
    };
  };

  /// A reference to a transaction output.
  public type OutPoint = {
    txid : Blob;
    vout : Nat32;
  };

  /// An unspent transaction output.
  public type Utxo = {
    outpoint : OutPoint;
    value : Satoshi;
    height : Nat32;
  };

  /// A request for getting the balance for a given address.
  public type GetBalanceRequest = {
    address : BitcoinAddress;
    network : Network;
    min_confirmations : ?Nat32;
  };

  /// A filter used when requesting UTXOs.
  public type UtxosFilter = {
    #MinConfirmations : Nat32;
    #Page : Page;
  };

  /// A request for getting the UTXOs for a given address.
  public type GetUtxosRequest = {
    address : BitcoinAddress;
    network : Network;
    filter : ?UtxosFilter;
  };

  /// The response returned for a request to get the UTXOs of a given address.
  public type GetUtxosResponse = {
    utxos : [Utxo];
    tip_block_hash : BlockHash;
    tip_height : Nat32;
    next_page : ?Page;
  };

  /// A request for getting the current fee percentiles.
  public type GetCurrentFeePercentilesRequest = {
    network : Network;
  };

  public type SendTransactionRequest = {
    transaction : [Nat8];
    network : Network;
  };

  public type EcdsaSignFunction = (EcdsaCanisterActor, Text, [Blob], Blob) -> async Blob;

  /// Actor definition to handle interactions with the ECDSA canister.
  public type EcdsaCanisterActor = actor {
    ecdsa_public_key : ECDSAPublicKey -> async ECDSAPublicKeyReply;
    sign_with_ecdsa : SignWithECDSA -> async SignWithECDSAReply;
  };

  public type SchnorrSignFunction = (SchnorrCanisterActor, Text, [Blob], Blob, ?SchnorrAux) -> async Blob;

  /// Actor definition to handle interactions with the Schnorr canister.
  public type SchnorrCanisterActor = actor {
    schnorr_public_key : SchnorrPublicKeyArgs -> async SchnorrPublicKeyReply;
    sign_with_schnorr : SignWithSchnorrArgs -> async SignWithSchnorrReply;
  };

  public type P2trDerivationPaths = {
    key_path_derivation_path : [[Nat8]];
    script_path_derivation_path : [[Nat8]];
  };

  public type AgentsMap = HashMap.HashMap<Text, Types.Agent>;
  public type TransactionId = Text;

  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    url : Text;
    method : Text;
    body : [Nat8];
    headers : [HeaderField];
  };

  public type HttpResponse = {
    body : [Nat8];
    headers : [HeaderField];
    status_code : Nat16;
    streaming_strategy : ?StreamingStrategy;
  };

  public type StreamingStrategy = {
    #Callback : {
      token : StreamingCallbackToken;
      callback : shared () -> async ();
    };
  };

  public type StreamingCallbackToken = {
    key : Text;
    content_encoding : Text;
    index : Nat;
    sha256 : ?[Nat8];
  };

  public type StreamingCallbackHttpResponse = {
    body : [Nat8];
    token : ?StreamingCallbackToken;
  };

  public type HttpHeader = {
    name : Text;
    value : Text;
  };

  public type HttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformArgs = {
    response : HttpResponsePayload;
    context : Blob;
  };

  public type CanisterHttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type HttpMethod = {
    #get;
    #post;
    #head;
    #delete;
    #options;
    #put;
  };

  public type TransformRawResponseFunction = {
    function : shared query TransformArgs -> async HttpResponsePayload;
    context : Blob;
  };

  public type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [HttpHeader];
    body : ?[Nat8];
    method : HttpMethod;
    transform : ?TransformRawResponseFunction;
    is_replicated : ?Bool;
  };

  public type TransformContext = {
    function : shared query TransformArgs -> async HttpResponsePayload;
    context : Blob;
  };

  public type IC = actor {
    http_request : HttpRequestArgs -> async HttpResponsePayload;
  };

  /**
  * AGENT TYPES
  */
  public type CreateAgentArgs = {
    agentId : Text;
    name : Text;
    category : Text;
    description : Text;
    system_prompt : Text;
    isFree : Bool;
    isPublic : Bool;
    price : Nat;
    vendor : Principal;
    has_tools : Bool;
    tools : [Text];
  };
  public type CreateAgentResponse = {
    #success : { status : Text; message : Text };
    #failed : { status : Text; message : Text };
  };
};
