import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module SubscriptionTypes {
  public type Subscription = {
    subscriber : Principal;
    agent_id : Text;
    date_of_subscription : Time.Time;
  };
};
