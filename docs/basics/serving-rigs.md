---
sidebar_position: 50
---

# Serving Rigs

[Running rigs](/docs/basics/running-rigs) using `slipway run` is useful for testing,
but when deployed we want to serve our rigs over the internet, or a local network,
to our devices.

The Slipway CLI comes with a built in HTTP server for doing exactly this, and the `slipway serve` command
is the basis of this functionality. Running the following command will display the help:

```sh
slipway serve --help
```

All `slipway serve` commands and sub-commands take a path as the first argument.
This path is the base directory of the server, from which all configuration files are discovered.

If you are running `slipway serve` commands from the base directory, you can simply use `.` as the path.
We will assume this is the case in the examples that follow.

## Init

If you are creating a new server then then the `init` sub-command is useful for setting up
the basic directory structure and configuration files:

```sh
slipway serve . init
```

Running this in an empty folder will produce the following output:
```sh
Adding config: "./slipway_serve.json"
Adding dockerfile: "./Dockerfile"
Adding folder: "./components"
Adding folder: "./rigs"
Adding folder: "./playlists"
Adding folder: "./devices"
Adding folder: "./fonts"
```

Running the `init` sub-command in a folder which is not empty will only create the files and folders which do not already exist.

We'll go though each of the items it created in turn.

## `./slipway_serve.json`

The `slipway_serve.json` file is the primary file through which the server is configured.
The `init` command will produce a basic version of this file which will look something like this:

```json
{
  "log_level": "info",
  "registry_urls": [
    "file:./components/{publisher}.{name}.{version}.tar",
    "file:./components/{publisher}.{name}"
  ],
  "timezone": "Europe/London",
  "rig_permissions": {},
  "hashed_api_keys": {}
}
```

We will go through each of these settings.

### `log_level`

This configures the logging level of the server and any Components which are run.

This is the equivalent of the `--log-level` argument to the `slipway run` command.

The valid options are, from most verbose to least:
- `trace`
- `debug`
- `info` (the default level if the setting is omitted)
- `warn`
- `error`

### `registry_urls`

The list of Component Registry URLs which should be checked, in order, before falling back to the Slipway Component Registry.

See the [Component Registries](/docs/guides/component-registries#custom-component-registries) page for more information.

### `timezone`

The timezone which you want to use when evaluating playlists, and which is made available to Components.
The timezone should be a string 
[identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) such as `Europe/London`.

The `init` command defaults this to the current system timezone.

### `rig_permissions`

A mapping of Rig name to an array of permissions for that Rig.

For example, if there was a Rig `rigs/my_rig.json` then you might change this to something like:
```json
{
  "rig_permissions": {
    "my_rig": {
      "allow": [
        { "permission": "fonts" },
        { "permission": "files", "within": "./data" },
        { "permission": "registry_components" },
      ],
      "deny": [
        { "permission": "files", "within": "./data/secrets" },
      ]
    }
  }
}
```

See the [Permissions](/docs/basics/permissions) page for more detail about possible permission configuration values.

### `port`

An optional port to serve on. Defaults to `8080`.

### `hashed_api_keys`

A mapping of key names to hashed API keys.

API keys provide security by requiring that all devices requesting dashboards provide an API key contained
in the `slipway_serve.json` file. Any requests which do not provide a valid key are rejected.

You can easily add a new random API key by calling the `add-api-key` sub-command.

For example:
```sh
slipway serve . add-api-key --name my_new_key
```

See the [API Keys](#api-keys) section below for more details.

### `show_api_keys`

This parameter is not added by default, but has the following possible values:
```
"show_api_keys": "never"
"show_api_keys": "new"
"show_api_keys": "always"
```

If omitted this defaults to `never` and `slipway serve` will never output incoming API keys to the console.
This is the default for security reasons: If the logs were to be persisted then we would absolutely
not want any credentials stored in them.

However sometimes you do need to discover the API key used by a device, perhaps so it can be stored
in a password manager.

Setting `show_api_keys` to `new` will allow Slipway to output API keys to the console whenever
a new API key is generated for a device (using the TRMNL API), or whenever a device tries to use
the API with an unrecognized API key.

Setting `show_api_keys` to `always` will always show the device API keys whenever a request is received
by the device. This is useful if you need to find out the API key of a device which is already
configured to use your Slipway server. It is recommended to always put `show_api_keys` back to `new` or `never`
once you've gotten the API key you need.

Note that `slipway serve . add-api-key` will always show the API key irrespective of this setting.


## `./Dockerfile`
A [Dockerfile](https://www.docker.com/) which will create a deployable container image
of your server, with all referenced Components downloaded locally, 
and all WASM Components ahead-of-time compiled for maximum performance.

This makes it super easy to deploy your server on services such as [fly.io](https://fly.io), which will
automatically detect and use the Dockerfile when you run `fly deploy`.

## `./components`

This folder can contain any local Components, either as folders or TAR files.

## `./fonts`

This folder can contain any fonts you want to make available to Components, in addition to system fonts.

## `./rigs`

This folder contains any Rig files. See the next section for more details.

## `./playlists`

This folder contains any Playlist files. See the next section for more details.

## `./devices`

This folder contains any Device files. See the next section for more details.

## Rigs

We've already talked about [Rigs](/docs/basics/rigs). A Rig renders a dashboard by composing together Components.

You can use the `add-rig` sub-command to help with creating a basic Rig file in the correct location.

For example:
```sh
slipway serve . add-rig --name "example_rig"
```

## Playlists

Sometimes you want to display a different Rig depending on the time or the day, or have a Rig auto-refresh
at certain intervals.
This is what Playlists are for.

You can use the `add-playlist` sub-command to help with creating a basic Playlist file in the correct location.

For example:
```sh
slipway serve . add-playlist --name "example_playlist" --rig "example_rig"
```

Here is an example of a playlist:
```json title="playlists/example_playlist.json"
{
  "schedule": [
    {
      "time": {
        "from": "07:00",
        "to": "09:00"
      },
      "days": [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ]
      "refresh": {
        "minutes": 30,
      },
      "rig": "school_calendar"
    },
    {
      "time": {
        "from": "22:00",
        "to": "04:00"
      },
      "refresh": {
        "hours": 3
      },
      "rig": "house_energy_usage"
    },
    {
      "refresh": {
        "cron": "0 * * * *"
      },
      "rig": "house_energy_usage"
    }
  ]
}
```

Playlists contain a `schedule`.
When a playlist is requested, each item in the schedule is checked in order.
The first item which is found to be "active" is used.

An item is active if the current date and time,
as calculated using the `timezone` specified in the `slipway_serve.json` file,
falls within the specified time range and on the specified days.

### `days`

The `days` field takes an array of days on which the playlist item can be active.

If no days are specified, then all days are considered valid.

### `time`

The `time` field contains an object which can contain either a `from` field or a `to` field or both.
The `from` and `to` fields are times formatted as `HH:mm`.

An object with neither `from` nor `to` is not valid; instead the entire `time` field should be removed
or set to `null`.

If no time is specified, then all times are considered valid.

### `refresh`

The refresh interval while this Playlist item is active.

This can be specified in seconds:
```json
"refresh": {
    "seconds": 30,
}
```

Or in minutes:
```json
"refresh": {
    "minutes": 15,
}
```

Or in hours:
```json
"refresh": {
    "hours": 2,
}
```

Or as a [Cron](https://crontab.guru/examples.html) schedule. For example this specifies a refresh on the hour every hour:
```json
"refresh": {
    "cron": "0 * * * *"
}
```

### `rig`

The `rig` field specifies the name of the Rig that should be run while this Playlist item
is active.

### Example Revisited

Looking back at the example playlist above we can now see that:

- Monday to Friday between 7am and 9am the `school_calendar` Rig should be displayed,
and refreshed every 30 minutes.

- Otherwise, on any day between 10pm and 4am the `house_energy_usage` Rig should be displayed,
and refreshed every 3 hours.

- Otherwise the `house_energy_usage` Rig should be displayed and refreshed on the hour every hour.


## Devices

A Device represents a physical device which wants to display a Rig.

You can use the `add-device` sub-command to help with creating a basic Device file in the correct location.

For example:
```sh
slipway serve . add-device --name "example_device" --playlist "example_playlist"
```

At its simplest, a device simply references a playlist:
```json title="devices/example_device.json"
{
  "playlist": "example_playlist"
}
```

Devices can also specify `context`, which can be used to supply arbitrary data to Rigs about the device,
and can in turn be used to alter the Rig's behavior.

```json title="devices/example_device.json"
{
  "playlist": "example_playlist",
  "context": {
    "width": 800,
    "height": 480,
    "color": false
  }
}
```

In your Rig you can access the current device context and pass it through to Components by using the `$.context.device`
[query](/docs/basics/rigs#rigginginput).

If your physical device is a TRMNL device, or will be using the TRMNL API,
then the device file also contains the information required to identify and authenticate the TRMNL device.

The `add-trmnl-device` sub-command is used to add this additional information to a Device file.

See [this page](/docs/using-with-trmnl/slipway-for-trmnl-devices) for more information.

## Serving

To start the server, simply run:
```sh
slipway serve .
```

By default the server runs on port `8080`.

When the server is running, Rigs, Playlists and Devices can be accessed at the following URLs:
- `/rigs/<rig_name>`
- `/playlists/<playlist_name>`
- `/devices/<device_name>`

Where `<rig_name>`, `<playlist_name>`, and `<device_name>` are the names of the files in the 
`rigs`, `playlists`, and `devices` folder with the `.json` extension removed.

So if you had a Rig located at:
```
rigs/my_rig.json
```

And your server was running at:
```
http://localhost:8080/
```

Then you could view this rig by visiting:
```
http://localhost:8080/rigs/my_rig
```

## TRMNL API

In addition to the above endpoints, the server also supports the [TRMNL API](/docs/using-with-trmnl/slipway-for-trmnl-devices) 
for compatibility with any device running the [TRMNL firmware](https://github.com/usetrmnl/firmware).

The TRMNL API has its own security system, where each device is assigned an API key by the server.
See the [TRMNL documentation](/docs/using-with-trmnl/slipway-for-trmnl-devices.md)  for more information.

## Query String Arguments
Rig, Playlist and Device URLs all take a standard set of query string arguments:

### `format`
How the server should format the result. This can be one of:
- `image`: Format the result as an image. This is the default.
- `json`: Return the raw JSON result from the output Component of the Rig.
- `html`: Return the result as an HTML page containing a URL which generates the image.
- `html_embed`: Return the result as an HTML page containing the image as an embedded `data` URL.

### `image_format`
How the server should format the image. This can be one of:
- `png`: Format the image as a PNG. This is the default.
- `jpeg`: Format the image as a JPEG.
- `bmp_1bit`: Format the image as a 1 bit Bitmap.

### `authorization`
The Rig, Device and Playlist calls require that the requests contain an `authorization` header,
the value of which should match one of the API keys added to the `slipway_serve.json`.

However if the device making the request is unable to add the API key as a header, it can
instead be specified using the `authorization` query string parameter.

:::warning
Passing the authorization string as a query string parameter is not as secure as passing it as a header,
and should only be used when adding a header is impractical or impossible.
:::

## API Keys

New API keys can be easily added to the `slipway_serve.json` using the `add-api-key` sub-command.

For example:
```sh
slipway serve . add-api-key --name my_new_key
```

This command will generate a long and random key, and add the hashed version of the key to the `slipway_serve.json` file
with the name `my_new_key`.

This is secure, as it is computationally infeasible to work out the unhashed key from the
hashed key. The hashing algorithm used is SHA256.

The `add-api-key` command will output the unhashed key in the console for you to save somewhere securely.

:::info
It is the _unhashed key_ which should be supplied by devices in the `authorization` header,
not the hashed key.
:::

:::warning
The unhashed keys should be stored somewhere secure, such as in a password manager.
Anyone with access to an unhashed key is able to call your Slipway server endpoints.
:::

Keys can be revoked simply by removing them from the `slipway_serve.json` and re-deploying the server.

If you wish to add a custom key, rather than a randomly generated one, you can use the `slipway hash` command
to generate the hash, and add the hashed key to the `slipway_serve.json` manually.

You can add as many or as few keys as you like. So for example you could have one key for all devices,
or one key per device, or anything in between.

If some devices have to pass their API key as a query string parameter, rather than as a header,
it may be worth using a separate key so it can be easily revoked if it leaks, without affecting other devices.

## Consolidate

The `consolidate` sub-command will download every referenced Component to a local cache, to improve 
cold start latency when the server is run for the first time.

```sh
slipway serve . consolidate
```

This is done automatically by the Dockerfile (as part of the `aot-compile` sub-command) when deploying.

## Ahead-Of-Time Compilation

When running WASM Components often the biggest overhead is compiling the WASM Component to machine code.

The Dockerfile therefore runs the `aot-compile` sub-command during deployment to compile all WASM Components
ahead of time.

The `aot-compile` sub-command automatically calls the `consolidate` sub-command internally.

```sh
slipway serve . aot-compile
```

By default the current machine's architecture is used for AOT compilation, however this can be overridden with the
`---target` argument:
```sh
slipway serve . aot-compile --target x86_64-unknown-linux-gnu
```

Even after running `aot-compile` the server will not automatically use the resulting artifacts.
You must specify the `--aot` argument when running the server to actually use the AOT artifacts.

```sh
slipway serve . --aot
```

The reason for this is that using AOT compiled artifacts is a more complicated workflow, with addition complexity
around machine architectures and the staleness of the AOT artifacts. My making the use of AOT artifacts explicit
when starting the server it is hoped that potential confusion will be reduced.
