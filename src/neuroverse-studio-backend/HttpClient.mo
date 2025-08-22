import Types "./Types";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module {

  // Type aliases for better readability
  type IC = Types.IC;
  type HttpMethod = Types.HttpMethod;
  type HttpHeader = Types.HttpHeader;
  type HttpRequestArgs = Types.HttpRequestArgs;
  type HttpResponsePayload = Types.HttpResponsePayload;
  type TransformContext = Types.TransformContext;
  type CanisterHttpResponsePayload = Types.CanisterHttpResponsePayload;

  // Default cycles amount for HTTP requests
  let DEFAULT_CYCLES : Nat = 20_949_972_000;

  // Helper function to create default headers
  func createDefaultHeaders(host : Text) : [HttpHeader] {
    [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "motoko_http_client" },
      { name = "Content-Type"; value = "application/json" },
    ];
  };

  // Helper function to extract host from URL
  func extractHost(url : Text) : Text {
    let withoutProtocol = switch (Text.stripStart(url, #text("https://"))) {
      case (?t) t;
      case null switch (Text.stripStart(url, #text("http://"))) {
        case (?t2) t2;
        case null url;
      };
    };
    let parts = Iter.toArray(Text.split(withoutProtocol, #char('/')));
    if (parts.size() > 0) parts[0] else withoutProtocol;
  };

  // Helper function to merge headers (custom headers override defaults)
  func mergeHeaders(defaultHeaders : [HttpHeader], customHeaders : ?[HttpHeader]) : [HttpHeader] {
    switch (customHeaders) {
      case null { defaultHeaders };
      case (?custom) { Array.append(defaultHeaders, custom) };
    };
  };

  // Helper function to convert Text to [Nat8]
  func textToNat8Array(text : Text) : [Nat8] {
    let blob = Text.encodeUtf8(text);
    Blob.toArray(blob);
  };

  // Helper function to convert [Nat8] to Text
  func nat8ArrayToText(bytes : [Nat8]) : Text {
    switch (Text.decodeUtf8(Blob.fromArray(bytes))) {
      case null { "Error: Unable to decode response" };
      case (?text) { text };
    };
  };

  // Core HTTP request function
  func makeHttpRequest(
    url : Text,
    method : HttpMethod,
    body : ?Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {

    let ic : IC = actor ("aaaaa-aa");
    let host = extractHost(url);
    let defaultHeaders = createDefaultHeaders(host);
    let finalHeaders = mergeHeaders(defaultHeaders, headers);
    let cyclesAmount = switch (cycles) { case null DEFAULT_CYCLES; case (?c) c };

    let requestBody : ?[Nat8] = switch (body) {
      case null null;
      case (?bodyText) ?textToNat8Array(bodyText);
    };

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    let httpRequest : HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = finalHeaders;
      body = requestBody;
      method = method;
      transform = ?transform_context;
    };

    let httpResponse : HttpResponsePayload = await (with cycles = cyclesAmount) ic.http_request(httpRequest);

    nat8ArrayToText(httpResponse.body);
  };

  // Public function for GET requests
  public func sendGetRequest(
    url : Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    await makeHttpRequest(url, #get, null, headers, cycles, transform);
  };

  // Public function for POST requests
  public func sendPostRequest(
    url : Text,
    body : Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    await makeHttpRequest(url, #post, ?body, headers, cycles, transform);
  };

  // Public function for PUT requests
  public func sendPutRequest(
    url : Text,
    body : Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    await makeHttpRequest(url, #put, ?body, headers, cycles, transform);
  };

  // Public function for DELETE requests
  public func sendDeleteRequest(
    url : Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    await makeHttpRequest(url, #delete, null, headers, cycles, transform);
  };

  // Advanced function with custom transform
  public func sendRequestWithTransform(
    url : Text,
    method : HttpMethod,
    body : ?Text,
    headers : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    await makeHttpRequest(url, method, body, headers, cycles, transform);
  };

  // Convenience function for JSON POST requests
  public func sendJsonPostRequest(
    host : Text,
    url : Text,
    jsonBody : Text,
    additionalHeaders : ?[HttpHeader],
    cycles : ?Nat,
    transform : shared query Types.TransformArgs -> async Types.HttpResponsePayload,
  ) : async Text {
    let jsonHeaders = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "gen_ai_api_canister" },
      { name = "Content-Type"; value = "application/json" },
    ];

    let finalHeaders = switch (additionalHeaders) {
      case null ?jsonHeaders;
      case (?additional) ?Array.append(jsonHeaders, additional);
    };

    await sendPostRequest(url, jsonBody, finalHeaders, cycles, transform);
  };
};
