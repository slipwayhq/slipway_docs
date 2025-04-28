---
sidebar_position: 35
---

# Host API

The Host API can be accessed from Javascript through the global `slipway_host` object,
and from Rust through the generated `slipway_host` module.

For other languages which compile to WASM, access will be through the code generated from the
`slipway.wit` file (viewable using the `slipway wit` command).

All calls to the Host API are checked on the host side to ensure the component has the appropriate
permissions to perform the action being invoked.

## Logging

The Host API provides methods for logging at the following levels: `error`, `warn`, `info`, `debug`, `trace`.

### Javascript

You can log from the standard `console` methods:
```js
console.error("This is an error.");
console.warn("This is a warning.");
console.log("This is information.");
console.debug("This is debug information.");
console.trace("This is trace information.");
```

Or directly through the `slipway_host` object:
```js
slipway_host.log_error("This is an error.");
slipway_host.log_warn("This is a warning.");
slipway_host.log_log("This is information.");
slipway_host.log_debug("This is debug information.");
slipway_host.log_trace("This is trace information.");
```

### Rust (WASM)

The WIT file defines the following methods:
```wit
log-trace: func(message: string);
log-debug: func(message: string);
log-info: func(message: string);
log-warn: func(message: string);
log-error: func(message: string);
```

From Rust you can access these through the generated `slipway_host` module:
```rust
slipway_host::log_error("This is an error.");
slipway_host::log_warn("This is a warning.");
slipway_host::log_info("This is information.");
slipway_host::log_debug("This is debug information.");
slipway_host::log_trace("This is trace information.");
```

## Fetch

The Host API provides separate fetch methods for fetching binary or text content.

The fetch method, based on the URL format, provides a universal interface for fetching the following data:
- HTTP requests (e.g. `https://example.com/foo.txt`)
- Local files (e.g. `file:../data/foo.txt`)
- Environment variables (e.g. `env://FOO_BAR`)
- Files contained in the current or other components (e.g. `component://svg_icons/foo.svg`, where `svg_icons` is a [Component Handle](/docs/basics/terminology#component-handle))
- The responses of executing components (e.g. `component://noise?width=100&height=100`)

This overloading can be quite powerful.
It allows components to take URLs as inputs, fetch them, and process the response without
knowing whether the response came from an HTTP server, a file, or was generated 
dynamically by another component.

However the shape of the fetch API is optimized for HTTP requests, which can make it less convenient
if you know that you just want to, for example, fetch an environment variable.

The Host API therefore also provides more specialized methods to these other actions, 
which will be discussed shortly.

### Errors

Any general errors performing the fetch action will result in an error being returned
(thrown in Javascript, or as a `Result::Err` variant in Rust), and the error's
`response` field will be empty.

Any error status codes will also result in an error being returned
(thrown in Javascript, or as a `Result::Err` variant in Rust), and the error's
`response` field will contain the response from the server (with the body parsed as text).

In both cases the error will also contain a `message` field containing the error message,
and an `inner` field containing a list of strings representing any inner error messages.

In addition, the fetch operation will error if the component does not have the appropriate
permissions.

### Javascript

The fetch methods take an optional `requestOptions`, whose fields are also optional:
```js
const requestOptions = {
    headers: { "content-type": "application/json" },
    method: "GET",
    body: '{ "a": 1 }',
    timeout_ms: 1000,
};
```

Fetching text:
```js
const response = await slipway_host.fetch_text(url, requestOptions);
console.log(response.status_code);
console.log(response.body); // `body` is a `string`.
console.log(response.headers); // `headers` is a list of [string, string] tuples
```

Fetching binary data:
```js
const response = await slipway_host.fetch_bin(url, requestOptions);
console.log(response.status_code);
console.log(response.body); // `body` is a `Uint8Array`.
console.log(response.headers); // `headers` is a list of [string, string] tuples
```

We also provide a basic polyfill for the standard Javascript `fetch` API:
```js
const response = await fetch(url);
const type = response.headers.get("content-type");
if (type === "image/svg+xml" || type === "application/svg+xml") {
    return response.text();
}
return response.arrayBuffer();
```

### Rust (WASM)

The fetch methods take an optional `requestOptions`, whose fields are also optional:

```rust
let request_options = slipway_host::RequestOptions {
    headers: Some(vec![("content-type", "application/json")]),
    method: Some("GET".to_string()),
    body: Some("{ \"a\": 1 }".to_string().into_bytes()),
    timeout_ms: Some(1000),
};
```

Fetching text:
```rust
let response = slipway_host::fetch_text(&url, Some(&request_options))?;
dbg!(response.status_code);
dbg!(response.headers); // `headers` is a `Vec<(String, String)>`
dbg!(response.body); // `body` is a String
```

Fetching binary data:
```rust
let response = slipway_host::fetch_bin(&url, Some(&request_options))?;
dbg!(response.status_code);
dbg!(response.headers); // `headers` is a `Vec<(String, String)>`
dbg!(response.body); // `body` is a Vec<u8>
```

## Environment Variables

### Javascript

The `env` method never fails, and returns `null` if either the environment variable
doesn't exist or if the component doesn't have permission to access it.

```js
const env = slipway_host.env("FOO_BAR");
```

Alternatively, using `fetch_text`:
```js
const response = await slipway_host.fetch_text("env://FOO_BAR");
const env = response.body;
```

### Rust

The `env` method never fails, and returns `None` if either the environment variable
doesn't exist or if the component doesn't have permission to access it.

```rust
let env = slipway_host::env("FOO_BAR");
```

Alternatively, using `fetch_text`:
```rust
let response = slipway_host::fetch_text("env://FOO_BAR", None)?;
let env = response.body;
```

## Component Files

Two methods are provided, `load_text` and `load_bin`, which each
take two arguments: a [Component Handle](/docs/basics/terminology#component-handle) and
a file path to the file within the component.

### Errors

Loading a component file will error if the file does not exist, or if the component
does not have appropriate permissions.

### Javascript

```js
const svg = await slipway_host.load_text("icons", "foo.svg");
const png = await slipway_host.load_bin("icons", "foo.png");
```

Alternatively, using the Fetch API:

```js
const text_response = await slipway_host.fetch_text("component://icons/foo.svg");
const svg = text_response.body;
const bin_response = await slipway_host.fetch_bin("component://icons/foo.png");
const png = bin_response.body;
```

## Run Components

Components can be run programmatically using the `run` method. This method
takes two arguments: a [Component Handle](/docs/basics/terminology#component-handle) and
the input data for the component. 


Only components listed in the component's `callouts` can be run
(see the [Rigs page](/docs/basics/rigs#riggingcallouts)) and the [Components page](/docs/basics/components#callouts)
for more information).

### Errors

The `run` method will error if either the component handle isn't found, or the calling
component doesn't have the appropriate permissions, or if the component being run errors.

### Javascript

```js
const result = await slipway_host.run("increment", { value: 1 });
```

Alternatively, using the Fetch API:
```js
const response = await slipway_host.fetch_text("component://increment?value=1");
const output = JSON.parse(response.body);
```

In the above example we take advantage of a feature where, when running a component,
the query string parameters are automatically converted into a JSON structure and passed in
as the component input.

For more complex input data, we can use the request body:
```js
const response = await slipway_host.fetch_text(
    "component://increment",
    { body: JSON.stringify({ value: 1 }) });
const output = JSON.parse(response.body);
```

You can also combine the two approaches, in which case the query string parameters are applied
to the given body.

The query string parameters can contain periods and array indices, for example
`component://increment?a.b[1].c[2]=1`, or even wildcards, for example
`component://increment?a.b[*].c[2]=1` to apply values to every item at the given
path in the supplied body.

### Rust

```rust
let result = slipway_host::run(
    "increment",
    &serde_json::to_string(&json!({ value: 1 })).unwrap(),
)?;
```

See the Javascript examples for examples of using the Fetch API to run.

## Fonts

Fonts can be queries using the `font` method. This method takes one argument
which is the font stack string.

### Javascript

If none of the requested fonts are found, or the component does not have permission to
access them, then `null` is returned.

```js
let font_result = await slipway_host.font("Helvetica, Arial, sans-serif");
if (font_result) {
    console.log(font_result.family) // The name of the font resolved from the stack.
    console.log(font_result.data) // Data is a Uint8Array.
}
```

### Rust

```rust
let maybe_resolved_font = slipway_host::font("Helvetica, Arial, sans-serif");
if let Some(resolved_font) = maybe_resolved_font {
    dbg!(resolved_font.family); // The name of the font resolved from the stack.
    dbg!(resolved_font.data); // Data is a Vec<u8>.
}
```

## Binary Encoding and Decoding

The `encode_bin` and `decode_bin` methods allow you to encode binary data as a string
decode it again.

It is most often used when you need to store binary data in the output of a component,
as encoding it as a string is more efficient than representing it as a numeric array in JSON.

Currently encoding uses base64, but this should not be relied upon and may change between
Slipway versions. For example Slipway could in future cache the binary data and return a short ID
to it.

### Javascript

```js
const encoded = slipway_host.encode_bin([1, 2, 3]); // Input can be a Uint8Array or number[]
const decoded = slipway_host_decode_bin(encoded); // Output is a Uint8Array
```

### Rust

```rust
let encoded = slipway_host::encode_bin(&vec![1, 2, 3]);
let decoded = slipway_host::decode_bin(&encoded);
```

