---
title: Components
---

# Slipway HQ Components

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

# Community Components

If you've created components of your own, that others might like to use, [let me know](/community) and I can
feature the best ones here. 

## [`jamesthurley.givenergy_cloud`](https://github.com/jamesthurley/slipway_givenergy_cloud)

Reads solar, battery and power usage information for [GivEnergy](https://givenergy.co.uk/) house batteries and inverters,
and displays them in a handy chart.

The repository also includes an example Rig.

