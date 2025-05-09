---
sidebar_position: 100
---

# Rust Components

## Creating a basic component

> Note: Some of these steps are taken from https://github.com/bytecodealliance/wit-bindgen

This example will create a simple Slipway component in rust which reverses a string.

### Initial Setup
If you don't already have it, add the `wasm32-wasip2` target:
```sh
rustup target add wasm32-wasip2
```

Create a folder for your component:
```sh
mkdir slipway_example
cd slipway_example
```

Create a new rust library:
```sh
cargo init --lib .
```

Add `wit-bindgen` as a dependency by executing:
```sh
cargo add wit-bindgen
```

For our example we'll also add `serde` and `serde_json`:
```sh
cargo add serde --features serde_derive
cargo add serde_json
```

In order to compile a WASI dynamic library, the following must be added to the `Cargo.toml` file:
```toml
[lib]
crate-type = ["cdylib"]
```

Copy the Slipway `.wit` file to the `wit` folder:
```sh
mkdir wit
slipway wit > wit/slipway.wit
```

Generate bindings from the `.wit` file and implement the component in `src/lib.rs`:
```rust
wit_bindgen::generate!({
    world: "slipway",
});

struct Component;

export!(Component);

impl Guest for Component {
    fn run(input: String) -> Result<String, ComponentError> {
        slipway_host::log_info("Hello world!");
        Ok(input)
    }
}
```

### Implementing the Example
Next we'll add some logic which will deserialize the input, convert the string contained in the input to uppercase, and serialize it as the component output. The entire file will look like this:

```rust
use std::fmt::Display;

use serde::{Deserialize, Serialize};

wit_bindgen::generate!({
    world: "slipway",
});

struct Component;

export!(Component);

impl Guest for Component {
    fn run(input_string: String) -> Result<String, ComponentError> {
	    // Deserialize the input.
        let input: Input = serde_json::from_str(&input_string)
            .map_err(|e| ComponentError::new("Failed to deserialize input.", e))?;

		// Example of logging through the host.
        slipway_host::log_info(&format!("Formatting: {}", input.text));

		// Create the output.
        let output = Output {
            text_uppercase: input.text.to_uppercase(),
        };

		// Serialize the output.
        let output_string = serde_json::to_string(&output)
            .map_err(|e| ComponentError::new("Failed to serialize output.", e))?;

		// Return the output.
        Ok(output_string)
    }
}

#[derive(Deserialize)]
struct Input {
    text: String,
}

#[derive(Serialize)]
struct Output {
    text_uppercase: String,
}

// Helper function to make creating a new ComponentError easier.
impl ComponentError {
    fn new(message: &str, error: impl Display) -> Self {
        ComponentError {
            message: message.to_string(),
            inner: vec![error.to_string()],
        }
    }
}
```

Build the component targeting `wasm32-wasip2`:
```sh
cargo build --target wasm32-wasip2 --release
```

### Bundling as a Slipway Component
Create a Slipway Component JSON configuration file `slipway_component.json`:
```json
{
  "publisher": "acme",
  "name": "example",
  "description": "An example slipway component.",
  "version": "0.0.1",
  "input": {
    "properties": {
      "text": { "type": "string" }
    }
  },
  "output": {
    "properties": {
      "text_reversed": { "type": "string" }
    }
  }
}
```

For the purposes of the example, we've set the publisher to `acme` and the component name to `example`.

This file uses [JsonTypeDef](https://jsontypedef.com/) to state that the component should take as an input an object with a text field containing a string, and output an object containing a `text_reversed` field which contains a string. This matches the `Input` and `Output` structs in the rust code.

Slipway will use these definitions validate the inputs and outputs to ensure the component only receives the data it expects, and only outputs the expected data. It is also possible to use [JSON Schema](https://json-schema.org/).

Assemble the component in a folder:
```sh
mkdir -p components/component
cp target/wasm32-wasip2/release/slipway_example.wasm components/component/run.wasm
cp slipway_component.json components/component/slipway_component.json
```

Package the component folder into a file:
```
slipway package components/component
```

You should see an output similar to:
```
INFO Written component tar file to: components/acme.example.0.0.1.tar
```

This `.tar` file is the final component.

### Automating the Build/Assemble/Package steps
To make it easier to iterate, let's create a shell script which handles the building, assembling and packaging.

Create a file called `build.sh`:
```sh
touch build.sh
chmod +x build.sh
```

Add the shell commands we already ran above to `build.sh`, with an additional line to clean the components folder each time.:
```sh
cargo build --target wasm32-wasip2 --release
rm -rf components
mkdir -p components/component
cp target/wasm32-wasip2/release/slipway_example.wasm components/component/run.wasm
cp slipway_component.json components/component/slipway_component.json
slipway package components/component
```

Run `build.sh` to ensure it all works:
```
./build.sh
```

### Running the component
We can create a simple Slipway Rig that provides the component with an input.

Create a file called `rig.json` which contains the following JSON:
```json
{
  "publisher": "acme",
  "name": "example_rig",
  "version": "0.0.1",
  "description": "Calls the example component",
  "rigging": {
    "example": {
      "component": "file:components/acme.example.0.0.1.tar",
      "input": {
        "text": "Hello World!"
      }
    }
  }
}  
```

Run the rig:
```sh
slipway run rig.json --allow-local-components
```

You should see some output, which will end with:
```
Component "example" output:
{
  "text_uppercase": "HELLO WORLD!"
}
```

In the above rig we referenced the component using a local file URL `file:components/acme.example.0.0.1.tar`. While this is convenient, in the long run it can be better to reference the components as we would if they were deployed to a Slipway Registry.

Here I've changed the component reference to a registry reference:
```json
{
  "publisher": "acme",
  "name": "example_rig",
  "version": "0.0.1",
  "description": "Calls the example component",
  "rigging": {
    "example": {
      "component": "acme.example.0.0.1",
      "input": {
        "text": "Hello World!"
      }
    }
  }
}  
```

To run this we have to change the `slipway` command slightly to:
- Tell Slipway to use a local registry, and the format of that registry.
- Allow registry components, rather than local components.

```sh
slipway run rig.json --registry file:components/{publisher}.{name}.{version}.tar --allow-registry-components
```

Slipway will try any registries supplied on the command line in order, and ultimately will fall back to the default Slipway registry. This allows us to test local components as if they were deployed, with minimal changes to our rigs once the components have actually been deployed.

If you add `--log-level debug` to the list of arguments you will see some extra debug output showing where the components are being loaded from.

Local registries are particularly useful while developing multiple components, for example you could specify the registry URL as:
```sh
--registry file:../slipway_{name}/components/{publisher}.{name}.{version}.tar
```

The above will cause Slipway to find components in their respective project folders, searching from the parent folder.
