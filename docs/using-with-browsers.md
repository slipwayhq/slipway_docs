---
sidebar_position: 50
---

# Using with Browsers

This article assumes you already have a Slipway server up and running.
If not, see the [Quickstart](/docs/getting-started/create-your-first-rig),
and perhaps the [Serving Rigs](/docs/basics/serving-rigs) section
or the [Hosting on Fly.io](/docs/guides/hosting-on-fly) section.

We'll also assume you've added [an API key](/docs/basics/serving-rigs#api-keys) to the server, and
know what it is.

Once you have a Slipway server running, displaying your rigs within a web browser is as simple
as navigating to either a [Rig](/docs/basics/serving-rigs#rigs-1), 
[Playlist](/docs/basics/serving-rigs#playlists-1), or [Device](/docs/basics/serving-rigs#devices-1) endpoint.

For example, if you have a rig called `foo` and your server is at `localhost:8080` then
you can display the Rig in your browser by navigating to:
```url title="Rig URL"
http://localhost:8080/rigs/foo?authorization=<YOUR_API_KEY>
```

Where `<YOUR_API_KEY>` should be replaced with an API key you've added to the server.

:::tip
When passing an API key as part of the URL is recommended to generate a new API key for this purpose,
so that it can be easily rotated later without affecting other devices.
:::

Similarly, if you've configured a playlist called `bar` or a device called `bat`, you can render them
by navigating to one of the following URLs:

```url title="Playlist URL"
http://localhost:8080/playlists/bar?authorization=<YOUR_API_KEY>
```
```url title="Device URL"
http://localhost:8080/devices/bat?authorization=<YOUR_API_KEY>
```

You can watch the progress of your Rig generation in the Slipway server output.

## Automatic Refresh

By default the Rig will be served as a PNG image.

When rendering in a browser it may make more sense to request it as an HTML page which
contains an image. This can be done with the query string parameter `format=html`:

```url title="Rig with format=html"
http://localhost:8080/rigs/foo?format=html&authorization=<YOUR_API_KEY>
```

The advantage of doing this is that Playlists and Devices (which reference playlists)
also generate a refresh interval, and when requesting either a Playlist or Device as HTML
Slipway uses a `<meta http-equiv="refresh" content="REFRESH_INTERVAL">` tag to request
that the browser automatically refreshes the page after `REFRESH_INTERVAL` seconds.

You will be able to see this `<meta>` tag added within the `<head>` tag of the returned HTML
if you request a playlist:

```url title="Playlist with format=html"
http://localhost:8080/playlists/bar?format=html&authorization=<YOUR_API_KEY>
```

When the interval elapses, the browser should automatically refresh the page, requesting a new screen.

The problem with `format=html` is that first the HTML loads, giving a white screen, then the `<img>` tag
is requested, which generates the Rig. When automatically refreshing, this causes the page to be momentarily
blank during a refresh.

Instead you can request that Slipway uses an embedded image (using a `data://` URL) using `format=html_embed`.
This means that the entire Rig is fetched at the same time as the HTML.

Now when the browser refreshes, you shouldn't see a blank page during the refresh because
it continues to display the old page until the new page is ready, and the new page already contains all
the data to display the Rig.

```url title="Playlist with format=html_embed"
http://localhost:8080/playlists/bar?format=html_embed&authorization=<YOUR_API_KEY>
```

