---
sidebar_position: 1
---

# Optimizing WASM Size and Speed

This page contains some notes made while trying various options for optimizing WebAssembly files.

The tests were run on the `slipwayhq.svg` crate, compiled from Rust.

> Initial size: 2,923,520 bytes.
>
> Execution time: 160ms.

## Remove `image` create

This crate wasn't actually needed, I was just using it to create the final canvas out of habit.

Size: 2,922,496 bytes.

## Strip symbols

Add to `Cargo.toml`:
```
[profile.release]
strip = true
```

> Size: 2,696,704 bytes


## Optimize for Size

See https://doc.rust-lang.org/cargo/reference/profiles.html#opt-level.

```
[profile.release]
opt-level = "z"
```

> Size: 2,230,272 bytes
> 
> Execution time: 430ms. ❌


```
[profile.release]
opt-level = "s"
```

> Size: 2,438,656 bytes.
> 
> Execution time: 230ms. ❌

I rolled back these optimizations to `opt-level=3`, as performance was more important than
WASM size for my use case.

## Link Time Optimization (LTO)

```
[profile.release]
lto = true
```

> Size: 2,540,544 bytes.
> 
> Execution time: 160ms.

## Reduce Parallel Code Generation Units

```
[profile.release]
codegen-units = 1
```

Size: 2,489,344 bytes.

# The `wasm-opt` tool

The `wasm-opt` tool doesn't currently support WASM Components, so I was unable to use this.

# Using `nanoserde` crate instead of `serde`

> Size: 2,468,352 bytes.

This didn't make much difference to the size or performance, and so didn't seem worth the 
tradeoff of switching to a less familiar serialization library.