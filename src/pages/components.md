---
title: Components
---

# Components

## [`slipwayhq.render`](https://github.com/slipwayhq/slipway_render)

This renderer uses [Adaptive Cards](https://adaptivecards.io/) JSON to layout elements on the dashboard, and can call out
to other renderers to embed charts, SVGs, or anything else.

## [`slipwayhq.svg`](https://github.com/slipwayhq/slipway_svg)

Renders [SVG markup](https://developer.mozilla.org/en-US/docs/Web/SVG) to an image.

## [`slipwayhq.echarts`](https://github.com/slipwayhq/slipway_echarts)

Renders [echarts](https://echarts.apache.org/examples/en/index.html) definitions to an image.

## [`slipwayhq.jsx`](https://github.com/slipwayhq/slipway_jsx)

Renders [JSX markup](https://og-playground.vercel.app/) to an image.

## [`slipwayhq.fetch`](https://github.com/slipwayhq/slipway_fetch)

Fetches and outputs the requested URLs, files, or anything else supported by the Host API fetch methods.
Useful for loading files to provide as an input to other Components.

## [`slipwayhq.modify`](https://github.com/slipwayhq/slipway_modify)

Uses a simple syntax to make changes to JSON. Useful for manipulating the output of one Component before
passing it in to another Component.

