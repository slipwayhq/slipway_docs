---
sidebar_position: 40
---

# Running Rigs

If you followed the [Create Your First Rig](/docs/getting-started/create-your-first-rig.md) page, you will already have
used the Slipway CLI to run a simple Rig.

The command you use to run Rigs on the command line is:

```sh
slipway run
```

Running the command above as-is will display the help for the command, explaining all the arguments.

## `--allow-*` and `--deny-*`

Many of the arguments start with `--allow-` or `--deny-`, and these are all for specifying Rig permissions.
See the [Permissions](/docs/basics/permissions) page for more detail about all these arguments, although
the help text itself may be sufficient.

For example:
```sh
--allow-fonts --allow-files-within "./data" --deny-files-within "./data/secrets" --allow-registry-components
```

Or for Rigs which you trust, you can specify:
```sh
--allow-all
```

:::warning
Don't use `--allow-all` on Rigs you have downloaded from the internet without thoroughly investigating
what those rigs are actually doing.
:::

## `--log-level`

This specifies logging level for the Slipway CLI and any Components which are run.
The valid options are, from most verbose to least:
- `trace`
- `debug`
- `info` (the default level)
- `warn`
- `error`

For example:
```sh
--log-level debug
```

## `--registry-url`

The Slipway CLI will always fall back to resolving Components from the Slipway Component Registry (https://registry.slipway.co/).

However it has also been designed to make it as simple as possible to host your own Component registries, 
either on the local file system or with a simple HTTP server.

The `--registry-url` argument can be specified zero or more times to include additional paths or URLs to search for Components.
They will be searched in the order given, until the Component is found, before falling back to the default registry.

See the [Component Registries](/docs/guides/component-registries#custom-component-registries) page for more information.

## `--fonts`

The Slipway CLI will by default search your system fonts when resolving font stacks for Components.

The `--fonts` argument allows you to also specify a local folder to search for fonts.

For example:

```
--fonts ./extra_fonts
```

## `--output`

By default the `slipway run` command will output the result of any leaf-node components to the console, including images.

:::info
A leaf-node Component is a Component whose output is not used as the input to any other Component.
:::

If you want the outputs saved to a file instead, you can use the `--output` argument to specify 
an output folder to which of all leaf-node Component outputs should be saved.

For example:
```
--output ./rig_outputs
```

## `--output-debug-rig`

The Slipway CLI contains a `slipway debug` command which allows you to step through
Rigs, viewing and modifying each Component's input and output.

More information about this can be found on the [Debugging Rigs](/docs/guides/debugging-rigs) page.

However sometimes you don't want to manually step through each Component in a large Rig, or perhaps the Component
you want to investigate is [within the rigging of another Component](/docs/basics/components#rigging), which makes it is opaque to the debugger.

The `--output-debug-rig` argument allows you to output a new Rig which is the flattened version of the
Rig being run.

For every Component executed, including those within Fragments (or nested Fragments), the new rig will contain
a distinct handle to that Component with the input set to the fully resolved input of the Component in the running Rig.

You can then run `slipway debug` on this generated debug Rig and execute any single Component directly, as if you had
already stepped through all the preceding components in the original Rig.

For example:
```sh
--output-debug-rig my_debug_rig.json
```

