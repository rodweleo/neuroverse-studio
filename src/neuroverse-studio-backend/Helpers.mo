import Types "Types";
import Principal "mo:base/Principal";
import UUID "mo:idempotency-keys/idempotency-keys";
import Random "mo:core/Random";

module Helpers {
  public func getToolParameter(arguments : [Types.ToolCallArgument], paramName : Text) : Text {
    for (arg in arguments.vals()) {
      if (arg.name == paramName) {
        return arg.value;
      };
    };
    " ";
  };

  public func derivePathFromUserId(userId : Principal) : [Blob] {
    [Principal.toBlob(userId)];
  };

  public func generateUUID() : async Text {
    let seed = await Random.blob();
    UUID.generateV4(seed);
  };
};
