import Time "mo:base/Time";
import Principal "mo:base/Principal";

module SubscriptionTypes {
  public type Subscription = {
    user : Principal;
    agentId : Nat;
    timestamp : Time.Time;
  };
};
