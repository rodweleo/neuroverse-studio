import Principal "mo:base/Principal";
import Array "mo:base/Array";

persistent actor Token {
  // Reference to the ICRC-1 ledger canister using centralized config
  transient let ledger = actor ("uzt4z-lp777-77774-qaabq-cai") : actor {
    icrc1_name : () -> async Text;
    icrc1_symbol : () -> async Text;
    icrc1_decimals : () -> async Nat8;
    icrc1_total_supply : () -> async Nat;
    icrc1_fee : () -> async Nat;
    icrc1_metadata : () -> async [(Text, Value)];
    icrc1_balance_of : (Account) -> async Nat;
  };

  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };

  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : [Nat8];
  };

  public type TokenInfo = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Nat;
    fee : Nat;
  };

  public type BalanceInfo = {
    principal_id : Text;
    balance : Nat;
  };

  public func get_token_info() : async TokenInfo {
    let name = await ledger.icrc1_name();
    let symbol = await ledger.icrc1_symbol();
    let decimals = await ledger.icrc1_decimals();
    let total_supply = await ledger.icrc1_total_supply();
    let fee = await ledger.icrc1_fee();

    {
      name = name;
      symbol = symbol;
      decimals = decimals;
      total_supply = total_supply;
      fee = fee;
    };
  };

  // Check balance of a specific principal
  public func check_balance(principal_id : Text) : async BalanceInfo {
    try {
      let principal_obj = Principal.fromText(principal_id);
      let account : Account = {
        owner = principal_obj;
        subaccount = null;
      };

      let balance = await ledger.icrc1_balance_of(account);

      {
        principal_id = principal_id;
        balance = balance;
      };
    } catch (_) {
      // Return zero balance for invalid principals
      {
        principal_id = principal_id;
        balance = 0;
      };
    };
  };

  // Get multiple balances at once
  public func check_multiple_balances(principals : [Text]) : async [BalanceInfo] {
    var results : [BalanceInfo] = [];

    for (principal_id in principals.vals()) {
      let balance_info = await check_balance(principal_id);
      results := Array.append(results, [balance_info]);
    };

    results;
  };
};
