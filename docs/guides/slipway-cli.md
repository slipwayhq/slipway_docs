---
sidebar_position: 10
---

# Slipway CLI

Most of the functionality of the Slipway CLI is documented on other pages.
Where appropriate, this page will simply link you to the more detailed documentation.

All commands will display additional help using the `--help` argument, for example:
```
slipway run --help
```

### `slipway run`

Runs the specified Rig. See the [Running Rigs](/docs/basics/running-rigs) page for more information.

### `slipway debug`

Debugs the specified Rig. See the [Debugging Rigs](/docs/guides/debugging-rigs) page for more information.

### `slipway run-component`

Runs the specified Component by wrapping it in a Rig.

:::tip
This is very useful for quickly testing a component:
```sh
slipway run-component "slipwayhq.fetch.0.5.0" --allow-http --input "{ \"text\": { \"ip\": \"https://icanhazip.com/\" } }"
```

If you omit the `--input` argument you'll be prompted for an input, which can be easier for large JSON structures.
:::

### `slipway debug-component`

Debugs the specified Component by wrapping it in a Rig.
Similar to `run-component`, but opens the wrapped component in the debugger.
See the [Debugging Rigs](/docs/guides/debugging-rigs) page for more information.

### `slipway init-component`

Creates a default configuration for a Component. This can be a useful starting point when creating Components.

### `slipway init-rig`

Creates a default configuration for a Rig. This can be a useful starting point when creating Rigs.

### `slipway serve`

Starts the built-in HTTP server for hosting Rigs.
Note that this command has a number of additional sub-commands.
See the [Serving Rigs](/docs/basics/serving-rigs) page for more information.

### `slipway package`

Takes a Component located in a folder and packages it up into a TAR file with an appropriate name.
This is the simple way of [manually packaging Components](/docs/advanced-guides/manually-packaging-components).

### `slipway clear-component-cache`

When Slipway downloads a remote Component (either from a Registry or an HTTP url), it caches the Component
in the `~/.slipway/components` folder.

The next time the Component is used, it will be used from the cache rather than downloaded again.

Running `slipway clear-component-cache` will delete all of the files in the cache directory, forcing
all remote Components to be downloaded again the next time they are used.

### `slipway generate-key`

Generate a long, random key, suitable for use as an API key or for the SLIPWAY_SECRET environment variable.

### `slipway hash`

Hashes the supplied string using the same algorithm that Slipway uses internally for hashing API keys.
This can be useful for manually adding API keys to the Slipway Serve configuration.
See the [Serving Rigs](/docs/basics/serving-rigs) page for more information.

### `slipway wit`

Prints the Slipway WebAssembly Interface Type file to the console. This can be useful when creating WASM Components.
