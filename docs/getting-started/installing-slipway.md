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
```sh
brew install libsixel
```

### Linux

We produce two Linux builds: `Gnu` and `MUSL`.

#### Gnu Builds
The `Gnu` builds use [Sixel](https://en.wikipedia.org/wiki/Sixel) for displaying images in the terminal.
This build provides the greatest compatibility for terminal images, which in turn give the best experience using Slipway.

If you see the error `error while loading shared libraries: libsixel.so.1` then you will need to install 
`libsixel-bin` using `apt-get` or similar. For example
```sh
sudo apt-get update
sudo apt-get install -y libsixel-bin
```

#### MUSL Builds
The `MUSL` builds do not use Sixel, but should still support images in terminals such as Kitty or even Windows Terminal.
If you're running Slipway on a server then terminal images aren't important and the MUSL build should be fine, of if
you know you don't need Sixel then the MUSL build is a good choice for wide compatibility with Linux distributions.

#### Other Issues
If you encounter other issues you may also need to ensure you have `libssl-dev` and `fontconfig` installed.

### Windows

We don't currently produce native Windows builds, however the Linux builds work fine in WSL.
Windows Terminal seems to display images fine using the MUSL Linux build.

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

## Testing your installation

Running the following command will test that slipway can download and run components:
```sh
slipway run-component "slipwayhq.modify.0.5.0" \
    --input "{\"data\":{\"foo\":1},\"instructions\":[{\"type\":\"set\",\"path\":\"foo\",\"value\":2}]}"
```

It should report that the Component produced the output:
```json
{
  "data": {
    "foo": 2
  }
}
```

Running the following will test if terminal images are working:
```
slipway run-component "slipwayhq.render.0.6.1" \
    --allow-fonts \
    --input "{\"canvas\":{\"width\":100,\"height\":100},\"card\":{\"type\":\"AdaptiveCard\",\"verticalContentAlignment\":\"center\",\"body\":[{\"type\":\"TextBlock\",\"horizontalAlignment\":\"center\",\"text\":\"hello\"}]}}"
```

It should display the Component output as a white square containing the text "hello".

If your terminal doesn't display the image, you can add the `-o output.png` argument to write
the output image to an `output.png` file.
