---
sidebar_position: 25
---

# Canvases

A "canvas" in Slipway is a specially formatted JSON snippet which represents an image.

Components which render images will output their results in the canvas format, and Slipway
recognizes the format and understands how to display it.

The canvas format is very simple. It contains three properties:

- `width`: The width of the image.
- `height`: The height of the image.
- `data`: The encoded RGBA bytes of the image.

The `data` property must be encoded as a string using the
[Slipway Host API's `encode_bin` method](/docs/basics/host-api#binary-encoding-and-decoding).

