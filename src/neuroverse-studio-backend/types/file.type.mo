import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module FileType {
  public type File = {
    id : Text;
    filename : Text;
    content_type : Text;
    encrypted_data : Blob;
    owner : Principal;
    whitelist : [Principal];
    created_at : Int;
    updated_at : Int;
    size : Nat;
  };

  public type FileInfo = {
    id : Text;
    filename : Text;
    content_type : Text;
    owner : Principal;
    whitelist : [Principal];
    created_at : Int;
    updated_at : Int;
    size : Nat;
    can_access : Bool;
  };

  public type CreateFileRequest = {
    filename : Text;
    content_type : Text;
    encrypted_data : Blob;
    whitelist : [Principal];
  };

  public type UpdateWhitelistRequest = {
    document_id : Text;
    whitelist : [Principal];
  };

};
