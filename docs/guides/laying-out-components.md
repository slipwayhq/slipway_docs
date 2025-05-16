---
sidebar_position: 5
---

# Laying out Components

Often you want to view more than one thing at a time in a single Rig.
Perhaps you want your calendar on the left, and the weather on the right.
Or the current time at the top, and a countdown to when you have to leave the office underneath.

Slipway, being renderer agnostic, doesn't provide a way of doing this.
But the [`slipwayhq.render` Component](https://github.com/slipwayhq/slipway_render) does.

:::info[Aside]
The Render Component is a partial implementation of an [Adaptive Cards](https://adaptivecards.io/) renderer.
If you look at the Adaptive Cards website you might wonder why we'd choose to use something
that looks like it was designed for inserting forms into Microsoft Outlook and Teams.

But actually:

> Adaptive Cards are platform-agnostic snippets of UI, authored in JSON.

That sounds ideally suited to Slipway, where Components communicate using JSON and we need
to render dashboards on all kinds of different devices.
:::

While the Render Component is only a partial implementation of Adaptive Cards, it is sufficient to do some
fairly complicated layout. The following was rendered in Slipway using the `slipwayhq.render` Component:

![Adaptive Cards Example](https://github.com/slipwayhq/slipway_render/blob/main/docs/img/example-flight-card.png?raw=true)

## Inserting Components

Laying out text and images is one thing, but what we really want to do is insert the output of Components
into our layout.

Let's start with a simple Rig:



The Render Component has one more trick up its sleeve, which is that when inserting images 
into a layout it allows you to specify not just a URL, but a JSON request body as well.

