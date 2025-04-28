---
sidebar_position: 20
---

# Component Registries

## Slipway Component Registry

The default Slipway Component Registry is a thin wrapper over GitHub Releases. It uses a convention based approach to automatically
discover your components once they are published to GitHub and requested from the Registry.

If you want to make your Component available in the Slipway Component Registry you should follow these conventions:


- The `publisher` field in your Component should match your GitHub Username or Organization name (with any hyphens converted to underscores).

- Your GitHub repository name should match The 'name' field in your Component but with an extra `slipway_` prefix.

:::info[Example]
For example, if your GitHub username was `pied-piper` and your Component was called `middle_out`, then you would
create a GitHub repository called `slipway_middle_out` and set your Component's
`publisher` field to `pied_piper` and `name` field to `middle_out`.
:::

- The `version` field in your Component should match the GitHub Release name, be a 
valid [semver](https://docs.rs/semver/latest/semver/struct.Version.html#syntax) version number, and be prefixed with a
with a `v`.

- The released file name should be `<publisher>.<name>.<version>.tar`.

:::info[Example]
If in the above example we released a version on GitHub named `v1.23.0` then the Component would be automatically available
in the Slipway Component Registry using the reference `pied_piper.middle_out.1.23.0`.

The Slipway Component Registry would simply redirect requests to the URL:
```
https://github.com/pied-piper/slipway_middle_out/releases/download/v1.23.9/pied_piper.middle_out.1.23.9.tar
```
:::

## Custom Component Registries

Slipway has been designed to make it as simple as possible to host your own Component registries, 
either on the local file system or with a simple HTTP server.

When running [`slipway run`](/docs/basics/running-rigs) you can pass in zero or more `--registry-url` arguments to include additional paths or URLs to search for Components.

The `registry_urls` field in the `slipway_serve.json` file serves the same purpose when running [`slipway serve`](/docs/basics/serving-rigs).

The registry paths given can contain `{publisher}`, `{name}` and `{version}` interpolation strings and these will be replaced by the 
actual Component publisher, name and version which is being searched for.

The registry paths can be URLs pointing to TAR files, or local paths pointing to either folders or TAR files.

For example:

```sh title="An HTTP registry serving TAR files from the root"
--registry-url "https://my-registry.com/{publisher}.{name}.{version}.tar"
```

```sh title="An HTTP registry serving TAR files from a folder structure"
--registry-url "https://my-registry.com/components/{publisher}/{name}/{publisher}.{name}.{version}.tar"
```

```sh title="An absolute local path to a folder of TAR files"
--registry-url "file:///components/{publisher}.{name}.{version}.tar"
```

```sh title="A relative local path to a folder of TAR files"
--registry-url "file:components/{publisher}.{name}.{version}.tar"
```

```sh title="A relative local path to components in folders, ignoring versions"
--registry-url "file:components/{publisher}.{name}"
```

:::info[Example: Developing Multiple Components]
One common use case for specifying a registry URL is when developing multiple Components on your local machine.

For each Component you might have Rigs which act as integration tests for the Component, and you may want these to use
the most recently built versions of the other Components you're developing.

Let's say you always develop Slipway Components by cloning the repository into a folder called `slipway_{name}`,
where `{name}` is the name of the Component, and when  a Component is built you also follow the convention
of putting the built component files in a folder called `components/{publisher}.{name}`.

Assuming you run the test Rigs from the root of the repository you're testing,
you could run them with the following argument:

```sh
--registry-url "file:../slipway_{name}/components/{publisher}.{name}"
```

This will try and locate each Component in the `components` folder of the relevant locally cloned repository.
If the Component is not found, or any part of the path does not exist, then the Slipway CLI will 
gracefully fall back to the next supplied registry path, or to the default registry.
:::