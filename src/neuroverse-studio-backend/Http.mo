import Nat16 "mo:base/Nat16";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Types "./Types";

module Http {
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    url : Text;
    method : Text;
    body : [Nat8];
    headers : [HeaderField];
  };

  public type HttpResponse = {
    body : [Nat8];
    headers : [HeaderField];
    status_code : Nat16;
    streaming_strategy : ?StreamingStrategy;
  };

  public type StreamingStrategy = {
    #Callback : {
      token : StreamingCallbackToken;
      callback : shared () -> async ();
    };
  };

  public type StreamingCallbackToken = {
    key : Text;
    content_encoding : Text;
    index : Nat;
    sha256 : ?[Nat8];
  };

  public type StreamingCallbackHttpResponse = {
    body : [Nat8];
    token : ?StreamingCallbackToken;
  };

  public type HttpHeader = {
    name : Text;
    value : Text;
  };

  public type HttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformArgs = {
    response : HttpResponsePayload;
    context : Blob;
  };

  public type CanisterHttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public query func transform(raw : TransformArgs) : async CanisterHttpResponsePayload {
    let transformed : CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        {
          name = "Content-Security-Policy";
          value = "default-src 'self'";
        },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        {
          name = "Strict-Transport-Security";
          value = "max-age=63072000";
        },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" },
      ];
    };
    transformed;
  };
};
