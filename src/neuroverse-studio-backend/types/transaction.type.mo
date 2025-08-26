import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

module TransactionTypes {
  public type Transaction = {
    id : Nat;
    amount : Nat;
    from : Principal;
    to : Principal;
    agentId : Nat;
    timestamp : Time.Time;
  };
};
