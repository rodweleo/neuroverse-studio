import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module VetkeysType {

  public type VetKDPublicKeyResult = {
    #Ok : { public_key : Blob };
    #Err : Text;
  };

  public type VetKDDeriveKeyResult = {
    #Ok : { encrypted_key : Blob };
    #Err : Text;
  };

  public type VetKDCurve = { #bls12_381_g2 };
  public type VetKDKeyId = { curve : VetKDCurve; name : Text };
  public type VetKDPublicKeyArgs = {
    canister_id : ?Principal;
    context : Blob;
    key_id : VetKDKeyId;
  };
  public type VetKDDeriveKeyArgs = {
    input : Blob;
    context : Blob;
    key_id : VetKDKeyId;
    transport_public_key : Blob;
  };
  public type VETKD_API = actor {
    vetkd_public_key : (VetKDPublicKeyArgs) -> async { public_key : Blob };
    vetkd_derive_key : (VetKDDeriveKeyArgs) -> async { encrypted_key : Blob };
  };
};
