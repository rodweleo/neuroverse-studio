import Array "mo:base/Array";
import SubscriptionType "../types/subscription.type";
import Principal "mo:base/Principal";

module SubscriptionModule {

  // Check if a subscription already exists
  public func exists(subs : [SubscriptionType.Subscription], subscriber : Principal, agentId : Text) : Bool {
    Array.find<SubscriptionType.Subscription>(subs, func(s) { s.subscriber == subscriber and s.agent_id == agentId }) != null;
  };

  // Get all subscriptions for a user
  public func getUserAgentSubscriptions(subs : [SubscriptionType.Subscription], subscriber : Principal) : [SubscriptionType.Subscription] {
    Array.filter<SubscriptionType.Subscription>(subs, func(s) { s.subscriber == subscriber });
  };

  // Get all subscriptions for an agent
  public func getAgentSubscriptions(subs : [SubscriptionType.Subscription], agentId : Text) : [SubscriptionType.Subscription] {
    Array.filter<SubscriptionType.Subscription>(subs, func(s) { s.agent_id == agentId });
  };

  public func isUserSubscribedToAgent(
    subs : [SubscriptionType.Subscription],
    userId : Principal,
    agentId : Text,
  ) : Bool {
    Array.find<SubscriptionType.Subscription>(subs, func(s) { s.subscriber == userId and s.agent_id == agentId }) != null;
  };
};
