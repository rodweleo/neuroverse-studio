import Nat "mo:base/Nat";

module UtilsModule {
  public func convertToNativeFormat(num : Nat, decimals : Nat) : Nat {
    let multiplier = Nat.pow(10, decimals);
    let native_price = num * multiplier;
    return native_price;
  };
};
