---
sidebar_position: 20
---

# TRMNL Quick Start

The best way to use Slipway with your TRMNL device is to configure Slipway as the device's API server.

These instructions assume you've already got a Slipway Server running, and have at least one
Rig configured, and a Playlist.

:::info[Quick Start Prerequisites]
If you haven't got a Slipway server and Rig set up yet, you can complete our 
[quick start tutorial](/docs/getting-started/create-your-first-rig)
in just a few minutes.

Next, in your Rig file, change the canvas width and height to match your TRMNL device
(there are better, more dynamic ways to do this, but for now this is sufficient).

You can then create a playlist by running:
```sh
slipway serve . add-playlist --name my_playlist --rig hello
```

This will add a [playlist](/docs/basics/serving-rigs#playlists-1) to your server configuration at `playlists/my_playlist.json`.
If you inspect that file you'll see it always displays the Rig named `hello` (from the quick start), and refreshes 
[at an interval](/docs/basics/serving-rigs#refresh) which you may want to change.

You should now be ready to proceed with the TRMNL Quick Start below.
:::

## Start your server and watch the logs

Ensure your server is running (you can run it locally with `slipway serve .`) and that you can see the logs.
If you're running locally, the logs will be output to your terminal window.
If you've deployed the server to [Fly.io](/docs/guides/hosting-on-fly) you can watch the logs by running `fly logs`.

:::tip
You will need to be able to see the logs when you add the TRMNL device.
:::

## Connecting your TRMNL device

When you first set up your TRMNL device you're prompted for your WiFi SSID and password,
and in addition you can optionally enter an API Server URL.

The server URL should be the URL of your Slipway server __with `/trmnl/` appended to the end__.

:::info[Example]
If your normal Slipway server URL is:
```
https://myslipwayserver.com/
```

Then you should point your TRMNL device at:
```
https://myslipwayserver.com/trmnl/
```
:::

## Adding your device to Slipway

Once you've given your Slipway server URL to your TRMNL device, it will do one of two things:

- If the device has already been given an API key, for example if you've previously connected
it to the official TRMNL servers, then it will immediately try and fetch a screen from your Slipway server
using the `/api/display` endpoint, passing in the existing API key.

- If the device doesn't have an API key, it will first request one from your Slipway server
using the `/api/setup` endpoint. Slipway will generate a new API key for the device automatically.
The device will then attempt to fetch a screen from the `/api/display` endpoint passing in the new
API key.

In either case, you will see a message similar to the following in the Slipway logs:

```
To allow this device, run the following command from your Slipway serve root:

    slipway serve . add-trmnl-device \
        --name "<NAME>" \
        --id "01:03:40:83" \
        --hashed-api-key "some_long_random_hash" \
        --playlist <PLAYLIST>

Then re-deploy the server if necessary.
```
:::info
Both the device name and the playlist should be made up of only lowercase alphanumeric characters and underscores.
:::

You should now run the command specified in your sever logs, replacing `<NAME>` with the name you'd like to give your device
(e.g. `trmnl_device_1`), and replacing `<PLAYLIST>` with the name of the playlist you'd like the device to use.
If you followed the instructions at the beginning of this Quick Start, it will be `my_playlist`.
Running this command will perform the necessary configuration file changes to your server.

After adding the device you'll need to restart the server (if running locally) or redeploy the server
(if it is hosted, for example by running `fly deploy`).

Once that is done you should be able to press the button on the back of your TRMNL device to
manually trigger a refresh, watch the page being generated in your Slipway logs, and finally see the screen
appear on your TRMNL device.

:::info[Why?]
Although this process might seem a bit manual, it has some big advantages.

By manually adding the device to your Slipway Server configuration files and then re-deploying,
it allows the deployed configuration files to be immutable on the live server.

This means you don't need to worry about backing up your live server, as your local configuration files always
represent the latest state. If you want to re-deploy elsewhere, simply tear down
your live server and re-deploy from your local configuration files.

In addition, because we only store [hashed API keys](/docs/guides/secrests-and-hashed-api-keys) in the configuration files,
they are safe to upload to version control systems such as GitHub.

By storing your configuration files in a version control system you can easily track how your server configuration
changes over time, and even if your live server is destroyed you can quickly redeploy
with no data loss from your Git repo.
:::

:::tip
As an extra step, when using Slipway with TRMNL devices it is recommended to also add a 
[`SLIPWAY_SECRET` Environment Variable](/docs/guides/the-slipway-secret-env) to improve security.
:::

## What Next?

That is all that is required to connect a TRMNL device to Slipway.
Next you might want to read through the [Basics section](/docs/category/basics) to understand how
to create new Components, Rigs and Playlists.