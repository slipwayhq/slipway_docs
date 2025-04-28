---
sidebar_position: 35
---

# The SLIPWAY_SECRET Environment Variable

Slipway itself doesn't require any environment variables to run Rigs and generate dashboards.

However, there are two scenarios where providing an environment variable called `SLIPWAY_SECRET` will improve security:

- If you're returning Rigs in the [`html` format](/docs/basics/serving-rigs#format).
- If you're using [TRMNL devices](/docs/using-with-trmnl/slipway-for-trmnl-devices) with Slipway.

In both of these scenarios Slipway needs to return a URL to the caller which allows the caller to make
an additional request to render the Rig:
- When requesting Rigs in the `html` format, the returned HTML contains an `img` tag, and it is the fetching of that image
  which actually renders the dashboard (note that the `html_embed` format doesn't require an additional call
  as the image is embedded in a `data` URL instead).
- For TRMNL devices, the response to the device's `/api/display` API call must contain an `image_url`
  property, which the TRMNL device then fetches to get the image it should display.

By default, if no `SLIPWAY_SECRET` is provided, Slipway will simply re-use the API key passed in
by the caller, putting it in the `authorization` query string parameter of the generated URL.
However using an API key in a query string parameter is not best practice for security.

If you set the `SLIPWAY_SECRET` environment variable, then instead of re-using the request's API key
Slipway will generate a secure, short lived URL that is only valid for a short period of time (one minute
at time of writing).
This is more secure: It doesn't risk exposing any API keys, and even if the URL was to leak or be intercepted
it is useless once it expires.

:::tip
The `SLIPWAY_SECRET` environment variable should be set to long, hard to guess string.
It should be treated with the same level of security as a password or an encryption key.

The simplest way to generate a secure value for `SLIPWAY_SECRET` is to run:

```
slipway generate-key
```
:::
