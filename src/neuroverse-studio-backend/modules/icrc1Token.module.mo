import Icrc1TokenType "../types/icrc1Token.type";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Icrc1Ledger "canister:icrc1_ledger_canister";
import Principal "mo:base/Principal";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";

module Icrc1TokenModule {

  public func transferIcrcTokenToAccount(transferArgs : Icrc1TokenType.TransferArgs) : async Result.Result<Nat, Text> {
    Debug.print(
      "Transferring "
      # debug_show (transferArgs.amount)
      # " tokens to account"
      # debug_show (transferArgs.to)
    );

    try {
      let transferResult = await Icrc1Ledger.icrc1_transfer(transferArgs);

      switch (transferResult) {
        case (#Err(transferError)) {
          return #err("Couldn't transfer funds:\n" # debug_show (transferError));
        };
        case (#Ok(blockIndex)) { return #ok blockIndex };
      };
    } catch (error : Error) {
      return #err("Reject message: " # Error.message(error));
    };
  };

  public func processBatchIcrc1TokenTransfers(
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
