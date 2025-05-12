---
sidebar_position: 10
---

# Installing Slipway

## Downloading

Slipway is a single binary application, which makes installing it (and uninstalling it) trivial.

You can download Slipway from our [releases](https://github.com/slipwayhq/slipway/releases) page on GitHub.
Simply download the appropriate `.tar.gz` file for your platform, extract the binary, and ensure it is on path.

There are some platform specific instructions below.

### MacOS

The MacOS build uses [Sixel](https://en.wikipedia.org/wiki/Sixel) for displaying images in the terminal.
You will need to have this installed with `brew` or you will get 
the error `Library not loaded: /opt/homebrew/opt/libsixel/lib/libsixel.1.dylib`.

To install `libsixel` run the following:
```
brew install libsixel
```

### Windows

We don't currently produce native Windows builds, however the Linux builds should work in WSL.

### Linux

We produce two Linux builds: `Gnu` and `MUSL`.

The `Gnu` builds use [Sixel](https://en.wikipedia.org/wiki/Sixel) for displaying images in the terminal
and provides the greatest compatibility for terminal images, and gives the best experience using Slipway.

The `MUSL` builds do not use Sixel, but should still support images in Kitty.
If you're running Slipway on a server then terminal images aren't important and the MUSL build should be fine.


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
