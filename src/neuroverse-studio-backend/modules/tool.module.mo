import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import ToolType "../types/tool.type";
import Icrc1TokenType "../types/icrc1Token.type";
import Principal "mo:base/Principal";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Icrc1Ledger "canister:icrc1_ledger_canister";
import Icrc1TokenModule "../modules/icrc1Token.module";

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

  public func processBatchTransfers(
    principals : [Principal],
    amount : Nat,
  ) : async [Icrc1TokenType.TransferOutcome] {

    let buf = Buffer.Buffer<Icrc1TokenType.TransferOutcome>(principals.size());

    var idx : Nat = 0;
    while (idx < principals.size()) {
      let to : Icrc1Ledger.Account = {
        owner = principals[idx];
        subaccount = null;
      };

      let nowNs64 : Nat64 = Nat64.fromIntWrap(Time.now());
      let transferArgs : Icrc1Ledger.TransferArg = {
        from_subaccount = null;
        to = to;
        amount = amount;
        fee = null;
        memo = null;
        created_at_time = ?nowNs64;
      };

      let res = await Icrc1TokenModule.transferIcrcTokenToAccount(transferArgs);
      let outcome : Icrc1TokenType.TransferOutcome = switch (res) {
        case (#ok blockIndex) {
          {
            status = "ok";
            timestamp = Time.now();
            message = "blockIndex=" # Nat.toText(blockIndex);
            error_code = null;
          };
        };
        case (#err errMsg) {
          {
            status = "err";
            timestamp = Time.now();
            message = errMsg;
            error_code = null;
          };
        };
      };

      buf.add(outcome);
      idx += 1;
    };

    return Buffer.toArray<Icrc1TokenType.TransferOutcome>(buf);
  };
};
