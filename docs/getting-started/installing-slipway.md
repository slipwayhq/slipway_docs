---
sidebar_position: 10
---

# Installing Slipway

## Downloading

Slipway is a single binary application, which makes installing it (and uninstalling it) trivial.

You can download Slipway from our [releases](https://github.com/slipwayhq/slipway/releases) page on GitHub.

Simply download the appropriate binary for your platform and ensure it is on path.

## Docker

Slipway provides Docker containers which have Slipway pre-configured.
These are primarily used to simplify hosting Slipway on a server, but it can also be used to give Slipway a try in an isolated environment.

```sh
docker run -it -v "$PWD":/app -w /app -p 8080:8080 slipwayhq/slipway:latest
```

:::warning[TODO]
Test this once registry is live.
:::

## Compiling from Source

You will need the [Rust toolchain](https://www.rust-lang.org/tools/install) installed to compile from Slipway from source, and optionally the [just](https://github.com/casey/just) task runner.

First clone our [GitHub repository](https://github.com/slipwayhq/slipway) at a suitable location:
```sh
git clone https://github.com/slipwayhq/slipway.git
```

Then you can build a release version of Slipway using the `just` command:
```sh
just build release
```

Or, if you don't have [just](https://github.com/casey/just?tab=readme-ov-file) installed:
```sh
cd src
cargo build --release
```

You could then run the following command (from the repository root) to create a symlink to the compiled Slipway binary on path:
```sh
ln -sf $(pwd)/src/target/release/slipway ~/bin/slipway
```

From there you should be able to run the Slipway CLI as normal.