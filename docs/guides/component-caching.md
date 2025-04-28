---
sidebar_position: 60
---

# Component Caching

When Components are downloaded, either from HTTP URLs or through remote Component Registries,
they are cached locally before being used.

Next time that specific Component is used, if the cached version already exists then the cached version
is used instead.
The Component version is matched to the cache by comparing the Component URL (if the Component is referenced using
a Component reference then the URL that reference resolves to is used).

The cache by default is created at:

```
~/.slipway/components
```

You can quickly clear the cache by running:

```sh
slipway clear-component-cache
```
