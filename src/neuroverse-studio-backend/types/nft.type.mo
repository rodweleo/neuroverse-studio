import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";

module NFTType {
  public type NFTInitArgs = {
    symbol : ?Text;
    name : ?Text;
    description : ?Text;
    logo : ?Text;
    supply_cap : ?Nat;
    // add other optional fields as needed (allow_transfers, max_* etc.)
    enable_icrc37 : Bool; // whether to enable approvals
    enable_icrc3 : Bool; // whether to enable tx logs
  };

  public type NFTInput = {
    url : Text; // e.g., image/json URL
    mime : Text; // e.g., "image/png" or "application/json"
    name : Text;
    description : Text;
  };
};
