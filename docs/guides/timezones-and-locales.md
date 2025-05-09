---
sidebar_position: 90
---

# Timezones and Locales

When running Rigs through [`slipway run`](/docs/basics/running-rigs) the system timezone and locale are used.

When running Rigs through [`slipway serve`](/docs/basics/serving-rigs) the user timezone and locale are taken 
from the [timezone field](/docs/basics/serving-rigs#timezone)
and the [locale field](/docs/basics/serving-rigs#locale)
of the `slipway_serve.json` configuration file, falling back to the system timezone or locale if either is not found.

The timezone is used when evaluating [playlists](/docs/basics/serving-rigs#playlists-1), and is also made available to Components
through the `TZ` environment variable _within_ the Component (in other words it is not a host environment variable, which
you would need to access through the [Host API](/docs/basics/host-api)).

- In Javascript Components the timezone can be accessed through the `process.env.TZ` field.
- In Rust, you would access it through `std::env::var("TZ")`.

For example, in Javascript you could log the current time, taking into account the user's specified timezone, as follows:
```js
const tz = process.env.TZ;
console.log(`Current Date/Time: ${Temporal.Now.plainDateTimeISO(tz).toString()}`);
```

The locale is also made available to Components
through the `LC` and `LC_ALL` environment variable _within_ the Component.

In addition to being made available to Components through the `TZ` and `LC` environment variables, they is also added to the Rig's
`context`, and can be accessed by using the `$.context.timezone` or `$.context.locale`
[queries](/docs/basics/rigs#rigginginput).
