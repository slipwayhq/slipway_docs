---
sidebar_position: 30
---

# Components

A Slipway Component takes an input JSON structure and produces an output JSON structure.

Components can be written in either Javascript or any language that compiles to WASM.
Languages have different strengths and weaknesses, as do their ecosystems.
With Slipway you can mix and match.

Components are [sandboxed](/docs/basics/permissions) by default and cannot do anything except execute their own
code and access their own input unless given additional permissions.

With appropriate permissions they become much more powerful, as we'll describe below.

A component is structured as either a folder or a TAR file that contains a `slipway_component.json` configuration file,
and any other supporting files required for the Component's execution, such as a `run.js` or a `run.wasm` file.

## Configuration

Components are configured through their `slipway_component.json` file. This file has the following structure:

```json
{
  "publisher": "...",
  "name": "...",
  "version": "...",
  "description": "...",
  "input": {
    // ...
  },
  "output": {
    // ...
  },
  "callouts": {
    // ...
  },
  "rigging": {
    // ...    
  }
  "constants": {
    // ...
  },
}
```

### `publisher`, `name`, `version`

Together these fields identify a Component. The format of a Component Reference in a [Component Registry](/docs/guides/component-registries.md)
is `publisher.name.version`.

Both `publisher` and `name` must consist of only lowercase alphanumeric characters plus underscore.

#### The Slipway Component Registry

The Slipway Component Registry is a thin wrapper over GitHub Releases.
By following a simple convention with your `publisher`, `name` and `version` fields,
and your GitHub repository name and release names, your Components will be automatically available for anyone to
use through the Slipway Component Registry when published on GitHub.

See [here](/docs/guides/component-registries#slipway-component-registry) for more information.

### `description`

The description can contain a short description of what your component does.

### `input` and `output`

These fields specify schemas used to validate the input and output data of your components.

If you wish to allow any input, or any output, then you can set the appropriate field to an empty object:
```json title="Allow any data"
  "input": {},
  "output": {}
```

However, providing an input schema not only gives you a guarantee that the
data is in the format you expect before your code is executed, but will also give your users better error messages if they provide data in the wrong format. This is especially important if your component is written in a dynamically typed language such as Javascript.

Providing an output schema is useful for ensuring that your Component's code is doing what you expect.

#### JsonTypeDef or JSON Schema
You can use either [JsonTypeDef](https://jsontypedef.com/) or [JSON Schema](https://json-schema.org/) to define your schemas.

If the schema contains a root field `$schema` with a value containing the `json-schema.org` domain, it is assumed to be JSON Schema.
Otherwise it is assumed to be JsonTypeDef.

JsonTypeDef is simpler, and has better defaults, and is the recommended one to use. JSON Schema has more advanced options but is
more complex and error-prone.

#### Examples

Let's say you wanted to specify that your output contained a single `value` field which contains an integer. The `value` field is required, and
no other fields will be present. It may look something like this:

```json title="Sample Output"
{
    "value": 123
}
```

The JsonTypeDef schema would be defined as:
```json title="JsonTypeDef"
  "output": {
    "properties": {
      "value": {
        "type": "int32"
      }
    }
  }
```

The JSON Schema would be defined as:
```json title="JSON Schema"
  "output": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "value": {
        "type": "integer"
      }
    },
    "required": ["value"],
    "additionalProperties": false
  },
```

With JSON Schema you can also use $ref to refer to other schemas within the Component, for example:

```json title="slipway_component.json"
  "output": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "output_schema.json"
  },
```
```json title="output_schema.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "value": {
      "type": "integer"
    }
  },
  "required": ["value"],
  "additionalProperties": false
}
```

You cannot refer to schemas outside of the component (for example, using URLs).
This is because what constitutes valid data for a component should be fixed with the version of the Component,
and referencing external schemas could cause validation to change over time.
However you can download these schemas and release them as part of your component instead.

### `callouts`

As mentioned on the [Rigs page](/docs/basics/rigs#riggingcallouts), some Components will, during their execution, call other Components.

If the Components that will be called are known in advance then they can be specified here, and do not need to be specified in the Rig.

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
See the [component](/docs/basics/rigs#riggingcomponent), 
[allow and deny](/docs/basics/rigs#riggingallow-and-riggingdeny) sections for more information.

For example if your Component calls out to the `slipwayhq.echarts` Component you might specify:

```json
  "callouts": {
    "echarts": {
      "component": "slipwayhq.echarts.0.5.1",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    }
  }
```

In the above example the [Component Handle](/docs/basics/terminology#component-handle) `echarts` has been given to the reference
`slipwayhq.echarts.1.0.0`. With this specified, the Component will be able to use the [Host API](/docs/basics/host-api) to execute
the Component using its handle.

Note that the Component itself will still need to be [granted permission](/docs/basics/permissions.md) to use these components by the Rig.

### `rigging`

A Component can contain it's own rigging in addition to, or instead of, code to run.
This rigging behaves similarly to the rigging of a [Rig](/docs/basics/rigs).
The Component's code, if any, is executed first, followed by the rigging.

If the Component contains rigging, then the [output schema](#input-and-output) should reflect the output
of the rigging, as it is the result of executing the rigging which is returned from the Component.

The rigging can access the Component's input through a virtual component handle called `input`.
For example the query `$.input.width` would fetch the value of the input `width` property.

The rigging can access the result of the Component's `run` function through the `run` property
on the `input` virtual component handle.
For example the query `$.input.run.width` would access the `width` property from the result that was
returned by the Component's `run` function.

:::info[Example]
A common pattern is where a Component's `run` function fetches, formats and returns some data, 
and the rigging then passes that data through an appropriate renderer to produce a [Canvas](/docs/guides/canvases).

For example, the Component's `run` function may fetch solar data for a house and output an
[ECharts definition](https://echarts.apache.org/examples/en/index.html).
The Component's rigging will then pass the resulting ECharts definition through to the 
[`slipwayhq.echarts`](https://github.com/slipwayhq/slipway_echarts) Component,
so that the Component returns a rendered chart.
:::

### `constants`

Optional. This can contain any arbitrary data structure.

It is a convenient place to put static data which will be referenced by multiple Components
within the Component's own rigging.


## The Host API

There are two ways components can get access to useful information:

The first is to pass the information in as part of its input JSON structure. A simple data processing Component would typically access its data in this way.

The second is to request data from the [Slipway Host](/docs/basics/terminology#slipway-host) using the [Host API](/docs/basics/host-api).
The Host API contains a restricted set of APIs which allow a Component to request data from the outside world.
However, every request is checked against a chain of permissions to ensure the Component is allowed to make the requests it's trying to make.

The Host API enables components to make HTTP requests, access local files, read local environment variables, query local fonts, and even run other Components.
_But only if given permission to do so_.
We will talk about the Host API more in the next section.


## Types of Component

Currently Slipway supports four types of Component:
- Special Components
- Fragment Components
- Javascript Components
- WASM Components

### Special Components
These not very interesting, but included for completeness. 
They comprise of `sink`, which takes any input and produces no output, and `passthrough` which takes any
input and passes it straight through to the output. 
Special components are built-in and can be referenced by just their name (e.g. `sink` and `passthrough`).


### Fragment Components
A Fragment Component has no executable code, but instead just specifies some rigging. It is a "fragment" of a complete Rig.

It allows you to bundle multiple Components together into a single Component.

Within the rigging, a Fragment Component input comes from an implicit Component with the Handle `input`, and the output of the Fragment
will be the output of the Component with the Handle `output`.

:::info[Example]
The [`slipwayhq.echarts`](https://github.com/slipwayhq/slipway_echarts) Component takes an
[ECharts definition](https://echarts.apache.org/examples/en/index.html) as an input and returns 
a rendered chart as an output. However internally it is a Fragment Component which rigs together two other Components:

- First it passes the ECharts definition
to the [`slipwayhq.echarts_svg`](https://github.com/slipwayhq/slipway_echarts_svg) Component.
This is a Javascript Component which uses the ECharts Javascript library to generate an SVG.

- Next it passes the output of that Component to the input of the [`slipwayhq.svg`](https://github.com/slipwayhq/slipway_svg) Component.
This is a Rust WASM Component which takes an SVG as an input and renders it to an image.

Rather than the user having to rig up these two Components every time they want to render a chart, we package them up in a reusable Fragment.

Internally the rigging is defined as follows:
```json
  "rigging": {
    "echarts": {
      "component": "slipwayhq.echarts_svg.0.5.0",
      "input": {
        "width": "$$.input.width",
        "height": "$$.input.height",
        "chart": "$$.input.chart",
        "theme": "$$?input.theme"
      }
    },
    "output": {
      "component": "slipwayhq.svg.0.5.0",
      "allow": [
        { "permission": "fonts" }
      ],
      "input": {
        "width": "$$.input.width",
        "height": "$$.input.height",
        "svg": "$$.echarts.svg"
      }
    }
  }
```
:::


### Javascript Components
A Javascript Component contains at minimum a `run.js` file, which exports a `run` function and sits alongside the `slipway_component.json` file.

The `run.js` file can import other Javascript modules from files stored within the Component.

The exported function should takes a single argument which is the Component's input JSON, and returns the Component output JSON:

```js
export function run(input) {
    return {
        foo: "bar"
    };
}
```

Javascript Components have access to a global `slipway_host` object, through which they can access the Host API:

```js
export async function run(input) {
    let result = await slipway_host.fetch_text("https://icanhazip.com/");
    return result.body;
}
```

We also polyfill some common Javascript APIs, which internally map to the host API:
```js
export async function run(input) {
    let result = await fetch("https://icanhazip.com/");
    return result.text();
}
```

Javascript Components can also contain [rigging](#rigging), which will executed after the Javascript `run` function has completed.
The rigging will have access to the result of the Javascript `run` function through the `$.input.run` query.

### WASM Components

A WASM (WebAssembly) Component contains a `run.wasm` file which sits alongside the `slipway_component.json` file.

Slipway uses the [WebAssembly Component Model](https://component-model.bytecodealliance.org/design/wit.html) for the interface between Slipway and the Component,
and provides a WIT file which Components should use to generate the interface in the language of their choice.

The WIT file can be output with the following command:
```sh
slipway wit
```

The interface generated from this WIT file will contain both the code which enables Slipway Host to call the component, and the code which enables
the component to call the Host API.

:::info[Why use WASM Components?]

WASM Components are more complex to set up than Javascript Components, and often produce larger component file sizes for a given set of functionality.

They also currently have some limitations, such as not supporting `async/await`, which can make Javascript Components more performant when many HTTP requests are required, and can be fetched in parallel.

When running Rigs through the `slipway run` command, WASM Components are just-in-time (JIT) compiled each time they are run. 
JIT compiling the Components has a performance overhead, often offsetting the performance gained from executing WASM in the first place.

However, when deploying as a server we can ahead-of-time (AOT) compile all the WASM Components to machine code during deployment,
and then use those AOT compiled artifacts when serving Rigs:
```sh
# AOT compile the Components
slipway serve <path> aot-compile

# Run the server, using the AOT generated Components
slipway serve <path> --aot
```

Using these commands gives you the full performance of WASM Components when it matters most: Executing Rigs for your devices to display.

Given these tradeoffs, the recommendation is:
- Write Javascript Components for basic functionality, simple data processing, and HTTP heavy workloads.
- Write WASM Components for performance-critical data processing.

:::

See the [Guides](/docs/category/guides) section for more in-depth information on creating WASM Components.


WASM Components can also contain [rigging](#rigging), which will executed after the WASM `run` function has completed.
The rigging will have access to the result of the WASM `run` function through the `$.input.run` query.
