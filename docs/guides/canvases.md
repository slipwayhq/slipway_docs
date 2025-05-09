---
sidebar_position: 25
---

# Canvases

A "canvas" in Slipway is a specially formatted JSON snippet which represents an image.

Components which render images will output their results in the canvas format, and Slipway
recognizes the format and understands that it should be displayed as an image.

The canvas format is very simple. It is a `canvas` property whose value is an object containing three properties:

- `width`: The width of the image.
- `height`: The height of the image.
- `data`: The encoded RGBA bytes of the image.

The `data` property is the RGBA bytes of the image encoded as a string using the
[Slipway Host API's `encode_bin` method](/docs/basics/host-api#binary-encoding-and-decoding).

## Output Schema

The output schema in a [`slipway_component.json`](/docs/basics/components#configuration) file for a Component which
returns a Canvas this might look like this:

```json title="slipway_component.json"
{
  // ...
  "output": {
    "properties": {
      "canvas": {
        "properties": {
          "width": {
            "type": "uint32"
          },
          "height": {
            "type": "uint32"
          },
          "data": {
            "type": "string"
          }
        }
      }
    }
  }  
  // ...
}
```

Because outputting a canvas is extremely common, Slipway supports shortening this to just:

```json title="slipway_component.json"
{
  // ...
  "output": "canvas"
  // ...
}
```
