import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import ToolType "../types/tool.type";

module ToolModule {

  public func getToolById(
    tools : HashMap.HashMap<Text, ToolType.Tool>,
    id : Text,
  ) : ?ToolType.Tool {
    tools.get(id);
  };

  // Recursive helper to process tool rewards
  // public func rewardTools(
  //   toolIds : [Text],
  //   tools : HashMap.HashMap<Text, ToolType.Tool>,
  //   amount : Nat,
  // ) : async () {
  //   if (toolIds.size() == 0) return;
  //   let id = toolIds[0];
  //   switch (getToolById(tools, id)) {
  //     case (?tool) {
  //       let transferResult = await TokenHelper.transferICRC1({
  //         amount = amount;
  //         toAccount = {
  //           owner = tool.creator;
  //           subaccount = null;
  //         };
  //       });
  //       // Optionally handle transferResult here, e.g., log errors
  //     };
  //     case null {};
  //   };
  //   let toolIdsArray = Iter.toArray(toolIds.values());
  //   await rewardTools(Array.slice<Text>(toolIds, 1, toolIds.size()), tools, amount);
  // };

};
