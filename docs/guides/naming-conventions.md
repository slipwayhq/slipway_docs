---
sidebar_position: 110
---

# Naming Conventions

Slipway tries to stick to a `snake_case` naming convention whenever possible for consistency.

Snake case is used for:
 
 - Component publisher names
 - Component names
 - Component handles
 - API key kames
 - JSON property names

The above is particularly useful when parts of the JSON are keyed by, for example, Component handles, as the
component handles are already using the same naming convention as other JSON property names.

Slipway explicitly disallows hyphens in Component publisher names, Component names, Component handles, etc., to
avoid the kind of inconsistency you have in Rust crates where [some crates](https://lib.rs/crates/actix-web)
use hyphens and [some crates](https://lib.rs/crates/serde_json) use underscores.

We've stuck to the `snake_case` convention with our repository names, and our Rust crate names, and
as such our default [Component Registry](/docs/guides/component-registries#slipway-component-registry) also requires underscore separated GitHub repository names.

We also recommend that the input and output properties of Components use `snake_case` for consistency, although
in the end this is down to the component author.

The place where this consistency falls apart is when you start depending on JSON Schemas written by others, which often use
`camelCase`. This happens both within Slipway itself (for example we support specifying Component input and output schemas
in either [JSON Schema](https://json-schema.org/) or [JsonTypeDef](https://jsontypedef.com/), both of which use `camelCase`), and in Components (for example [`slipwayhq.render`](https://github.com/slipwayhq/slipway_render) relies
on the [Adaptive Cards](https://adaptivecards.io/) schema which uses `camelCase`).

In these situations I think we just have to accept that we can't have perfect consistency, and do the best we can.
