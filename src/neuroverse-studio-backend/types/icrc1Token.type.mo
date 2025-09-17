import Icrc1Ledger "canister:icrc1_ledger_canister";

module Icrc1TokenType {
  public type TransferOutcome = {
    status : Text;
    timestamp : Int;
    message : Text;
    error_code : ?Nat;
  };

  public type TransferArgs = {
    from_subaccount : ?Icrc1Ledger.Subaccount; // optional subaccount (Blob, 32 bytes)
    to : Icrc1Ledger.Account; // recipient account
    amount : Nat; // token amount (in smallest units)
    fee : ?Nat; // optional fee; null => default fee
    memo : ?Blob; // optional memo
    created_at_time : ?Nat64; // optional client timestamp (ns)
  };
};
