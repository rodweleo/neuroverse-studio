import Icrc1Ledger "canister:icrc1_ledger_canister";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";

module {
  public type TransferArgs = {
    amount : Nat;
    toAccount : Icrc1Ledger.Account;
  };

  public func transferICRC1(args : TransferArgs) : async Result.Result<Icrc1Ledger.BlockIndex, Text> {
    Debug.print(
      "Transferring "
      # debug_show (args.amount)
      # " tokens to account"
      # debug_show (args.toAccount)
    );

    let nowNs64 : Nat64 = Nat64.fromIntWrap(Time.now());
    let transferArgs : Icrc1Ledger.TransferArg = {
      memo = null;
      amount = args.amount;
      from_subaccount = null;
      fee = null;
      to = args.toAccount;
      created_at_time = ?nowNs64;
    };

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
