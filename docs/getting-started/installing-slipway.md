---
sidebar_position: 10
---

# Installing Slipway

## Downloading

Slipway is a single binary application, which makes installing it (and uninstalling it) trivial.

You can download Slipway from our [releases](https://github.com/slipwayhq/slipway/releases) page on GitHub.
Simply download the appropriate `.tar.gz` file for your platform, extract the binary, and ensure it is on path.

:::info[Terminal Image Support]
The MacOS (`apple-darwin`) and x64 Linux GNU builds support [Sixel](https://en.wikipedia.org/wiki/Sixel),
a protocol for displaying images supported by many terminals.
Currently the MUSL Linux builds do not (although they still support images in Kitty and iTerm).

When running Slipway on the command line, Slipway uses Sixel to display your generated dashboards directly in the terminal.
This is useful for getting an idea of how your dashboards will look without having to open a separate image file, 
or view the dashboards in a browser, but it is not essential to use Slipway.

We recommend using the Linux GNU or MacOS builds when possible, for the best experience.
For Slipway servers, the MUSL builds are sufficient.
:::


## Docker

Slipway provides [Docker images](https://hub.docker.com/r/slipwayhq/slipway/tags) which have Slipway pre-installed.
These are primarily used to simplify hosting Slipway on a server, but they can also be used to try Slipway in
an isolated environment.

For example, you could start an interactive terminal in a Slipway container as follows:
```sh
docker run -it -v "$PWD":/app -w /app -p 8080:8080 slipwayhq/slipway:latest
```

## Compiling from Source

You will need the [Rust toolchain](https://www.rust-lang.org/tools/install) installed to compile from Slipway from source, 
the `wasm32-wasip2` target, and optionally the [just](https://github.com/casey/just)
task runner and [nextest](https://github.com/nextest-rs/nextest) test runner.

After installing the Rust toolchain you can install them as follows:
```
rustup target add wasm32-wasip2
cargo install just cargo-nextest
```

Clone our [GitHub repository](https://github.com/slipwayhq/slipway) at a suitable location:
```sh
git clone https://github.com/slipwayhq/slipway.git
```

Then you can build a release version of Slipway using the `just` command:
```sh
just build
```

Or, if you don't have `just` installed:
```sh
cd src
cargo build --release
```

You could then run the following command (from the repository root) to create a symlink to the compiled Slipway binary on path:
```sh
ln -sf $(pwd)/src/target/release/slipway ~/bin/slipway
```

From there you should be able to run the Slipway CLI as normal.

### Build issues

On Linux you may also need to install `libssl-dev`,  `libsixel-bin` and `fontconfig` using `apt-get` or similar.
