import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

module TransactionTypes {
  public type Transaction = {
    id : ?Text;
    blockIndex : Nat;
    amount : Nat;
    from : Principal;
    to : Principal;
    agentId : ?Text;
    timestamp : ?Int;
  };
};
