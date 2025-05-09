---
sidebar_position: 20
---

# Create Your First Rig

The best way to discover what Slipway can do is by reading through the [Basics section](/docs/category/basics)
section of the documentation, which comes next.

However to quickly get a feel for Slipway follow the walkthrough below to create a Component and a Rig,
and run them using a Slipway Server in just a few short files.

First, ensure you have [installed Slipway](/docs/getting-started/installing-slipway).

## Quick Start

We're going to create a Component, and then run the Component in a Rig to render a dashboard. Finally
we'll host the Rig in a Slipway server so that the Rig can be run on demand over a network.

The terminal commands given below should work on Linux, MacOS and under WSL in Windows.

#### Create a new folder for this example:
```sh
mkdir slipway_example
```

#### `cd` into the folder:
```sh
cd slipway_example
```

#### Create a folder for your Javascript Component:
The convention is for a component to live in a folder named `components/{publisher}.{name}`.
For this example we'll use the publisher name `demo` and the Component name `hello_world`.
```sh
mkdir -p components/demo.hello_world
```


#### Create a folder for your Rig:
The convention is for Rigs to live in a folder named `rigs`.
```sh
mkdir rigs
```

### Create the Component:

We're going to create a Javascript Component which takes some text as an input, and outputs a renderable layout in JSON which contains that text.

This will require creating two files: `slipway_component.json` and `run.js`.

:::tip[Note]
The Component files should all created in the `components/demo.hello_world` folder.
:::

Create a file called `slipway_component.json` containing the following JSON:
```json title="slipway_component.json"
{
  "publisher": "demo",
  "name": "hello_world",
  "version": "1.0.0",
  "input": {
    "properties": {
      "text": { "type": "string" }
    }
  },
  "output": {}
}
```

The `slipway_component.json` file contains the Component metadata, including defining the valid inputs and outputs
to the component.
In this case we've defined that the component input contains a property called `text` of type `string`,
and the Component can output any JSON.

Create a file called `run.js` containing the following Javascript:
```js title="run.js"
export function run(input) {
  const timezone = process.env.TZ;
  const now = Temporal.Now.plainDateTimeISO(timezone);
  const time = `${padded(now.hour)}:${padded(now.minute)}:${padded(now.second)}`;
  let outputText = `${input.text}\n${time}`;

  return {
      "type": "AdaptiveCard",
      "verticalContentAlignment": "center",
      "body": [
          {
              "type": "TextBlock",
              "horizontalAlignment": "center",
              "text": outputText
          }
      ]
  };
}

function padded(num) {
  return num.toString().padStart(2, '0');
}
```

The `run.js` file contains the Javascript that will be executed for the Component.
In this case it returns a simple [Adaptive Cards](https://adaptivecards.io/) definition
that will render the text supplied in the input centered horizontally and vertically,
along with the current time.

:::info
Slipway validates the input to your Component before calling the `run` function,
using the schema defined in `slipway_component.json`.
Schemas can be defined using either [JsonTypeDef](https://jsontypedef.com/) or [JSON Schema](https://json-schema.org/).
:::

:::info
We will use an [Adaptive Cards renderer](https://github.com/slipwayhq/slipway_render) to render our text in this example,
however Slipway itself is renderer agnostic and can use any rendering Component.
For example we could instead supply JSX to a [JSX renderer](https://github.com/slipwayhq/slipway_jsx).
:::

### Test the Component:

We can quickly test our Component outside of a Rig using the `slipway run-component` command.

Run the following in your terminal:
```sh
slipway run-component "file:components/demo.hello_world" --input "{ \"text\": \"Hello there\" }"
```

You should see the expected output in the terminal:
```json
{
  "body": [
    {
      "horizontalAlignment": "center",
      "text": "Hello there",
      "type": "TextBlock"
    }
  ],
  "type": "AdaptiveCard",
  "verticalContentAlignment": "center"
}
```

### Create the Rig:
:::tip[Note]
The Rig file below should be created in the `rigs` folder.
:::

The Rig file defines how components will be composed together to produce an output.
We will call our Rig `hello` by creating a file called `hello.json` in the `rigs` folder:
```json title="hello.json"
{
  "rigging": {
    "hello_world": {
      "component": "demo.hello_world.1.0.0",
      "input": {
        "text": "Hello World!"
      }
    },
    "output": {
      "component": "slipwayhq.render.0.5.0",
      "input": {
        "card": "$$.hello_world",
        "canvas": {
          "width": 800,
          "height": 480
        }
      },
      "allow": [
        { "permission": "fonts" }
      ]
    }
  }
}
```

This Rig defines the input to the `demo.hello_world` Component we just created, specifying that we want to render the
text `Hello World!`.

It then feeds the Component's output into the `card` property of the `slipwayhq.render` Component's input.
The `slipwayhq.render` Component understands how to render [Adaptive Cards](https://adaptivecards.io/) definitions, and outputs
a rendered canvas.

:::info
The `$$.hello_world` string in the above JSON tells Slipway to substitute at that location the output of the component with handle `hello_world`. It is a convenient shorthand for the JsonPath query `$.rigging.hello_world.output`. This is discussed in more detail [later](/docs/basics/rigs#rigginginput).

This is how we define how data flows from one Component to another.
:::

:::info
In the above Rig you can see that we explicitly give the `slipwayhq.render` component permission to load fonts from the host system.
Slipway uses a [zero-trust security model](/docs/basics/permissions) for both Rigs and Components.
:::

### Run your Rig:

Your file system should now look something like this:
```
slipway_example
  ├─ components
  │  └─ demo.hello_world
  │     └─ run.js
  │     └─ slipway_component.json
  └─ rigs
     └─ hello.json
```

From the root `slipway_example` folder, execute the following command to run your rig:
```sh
slipway run --allow-all --registry "file:components/{publisher}.{name}" rigs/hello.json
```

Let's break this down:

- `slipway run` tells Slipway we want to run a rig.

- `--allow-all` indicates we trust the Rig to give any appropriate permissions to Components. It does *not* indicate we trust the Components. See the [permissions](/docs/basics/permissions) section for more information.

- `--registry "file:components/{publisher}.{name}"` tells Slipway to treat that relative path
as a Component Registry, and search it for any referenced Components.
This is where our `hello_world` Component lives.
If a Component isn't found there, it will fall back to the default Slipway Component Registry.

- `rigs/hello.json` specifies the Rig we want to run.

You should see output similar to the following in the console, followed by a rendering of the final dashboard:
```
Launching rigs/hello.json

◩ hello_world  ┆  6fde7398             ┆  23 bytes   
└─□ output     ┆                       ┆             

Running "hello_world"...
Component "hello_world" finished running.

■ hello_world  ┆  6fde7398 ➜ 6cfa9a4b  ┆   23 bytes ➜ 152 bytes  ┆  2ms of 3ms
└─◩ output     ┆  fa87a452             ┆  197 bytes            

Running "output"...
Component "output" finished running.
No more components to run.

■ hello_world  ┆  6fde7398 ➜ 6cfa9a4b  ┆   23 bytes ➜ 152 bytes  ┆  2ms of 3ms
└─■ output     ┆  fa87a452 ➜ 8c13d949  ┆  197 bytes ➜   1.95 mb  ┆  7ms of 454ms
```

If your terminal doesn't support displaying images, you can add a `-o results` argument to write the outputs
to a `results` folder:

```sh
slipway run -o results --allow-all --registry "file:./components/{publisher}.{name}" rigs/hello.json
```

In this case there will only be one output, `results/output.png`, which should look something like this:

![Docs Version Dropdown](./img/getting_started_rig_output.png)

## Hosting Your Rig

Now we have a Rig, it's easy to host it so that it can be served over a network.

First we initialize the configuration files for the built in HTTP server:
```sh
slipway serve . init
```

This will create a `slipway_serve.json` file, a `Dockerfile` (to make hosting easy) and a number of
additional (empty) folders which are used for configuring features such as Playlists and Devices.

The defaults should be basically fine for this example.
There are just a couple of additions we need to make.

First add an API key:

```sh
slipway serve . add-api-key --name "example_key"
```

This will add a hashed API key to the `slipway_serve.json` file, and output the unhashed key to the terminal.


__Make a note of the unhashed key displayed in the terminal, as we will use it in a moment.__

Next edit `slipway_serve.json` and update the `rig_permissions` as follows:
```json title="slipway_serve.json"
  "rig_permissions": {
    "hello": {
      "allow": [
        { "permission": "all" }
      ]
    }
  }
```

This equivalent to the `--allow-all` argument we used with the `slipway run` command earlier.
It tells the Slipway server that we trust the Rig called `hello` to give appropriate permissions to any Components
that it uses.

Finally we can run the server:
```sh
slipway serve .
```

A server will start on port 8080. In your browser you can navigate to the following URL to view your rig,
replacing `<YOUR_API_KEY>` with the unhashed key displayed in the console when you ran the `add-api-key`
sub-command above:
```
http://localhost:8080/rigs/hello?authorization=<YOUR_API_KEY>
```

The image we saw earlier should appear in your web browser. In your terminal where you ran `slipway serve .` you should
be able to see the logs of the Rig being generated. Each time you refresh the browser the dashboard is generated again.

:::warning
Passing the API key as a query string parameter is not generally recommended for security reasons. 
Passing it using the `authorization` header is preferred, but not always possible.
See the [API Keys](/docs/basics/serving-rigs#api-keys) documentation for more information.
:::

### Automatic Refresh

The above URL rendered our Rig once and returned it.
But as we're displaying the time it might be nice to have it refresh automatically.

Stop your Slipway server, if it is still running, with `Ctrl+C` in the terminal.

We'll add a [playlist](/docs/basics/serving-rigs#playlists-1) using the `add-playlist` sub-command,
which saves us creating the file ourselves:
```sh
slipway serve . add-playlist --name every_so_often --rig hello
```

You'll now find a file in your `playlists` folder called `every_so_often.json`.
Open this file and it will look like this:

```json title="every_so_often.json"
{
  "schedule": [
    {
      "refresh": {
        "minutes": 5
      },
      "rig": "hello"
    }
  ]
}
```

Change `"minutes": 5` to `"seconds": 10` because we don't have all day.
The file should now look like this:
```json title="every_so_often.json"
{
  "schedule": [
    {
      "refresh": {
        "seconds": 10
      },
      "rig": "hello"
    }
  ]
}
```

Now start your server again:

```sh
slipway serve .
```

But this time navigate to the following URL:

```
http://localhost:8080/playlists/every_so_often?format=html_embed&authorization=<YOUR_API_KEY>
```

Note that we're now navigating to `/playlists/every_so_often`, and we've added the
`format=html_embed` query string parameter which tells the server to return an HTML page
with an embedded image, rather than just returning the image directly.

Now the page will automatically refresh itself every 10 seconds, thanks to the following
in the HTML's `<head>` section:
```
<meta http-equiv="refresh" content="5">
```

:::info[Aside]
Slipway isn't really intended for rapid refreshing, more for refreshes on the scale of
minutes, or perhaps even hours or days. However for the purposes of this tutorial we
won't make you wait that long.
:::

At the moment it refreshes 10 seconds after the browser receives its payload, and there may
be some drift over time as each screen takes a moment to render, exaggerated because we're not
pre-compiling the `slipwayhq.render` WASM component in this tutorial.

But what if we wanted it to refresh precisely every 10th second of each minute?
We can use [`cron`](https://crontab.guru/) syntax to specify this:

```json title="every_so_often.json"
{
  "schedule": [
    {
      "refresh": {
        "cron": "*/10 * * * * *"
      },
      "rig": "hello"
    }
  ]
}
```

Save the file and your page should start refreshing roughly every 0th, 10th, 20th, 30th, 40th and 50th second
of each minute (give or take a second), and it won't drift.

In the real world you'd use this to schedule refreshes precisely on the hour, or every 15th minute of every hour, etc.
This is very useful for knowing when the screen was last generated, and when it will next update.

Playlists can also be used to display different Rigs depending on the time of day, or day of week.
And they also work perfectly with [TRMNL devices](/docs/using-with-trmnl/slipway-for-trmnl-devices), controlling
exactly when the eInk screen should refresh, and what it should display.

## What Next?

You've now created a basic Component and a Rig, but neither are super useful, unless you want a slow refreshing eInk clock.

Clicking "Next" below will take you through the Basics section of the documentation, which will 
show you how to do more interesting things in Slipway, such as creating Rigs and Components which fetch 
data and plot charts, how to compose multiple components onto a single screen,
and how to display get the outputs of Rigs onto your devices.

If you want to use Slipway with [TRMNL devices](/docs/using-with-trmnl/slipway-for-trmnl-devices), you might also want to complete the [TRMNL Quick Start](/docs/using-with-trmnl/trmnl-quick-start).