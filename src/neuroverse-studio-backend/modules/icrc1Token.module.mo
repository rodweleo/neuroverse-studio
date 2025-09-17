import Icrc1TokenType "../types/icrc1Token.type";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Icrc1Ledger "canister:icrc1_ledger_canister";

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
};
