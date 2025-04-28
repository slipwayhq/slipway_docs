---
sidebar_position: 20
---

# Rigs

A Slipway Rig has two main purposes:

- It composes together Components in a way that generates a useful output.
- It assigns permissions to Components, giving them controlled escape hatches from their sandbox.

It does both of these things through a simple JSON configuration file, which is named after the Rig (e.g. `my_rig.json`).

At the top level, the Rig file looks like this:

```json
{
    "description": "...",
    "constants": {
        // ...
    },
    "rigging": {
        // ...
    }
}
```

We'll go through each of these properties.

## `description`

Optional. The description is just a simple textual description of what the Rig does.
It is only there to help users who are looking at the Rig.

## `constants`

Optional. This can contain any arbitrary data structure.
It is a convenient place to put static data which will be required by multiple Components.

## `rigging`

This is the main part of the Rig, where components are composed.
It is a map from [__Component Handle__](/docs/basics/terminology#component-handle) to the rigging for that component.

```json
{
    "description": "...",
    "constants": {
        // ...
    },
    "rigging": {
        "component_one": {
            // ...
        },
        "component_two": {
            // ...
        },
        // ...        
    }
}
```

The Component Handles can be anything you like, but must consist of only lowercase alphanumeric characters and underscores.
The handles are used to refer to each component within the rigging.

The Component Rigging for a given Component Handle is structured as follows:

```json
"component_one": {
    "component": "...",
    "input": {
        // ...
    },
    "allow": [
        // ...
    ],
    "deny": [
       // ...
    ],
    "callouts": {
       // ...
    }
}
```

### `rigging.*.component`

This is the [Component Reference](/docs/basics/terminology#component-reference), which uniquely identifies which component should be
loaded and executed.

### `rigging.*.input`

The input is where you specify what data should be passed into the Component.

It is arbitrary JSON but with one important feature: At any point in the structure you can specify specially formatted [JSONPath](https://en.wikipedia.org/wiki/JSONPath) queries which 
will be substituted for actual data at runtime.

In the folowing example `component_two`:
- Requests data from the output of `component_one` using the query `$.rigging.component_one.output`.
- Requests the value of the constant `$.constants.foo`.

```json
{
    "description": "...",
    "constants": {
        "foo": 123
    },
    "rigging": {
        "component_one": {
            "component": "...",
            "input": {
                "value": 1
            }
        },
        "component_two": {
            "component": "...",
            "input": {
                "foo": "$.constants.foo",
                "bar": "$.rigging.component_one.output",
            }
        },
        // ...        
    }
}
```

The queries are standard JSONPath syntax, with some minor changes for convenience:

- Queries starting with `$.` will return exactly one value, and will error if either no values or multiple values are found.
- Queries starting with `$?` will return zero or one values, and error if multiple values are found. If no values are found the property is omitted.
- Queries starting with `$*` will return zero or more values, as an array.

Queries for a Component's output, of the form `$.rigging.<component_handle>.output`, are so common that we provide a `$$` shortcut syntax of `$$.<component_handle>`.

So the following are equivalent:
- `$.rigging.component_one.output`
- `$$.component_one`

As are these:
- `$?rigging.component_one.output.foo[0].bar`
- `$$?component_one.foo[0].bar`


#### Component Execution Order

Slipway uses the inputs of each Component to determine the required execution order so that it 
can fully resolve each Component's input just before it executes.

If any cycles are detected between components, the Rig will fail with an error before it runs.

In the above example, Slipway will determine that it must execute `component_one` before `component_two`, so that the JSONPath
query in `component_two` can be resolved.

### `rigging.*.allow` and `rigging.*.deny`

By default Components are sandboxed can only operate on their inputs to generate their outputs. They cannot interact with the external environment, such as
making HTTP requests, or accessing files, fonts or environment variables.

This allows you to run Components written by other people, confident they aren't accessing your files or calling home when they execute.

However the Rig can give Components permissions to do these things using the `allow` field, and revoke granted permissions using the `deny` field.

For example, to allow a component to access to the `AWS_DEFAULT_REGION` environment variable, you would specify:
```json
{
    "allow": [
        { "permission": "env", "exact": "AWS_DEFAULT_REGION" }
    ]
}
```

To allow a component to access to all environment variables starting with `AWS_`, you would specify:
```json
{
    "allow": [
        { "permission": "env", "prefix": "AWS_" }
    ]
}
```

To allow a component to access to everything except local files and environment variables:
```json
{
    // ...
    "allow": [
        { "permission": "all" }
    ],
    "deny": [
        { "permission": "files" },
        { "permission": "env" }
    ]
}
```

:::warning
The `all` permissions should be used with caution, and probably only on Components you've authored yourself.
:::

For complete documentation on permissions, see the [Permissions](/docs/basics/permissions) page.

#### Trusting Rigs

The permissions specified in Rigs allow you to trust Components, by granting them access only to the resources they need to do their job.
But what about Rigs? If you've downloaded a Rig from the internet, how do you know it's not giving components too many permissions?

Obviously you could inspect the Rig yourself, and indeed this is good practice. However, Rigs themselves are also sandboxed by default.

Essentially a Rig can only pass on permissions the Rig itself has been given.
If the Rig hasn't been given permissions to access environment variables, then no components executed within that Rig are able to access environment
variables either.

You give Rigs permissions either on the command line when [running](/docs/basics/running-rigs) `slipway run`,
or in the `slipway_serve.json` configuration file when [hosting Rigs](/docs/basics/serving-rigs).

For complete documentation on permissions, see the [Permissions](/docs/basics/permissions) page.

### `rigging.*.callouts`

Some Components will, during their execution, call other Components.
All Component references that could be called by a Component must be declared in advance so that Slipway can resolve all references before execution starts.

This is often done in the Component's configuration file.
However sometimes the Component itself won't know what other Components it will be required to call,
in which case they can be specified in the Rigging instead.

The callout for a given Component Handle is structured as follows:

```json
"callout_handle_one": {
    "component": "...",
    "allow": [
        // ...
    ],
    "deny": [
       // ...
    ],
}
```

The `component`, `allow` and `deny` fields are the same as those defined for a component in the rigging above.
See the [component](#riggingcomponent), [allow and deny](#riggingallow-and-riggingdeny) sections for more information.

:::info[Example]

The `slipwayhq.render` component can call other rendering components (such as chart renderers) during execution.
It passes them the exact width and height they should render to perfectly embed the result into the final output canvas.

However it only finds out which Components it needs to call at runtime when analyzing its input.
It therefore cannot declare all possible Component references within the `render` Component's configuration file.

Instead, if you wanted the `slipwayhq.render` Component to embed a chart rendered using the `slipwayhq.echarts` Component
in the output, you would need to declare something like the following in the Component rigging:

```json
{
    // ...
    "callouts": {
        "echarts": {
            "component": "slipwayhq.echarts.1.0.0",
            "allow": [
                { "permission": "fonts" }
            ]
        }
    }
}
```

See the [Render Component](/docs/standard-components/render-component) page for more details.

:::

## An Example Rig

What does this all look like in practice? Here is a real Rig I've been running to display my house solar and battery data on a
TRMNL eInk screen:

```json
{
  "description": "Renders GivEnergy data with ECharts",
  "rigging": {
    "ge": {
      "component": "jamesthurley.givenergy_cloud.0.0.1",
      "allow": [
        { "permission": "http", "prefix":"https://api.givenergy.cloud/" },
        { "permission": "env", "prefix":"GIVENERGY_" }
      ],
      "input": {}
    },
    "render": {
      "component": "slipwayhq.echarts.0.0.1",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components", "publisher": "slipwayhq", "name": "svg" },
        { "permission": "registry_components", "publisher": "slipwayhq", "name": "echarts_svg" }
      ],
      "input": {
        "width": 800,
        "height": 480,
        "chart": "$$.ge.chart",
        "theme": {
          "backgroundColor": "#FFF"
        }
      }
    }
  }
}  
```

In this case my custom `jamesthurley.givenergy_cloud` Component fetches solar and battery data and
outputs an ECharts chart definition, which is then rendered by the `slipwayhq.echarts` Component.

