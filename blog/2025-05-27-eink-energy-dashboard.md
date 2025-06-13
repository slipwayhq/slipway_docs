---
slug: eink-energy-dashboard
title: Modularizing George Cave's eInk Energy Dashboard
authors: [jamesthurley]
tags: [examples]
image: /img/blog/eink-energy-dashboard-hero.jpg
---

![How to create an Energy Dashboard for an eInk TRMNL display](/img/blog/eink-energy-dashboard-hero.jpg)

This article is about how I took the fantastic home energy dashboard 
[designed by George Cave](https://interactionmagic.com/Octopus-solar-energy-dashboards) and re-implemented it
using [Slipway](https://slipway.co/).

As part of the conversion I modularized it so that anyone can plug in their own data providers
and rearrange the components, and added a basic theming system so users can customize
how it looks.

I then deployed it on my own eInk display so that I can see the status of
my house battery and power usage at a glance, and as an added bonus I deployed it to my Apple Watch as well.

All this has been done in a way that makes it straightforward for anyone to pick up and
use for their own home energy dashboards.


<!-- truncate -->

## Aspirations

I actually already had a chart running on my [eInk display](https://usetrmnl.com/) in the kitchen.
You can see it here on the left, and also as a color iPhone widget on the right:

![The first energy chart on TRMNL](/img/blog/eink-energy-dashboard-original-chart.jpg)

I was fairly happy with this setup, it did the job after all, until I saw 
[George Cave's blog post](https://interactionmagic.com/Octopus-solar-energy-dashboards)
about his own energy dashboard.
It was everything that I didn't have the patience, or design chops, to create myself.

Not only that, but it was the perfect example to show how you can use Slipway to build modular,
reusable Components that can be assembled into beautiful dashboards.

In this post I go through George's dashboard section by section and build a Slipway Component for each bit.
The Slipway version is going to be modular in the sense that:

- You can plug in your own data providers. Not everyone is going to be with Octopus Energy, or have a GivEnergy battery, so I need to let people
swap out those Components with ones relevant to them.

- You can pick and choose the components, move things around,
change the aspect ratio, theme, and supplement it with your own components.

Here's a diagram showing each Component we're going to build, with the two data provider Components
in the top left, and lines showing how the data flows from the data providers to the visualizations:

![Annotated Dashboard](/img/blog/eink-energy-dashboard-annotated.png)

Like George, I have a house battery and solar panels, and an Octopus Energy tariff.

Unlike George my battery comes from a company called GivEnergy, which thankfully provides a much better API than what George
had to deal with.

George is using an eInk display which can display red and yellow in addition to black and white,
which is a big advantage over mine and makes it really vibrant. However by making the Components themeable
I'll ensure that it looks great on both color screens and on my own black and white display.

## Setting Things Up

I'm going to start by creating a folder for the project which will contain all
the Components, Rigs, and any other files I need.

:::info[Aside]
In Slipway a Rig is what composes (or, indeed, rigs together) all the Components into a single dashboard.
:::

I'll show how the filesystem looks at various stages as I build the Components.

### Environment Variables
I'm also going to ensure any sensitive data I need is in environment variables.

The four variables I'll need for this project are:

- __`GIVENERGY_API_TOKEN`__: 
The API token for the [GivEnergy API](https://givenergy.cloud/docs/api/v1).
- __`GIVENERGY_INVERTER_ID`__:
The ID of the inverter to query through the GivEnergy API.
- __`OCTOPUS_API_TOKEN`__:
The API token for the [Octopus Energy API](https://developer.octopus.energy/).
- __`OCTOPUS_ACCOUNT_NUMBER`__:
The account number to query through the Octopus Energy API.

For the remainder of the article you can assume I've got these environment variables populated when I run
commands on the terminal.

### Server Configuration

I'm going to initialize a Slipway server configuration file which will allow me to display the Rigs and 
Components in my browser as I build them.

```sh
slipway serve . init-config
slipway serve . add-api-key
```

The first command creates a default configuration file called `slipway_serve.json`.

The second command updates the `slipway_serve.json` with a randomly generated hashed API key,
and displays the unhashed key in the terminal output.
I'll copy the unhashed version of the API key and save it somewhere secure for later,
as it is this key which will authorize me to view the dashboard in the browser.

```txt title="Filesystem" {2}
slipway_energy_dashboard
└─ slipway_serve.json
```

### Skeleton Rig

Next I'll create a Rig within the server folder structure to display the dashboard:

```
slipway serve . add-rig --name energy_dashboard --allow-all
```

A Rig is just a JSON file. The file will be created in a `rigs` folder, and the Rig's permissions will be
saved to the `slipway_serve.json` configuration file.

Slipway uses a deny-by-default permission system for Rigs and Components, but in the above command
I specified [the `--allow-all` permission](/docs/basics/permissions) because I'm creating this Rig myself,
and so I trust it. We will still have to give each Component explicit permissions, as we'll see later.

```txt title="Filesystem" {3-4}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
   └─ energy_dashboard.json
```

The `energy_dashboard.json` currently contains an empty Rig, so I'll flesh this out using George's dashboard as a guide,
and using the `slipwayhq.render` Component to [create a basic layout](/docs/basics/laying-out-components) in Adaptive Cards syntax.

:::info[Aside]
Slipway is renderer agnostic, and has many rendering Components including JSX and SVG, both of which we'll use
later. However the `slipwayhq.render` Component, which uses the Adaptive Cards JSON syntax, is good for
laying out other Components.
:::

Here is the skeleton layout:

<details>
  <summary>Show `energy_dashboard.json`</summary>

```json title="energy_dashboard.json"
{
  "rigging": {
    "render": {
      "component": "slipwayhq.render.0.7.0",
      "allow": [
        {
          "permission": "fonts"
        }
      ],
      "input": {
        "canvas": {
          "width": 480,
          "height": 800
        },
        "card": {
          "type": "AdaptiveCard",
          "body": [
            {
              "type": "Container",
              "style": "warning",
              "bleed": true,
              "items": [
                {
                  "type": "TextBlock",
                  "size": "extraLarge",
                  "text": "Today's date here",
                  "wrap": true
                },
                {
                  "type": "TextBlock",
                  "text": "Last updated time here",
                  "wrap": true
                }
              ]
            },
            {
              "type": "Container",
              "height": "stretch",
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Flow chart here"
                }
              ]
            },
            {
              "type": "Container",
              "height": "stretch",
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Energy graph here"
                }
              ]
            },
            {
              "type": "ColumnSet",
              "height": "stretch",
              "columns": [
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": "Energy rates here"
                    }
                  ]
                },
                {
                  "type": "Column",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": "Yesterday's costs"
                    }
                  ]
                }
              ]
            },
            {
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": "Lifetime: "
                    }
                  ]
                },
                {
                  "type": "Column",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": "X MWh"
                    }
                  ]
                },
                {
                  "type": "Column",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": "X MWh export"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  }
}
```
</details>

I can view this in my browser by first starting the server...

```sh
slipway serve .
```

... and then navigating to the following URL, replacing `<API_KEY>` with the one I saved earlier:

```
http://localhost:8080/rigs/energy_dashboard?authorization=<API_KEY>
```

The browser will display the following image of the rendered dashboard:

![Basic Layout](/img/blog/eink-energy-dashboard-basic-layout.png)

This puts me in a pretty good position to start creating the Components which will fetch the data and render the visualizations.

As I create each Component I can add them to the Rig above, and then as I make changes 
to the Components I can simply refresh the page in my browser to see my progress.

I'll come back to this Rig at the end, and show the final version.

## Creating the Components

We can split the components into two categories: data sources and visualizations.

### Data Sources

These Components will fetch data from external sources, and output raw JSON which can be fed into
the visualization Components:

- __`givenergy`__: This will fetch my solar, battery and power data from the GivEnergy API.
- __`octopus_tariff`__: This will fetch my Octopus tariff data from the Octopus API.

If other people want to use this dashboard but have different data providers 
they can simply swap out these Components for different ones, as long as they output
the data in the same structure.

### Visualizations

These Components will take the data provided by the data source Components
and render each section of the dashboard:

- __`energy_flow_chart`__: The top graphic in George's dashboard showing the house.
- __`energy_graph`__: The chart showing solar generation, energy usage and battery level over time.
- __`tariff_rate_graph`__: The chart showing today's electricity tariff rates throughout the day.
- __`energy_cash_flow`__: The box showing what we spent importing and what we were paid exporting.
- __`energy_lifetime`__: The final graphic showing the lifetime energy generated and exported.

This is how the Components correspond to the layout of the dashboard:

![Annotated Dashboard](/img/blog/eink-energy-dashboard-annotated.png)

This is quite a lot of Components, but each one ends up being a fairly small amount of code.

To keep this post a reasonable length I'll just give a brief explanation and show the source
code of each one. Don't feel you have to look at every line, the idea is just to give a general
idea of what is involved in creating each Component.

### Components Folder Structure

Each Component will have its own folder under a parent `components` folder,
and each Component folder will contain a `slipway_component.json` file which contains the Component metadata.

To quickly create the initial `slipway_component.json` file for each Component I can run the following from inside the folder,
replacing `<NAME>` with the name of the Component:

```sh
slipway init-component --publisher jamesthurley --name energy_dashboard__<NAME>
```

For example, in the `components/octopus` folder I'll run
```sh
slipway init-component --publisher jamesthurley --name energy_dashboard__octopus
```

Prefixing each Component name with `energy_dashboard__` is called
[_namespacing_ the Component](/docs/guides/component-registries#namespaces),
and allows me to publish them all together in a single GitHub repository, while
still making them discoverable in the Slipway Component Registry.

:::info
The Slipway Component Registry is just a thin wrapper around GitHub releases,
which is why this convention matters.
:::

My folder structure now looks like this:

```txt title="Filesystem" {5-21}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  └─ slipway_component.json
   ├─ energy_graph
   │  └─ slipway_component.json
   ├─ givenergy
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```

All these Components are going to be Javascript Components (rather than WASM Components), and so in addition
to the `slipway_component.json` each one will contain a `run.js` which exports a `run` function.

The `slipway_component.json` and a `run.js` is literally all that is required to have a functioning Component
in Slipway.

### The `givenergy` Component

I already have most the code I need for this one as part of my original dashboard, so all I need is to
create the `run.js` file and paste in the necessary bits, with a few modifications.

The main challenge with this Component is that the GivEnergy API makes you request data
page by page, and you end up having to make about 30 requests just to get 2 days worth of data.
To speed this up I parallelize the requests as much as possible,
which adds some minor complexity to the code.

I'm also careful to use the user's timezone when determining today's date. It's easy to get caught out by this
when you live in the UK, as for half the year your timezone is the same as UTC.

Rather than returning the raw GivEnergy API data, I return a simplified version to keep things provider agnostic.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/givenergy/run.js}
</details>

Next I need to update the `slipway_component.json` with the input and output schemas so that
Slipway can validate the data. This is particularly useful in dynamically typed languages
like Javascript, as it gives us certainty that we're receiving and returning the data we expect.
We're using [JsonTypeDef](https://jsontypedef.com/) here to specify the schemas.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/givenergy/slipway_component.json}
</details>

I can quickly test this Component with the following command:
```
slipway run-component "file:components/givenergy" --allow-http --allow-env --input "{}"
```

I've written the Component so that it can take the Inverter ID and API Token as part
of the JSON input but falls back to environment variables.

As I have the environment variables set already I can
pass in an empty object for the input, and specify the `--allow-env` permission so it can access environment variables.
We also specify `--allow-http` so that it can make HTTP requests.

When we put this Component in our Rig we'll tighten up these permissions to only allow API calls
to the GivEnergy servers, and only allow access to environment variables starting with `GIVENERGY_`.

The output contains two sections, `today` and `yesterday`, and each of those contains a `power` section
which contains the power data for each part of the day, a `day` section containing the day's summary,
and a `total` section containing the lifetime summary.

It looks something like this:

<details>
  <summary>Show `givenergy` Component output</summary>

```json
{
  "today": {
    "power": [
      {
        "battery": 203,
        "battery_percent": 86,
        "consumption": 203,
        "grid": 0,
        "solar": 0,
        "time": "2025-05-29T23:03:31Z"
      },
      {
        "battery": 202,
        "battery_percent": 86,
        "consumption": 203,
        "grid": 1,
        "solar": 0,
        "time": "2025-05-29T23:08:33Z"
      },
      // etc...
    ],
    "day": {
      "ac_charge": 0.7,
      "battery": {
        "charge": 0.7,
        "discharge": 2.8
      },
      "consumption": 5.4,
      "grid": {
        "export": 0.1,
        "import": 1.7
      },
      "solar": 1.8
    },
    "total": {
      "ac_charge": 859.7,
      "battery": {
        "charge": 788.2,
        "discharge": 788.2
      },
      "consumption": 7520.8,
      "grid": {
        "export": 187.7,
        "import": 1719.8
      },
      "solar": 6117.7
    }
  },
  "yesterday": {
    "power": [
      {
        "battery": 189,
        "battery_percent": 91,
        "consumption": 192,
        "grid": 1,
        "solar": 0,
        "time": "2025-05-28T23:04:37Z"
      },
      {
        "battery": 190,
        "battery_percent": 90,
        "consumption": 194,
        "grid": 2,
        "solar": 0,
        "time": "2025-05-28T23:09:39Z"
      },
      // etc...
    ],
    "day": {
      "ac_charge": 3.8,
      "battery": {
        "charge": 3.8,
        "discharge": 4.6
      },
      "consumption": 9.2,
      "grid": {
        "export": 4.7,
        "import": 1.1
      },
      "solar": 11.9
    },
    "total": {
      "ac_charge": 859,
      "battery": {
        "charge": 786.4,
        "discharge": 786.4
      },
      "consumption": 7515.4,
      "grid": {
        "export": 187.6,
        "import": 1718.1
      },
      "solar": 6115.9
    }
  }
}
```
</details>

It should be straightforward for anyone who isn't using a GivEnergy battery and inverter to
call their own provider's API and return data in the same format.

Note that in the above data the timestamps for each day are starting just after `23:00:00Z`, because
I'm currently a UTC+1 timezone.

```txt title="Filesystem" {12-14}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  └─ slipway_component.json
   ├─ energy_graph
   │  └─ slipway_component.json
   ├─ givenergy
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```

### The `energy_graph` Component

I'm going to tackle this one next so we have something to look at, and because I already had a similar
graph with my original dashboard.

I'm going to use the `slipwayhq.echarts` renderer Component to render the chart, so all my code
has to do is output a valid ECharts definition.

Most of the time here was spent fiddling with the graph, looking at the 
[ECharts documentation](https://echarts.apache.org/en/option.html),
getting it to look like George's version.
I did add some dashed horizontal axis split lines, to make reading the chart easier.
This is the end result:

![Energy Graph](/img/blog/eink-energy-dashboard-energy-graph.png)

I was quite pleased with the battery image, as I just asked ChatGPT o3:

> Can you create a javascript function which will take a charge value between 1 and 100, and a width and height and return an SVG path vector of a vertically oriented battery symbol showing the appropriate charge. The result should be a string starting `path://`.

It successfully one-shotted the resulting function.
I then tweaked it slightly for aesthetic reasons: The ChatGPT version was a dark outer boarder with 
an light inner rectangle representing charge, so I added a full height light inner rectangle and made the charge a black rectangle
inside of that.

The `slipway_component.json` input schema is a subset of what the `givenergy` Component outputs, as I only need
the data from a single day to draw this chart.

The output is a [Canvas](/docs/guides/canvases), and you can see that the `rigging` section uses
the `slipwayhq.echarts` Component to render the canvas using the output of my `run.js` script.

I also added some optional properties to theme the chart, as well as `width` and `height` properties
so it knows what size to render the chart.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/slipway_component.json}
</details>

The `run.js` code is primarily just constructing the ECharts definition, along with the function which
generates the battery icon at the bottom of the file.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/run.js}
</details>

I found that I couldn't quite match George's delightfully minimalist X axis style
without using a Javascript function as the label formatter.

However my ECharts JSON needs to be serialized so it can be passed through to the `slipwayhq.echarts` Component,
making functions a no-go.

To get around this I released a new version of `slipwayhq.echarts` which would optionally take 
some Javascript to run within the component, and I could use this to attach
Javascript formatters to the chart definition from inside the `slipwayhq.echarts`
component:

<details>
  <summary>Show `apply.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/apply.js}
</details>

This means that we have three files for the `energy_graph` Component:

```txt title="Filesystem" {10-13}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  └─ slipway_component.json
   ├─ energy_graph
   │  ├─ apply.js
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ givenergy
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```

### The `energy_flow_chart` Component

To create this Component I first approximated George's diagram in [InkScape](https://inkscape.org/).
I then exported it to a plain SVG, and then ran it through [SVGOMG](https://jakearchibald.github.io/svgomg/)
to simplify it and make it suitable for human editing.

![Inkscape Screenshot](/img/blog/eink-energy-dashboard-inkscape.png)

After that I spent far to long manually simplifying it even further.
In particular I adjusted most of the transforms
as InkScape created groups with large negative translations which then had inner elements with
large positive translations to compensate.

AI helped again to automate adjusting the paths.
I found I could reliably ask it to remove a transform from a group and adjust everything inside to compensate.

Next I needed to turn the SVG file into a template so that I could color the various parts as per the theme specified by the
user, and insert the actual numbers from the data.

I considered using a templating engine, but I wanted the SVG to be viewable as a normal SVG so that
I could edit it and immediately see the results in a browser.
That constraint meant templated colors had to be valid, rather than, for example, `{solar_color}`.

In the end I settled on using special colors like `#00ff00fe` that I could simply search and replace
with user specified colors, and strings like `{s}` that I could search and replace with actual numbers.

I was concerned that as I replaced each color in turn, one of the colors I inserted would clash with
one of the `template` colors yet to be replaced.
To make this unlikely I used an alpha value of `fe` in all of the template colors.
That alpha value would still let me view the SVG template, but it was unlikely to be specified as part of
a theme by any sane user.

The result was very pleasing, and the Component turned out to be extremely trivial to write.

![Energy Flow Chart](/img/blog/eink-energy-dashboard-energy-flow-chart.png)

The Javascript for this Component simply loads the SVG template, replaces the template values, and returns the result.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_flow_chart/run.js}
</details>

The `slipway_component.json` handles passing the resulting SVG on to the `slipwayhq.svg` component to be rendered.

The input schema is the relevant subset of the single day summary output by the `givenergy` Component, along
with the width and height of the image we need to render.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/energy_flow_chart/slipway_component.json}
</details>

For completeness, I'll include the final SVG template here as well:

<details>
  <summary>Show `flow.svg`</summary>
::insert{file=slipway_energy_dashboard/components/energy_flow_chart/flow.svg}
</details>

```txt title="Filesystem" {8-11}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  ├─ flow.svg
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_graph
   │  ├─ apply.js
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ givenergy
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```

### The `energy_lifetime` Component

After the previous Component this one should be trivial, right?

Surprisingly, it posed some challenges.

My first thought was to do it all in SVG, but the issue is that SVG requires each piece of text to be positioned
absolutely. This is hard to do trivially when the text is interspersed with icons, and I don't know what the font
the user might decide to use.
It would be quite easy to end up with janky spacing, or even worse, overlapping text.
And I didn't want to go down the route of measuring the text programmatically while generating the SVG. That's too much complexity.

My second thought was to use a mix of Adaptive Cards and SVG icons, however I quickly hit upon a limitation of Adaptive Cards
which is that it isn't very good at putting text of different sizes on one line, as it has no way to line up the baselines.

This is what that ended up looking like, with the debug bounding boxes enabled:

![Adaptive Cards Energy Lifetime](/img/blog/eink-energy-dashboard-lifetime-ac-debug.png)

You can see it is centering the text vertically, with a height measurement that includes the descender space.

So with SVG we get janky horizontal alignment. With Adaptive Cards we get janky vertical alignment.

How about JSX? I tend to pick the `slipwayhq.jsx` renderer last because it's (currently) quite a slow renderer relative to SVG or Adaptive Cards.

But despite these performance issues, JSX did give me rather a nice result with minimum fuss:

![JSX Energy Lifetime](/img/blog/eink-energy-dashboard-lifetime-jsx.png)

:::info[Aside: Javascript Renderer Performance]
The Javascript renderers (for example `slipwayhq.echarts` and `slipwayhq.jsx`) are significantly slower
than the WASM renderers (for example `slipwayhq.svg` and `slipwayhq.render`), which are written in Rust.

I'm fairly certain this is because of the Javascript runtime that I'm using in Slipway.

On my M3 Macbook Air both this simple Component and the `energy_graph` Component each take about 400ms
to execute their Javascript renderers, where as the `energy_flow_chart` component takes just a few milliseconds to render the SVG.

To fix this, I plan to try moving from the Boa Javascript runtime to the Deno/V8 runtime, which I suspect
might largely eliminate the problem.

It makes me sad to move away from a community driven, open-source Javascript runtime written entirely in Rust,
and swap it out for a megacorp C++ runtime with a Rust wrapper made by a VC funded company.
But I think most people will be far more bothered about 400ms vs 4ms than these ideals.
I'll write about how this goes in a future blog post.
:::

Once again the actual Javascript for this Component is quite simple.
I do a few calculations at the top to decide if I should display in `mWh` or `kWh`, and then
I load the JSX template, swap out the colors, and return the resulting JSX along with the data for it to bind to:

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_lifetime/run.js}
</details>

The `slipway_component.json` once again defines a subset of the GivEnergy data as its input schema,
and passes the output through the `slipwayhq.jsx` renderer.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/energy_lifetime/slipway_component.json}
</details>

And this is what the JSX looks like:

<details>
  <summary>Show `lifetime.jsx`</summary>
::insert{file=slipway_energy_dashboard/components/energy_lifetime/lifetime.jsx}
</details>

```txt title="Filesystem" {19-22}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  ├─ flow.svg
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_graph
   │  ├─ apply.js
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ givenergy
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  ├─ lifetime.jsx
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```


### The `octopus_tariff` Component

For the remaining Components I'll need some tariff data, so let's do that next.

This is another fairly straightforward data fetching Component.

It takes the user's API token and account number, and returns a data structure with half-hourly
prices for the current day, taking the user's time zone into account.

Depending on what tariff you're on, Octopus will either return quite course-grained data 
(for the Go tariff, only a few spans per day) or
quite fine-grained (30 minute spans for the Agile tariff).

I wanted to turn this into a standard format: a list of 48 prices in 30 minute slots, to
cover the user's current day. AI is perfect for this kind of data wrangling, so I just asked
ChatGPT to generate the function for me, and it obliged.

Similar to the `givenergy` Component, this one takes the account number and API token as optional inputs,
falling back to environment variables.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/octopus_tariff/run.js}
</details>

The `slipway_component.json` is pretty standard, the important part is that it
establishes the output schema that other tariff data provider Components should follow
to be compatible with the visualizations.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/octopus_tariff/slipway_component.json}
</details>

```txt title="Filesystem" {23-25}
slipway_energy_dashboard
├─ slipway_serve.json
└─ rigs
│  └─ energy_dashboard.json
└─ components
   ├─ energy_cash_flow
   │  └─ slipway_component.json
   ├─ energy_flow_chart
   │  ├─ flow.svg
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_graph
   │  ├─ apply.js
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ givenergy
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ energy_lifetime
   │  ├─ lifetime.jsx
   │  ├─ run.js
   │  └─ slipway_component.json
   ├─ octopus_tariff
   │  ├─ run.js
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```

### The `tariff_rate_graph` Component

George was on the the Octopus Agile tariff, which varies electricity prices every 30 minutes throughout the day.
I have a simpler tariff one called Octopus Go, designed for electric car owners, that
just gives you a cheap overnight rate for charging batteries or doing other energy intensive tasks.

This makes the chart less useful to me, as it will be the same every day, but
I'm still going to implement it because I like it.

Once again, most of the time here was spent fiddling with the ECharts definition
to get it looking close to George's chart. I made a few minor changes, partly because
I'm not on the Agile tariff so have different requirements, but I'm happy
with the end result:

![Tariff Rate Graph](/img/blog/eink-energy-dashboard-tariff-rate-graph.png)

The "Today's Rates" title in the screenshot isn't part of the Component.
I decided to put it in the Rig instead, as it felt like part of the
Rig styling and layout responsibilities than something every user of the Component would want.

The `run.js` is just some data wrangling and EChart definition construction.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/tariff_rate_graph/run.js}
</details>

The `slipway_component.json` is pretty standard as well. It takes the half-hourly pricing 
data and some optional theming parameters, and passes the `run.js` output to the
`slipwayhq.echarts` renderer.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/tariff_rate_graph/slipway_component.json}
</details>

And once again I'm passing code from `apply.js` through to the ECharts
Component so that I can attach more complex formatters to the ECharts definition.

<details>
  <summary>Show `apply.js`</summary>
::insert{file=slipway_energy_dashboard/components/tariff_rate_graph/apply.js}
</details>

One vaguely interesting point here is that I wanted to change the color of the bars
based on whether they were above or below the average tariff price, which meant
the `color` function in `apply.js` needed access to the average value, or at least the desired color
for each bar.

Because the `apply.js` is run inside the ECharts component I can't hoist in variables like I
would if I was attaching it as a lambda expression from `run.js`, so instead 
I set the series data in `run.js` to an object that contains the desired bar color:

```js
const average = prices.reduce((sum, val) => sum + val, 0) / prices.length;
const enrichedPrices = prices.map(price => ({
  value: price,
  color: price >= average ? barHighColor : barLowColor,
}));
```

Then in `apply.js` I can simply pull the color out of that enriched data:
```js
chart.series[0].itemStyle.color = function (params) {
  return params.data.color || "black";
};
```

### The `energy_cash_flow` Component

This was another Component which looked like it would be trivial but had some unexpected complexity.

First of all I had to run through all the power data from GivEnergy, which is in 5 minute
intervals, and match it to the price information from Octopus, which is in 30 minute intervals,
 so that I could calculate what the day's electricity import had cost me.

Then I realized the export isn't as simple as I thought either, because different people
have different kinds of export tariffs:

- Some people have a smart meter which measures exactly how much
electricity they export during the day, and they will be paid based on that.

- Some people (including me) don't have their export measured, and instead
what the solar panels generate is measured and a certain percentage of that is assumed to be exported.

- Some people (including me) also get paid for all solar generated,
irrespective of whether it is exported or used (this was part of a government incentive scheme).

I tried to make this Component handle all the above scenarios (an export rate, a generation rate,
or both).

Because of this I needed to dynamically generate the SVG, as it's size would depend on
how many lines of information it was outputting.

The result of all this is some lines of colored text:

![Cash Flow](/img/blog/eink-energy-dashboard-cash-flow.png)

Which is much simpler than the code which produced it:

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_cash_flow/run.js}
</details>

The `slipway_component.json` will look pretty familiar by now.
It takes both the vector of power information (to calculate the import costs),
the day summary (to more easily calculate the export/generation costs),
along with the energy tariff data (so it knows the prices).

In addition there are optional `export_rate` and `generation_rate` fields, so that you
can set whichever apply to your setup.
Plus the usual optional theming properties.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/energy_cash_flow/slipway_component.json}
</details>

### The `utils` Component

One bonus Component.

The last thing I needed to do was display the date and time at the top of the dashboard.

For this I decided to just create a trivial `utils` Component that would return the appropriately formatted strings.

One minor complication was the Boa Javascript runtime Slipway currently uses doesn't have the `toLocaleString`
methods implemented on Temporal yet, or the formatters on Intl, so I had to generate the date
a bit more manually. Or rather, ChatGPT did.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/utils/run.js}
</details>

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/utils/slipway_component.json}
</details>

## The Final Rig

![Final Rig](/img/blog/eink-energy-dashboard-light-mode.png)

You can expand the final Rig JSON below, and I've highlighted sections which I will explain next.

<details>
  <summary>Show `rigs/energy_dashboard.json`</summary>
::insert{file=slipway_energy_dashboard/rigs/energy_dashboard.json highlight=3-19,23-54,57-101,103-123,128-240}
</details>

### Default Device Context
The first highlighted section, `context`, contains a default device context which will be used
when rendering the Rig directly:

```json
"context": {
  "device": {
    "width": 480,
    "height": 800,
    "theme": {
      "solar_color": "rgb(230, 150, 0)",
      "grid_export_color": "rgb(230, 150, 0)",
      "tariff_bar_low_color": "rgb(230, 150, 0)",
      "grid_import_color": "rgb(125, 0, 0)",
      "tariff_bar_high_color": "rgb(125, 0, 0)",
      "power_used_color": "rgb(255, 255, 255)",
      "battery_color": "rgb(0, 0, 0)",
      "background_color": "rgb(255, 255, 255)",
      "foreground_color": "rgb(0, 0, 0)",
      "header_background_color": "rgb(230, 150, 0)",
      "header_foreground_color": "rgb(0, 0, 0)",
      "cash_flow_line_padding": 30
    }
  }
},
```

This contains a default size and theme for the Rig.
Slipway supports configuring "devices", which represent your real physical devices,
and these can override the default context with their own themes, resolutions, and other settings
(such as image rotation).

### Running the Data Components

The second section is adding the `utils`, `givenergy` and `octopus_tariff` Components,
which will cause them to be executed as part of the Rig.

```json
"utils": {
  "component": "jamesthurley.energy_dashboard__utils.1.0.0",
  "input": {}
},
"givenergy": {
  "component": "jamesthurley.energy_dashboard__givenergy.1.0.0",
  "allow": [
    {
      "permission": "env",
      "prefix": "GIVENERGY_"
    },
    {
      "permission": "http",
      "prefix": "https://api.givenergy.cloud/"
    }
  ],
  "input": {}
},
"octopus_tariff": {
  "component": "jamesthurley.energy_dashboard__octopus_tariff.1.0.0",
  "allow": [
    {
      "permission": "env",
      "prefix": "OCTOPUS_"
    },
    {
      "permission": "http",
      "prefix": "https://api.octopus.energy/"
    }
  ],
  "input": {}
},
```

You can see that the `givenergy` and `octopus_tariff` Components are being given a very restrictive set
of permissions so they can only read data from the places they are supposed to.
The `utils` Component has no permissions at all, so all it can do is execute code.

### Renderer Permissions

Next we have the `slipwayhq.render` Component, which contains the same layout as before but now 
has a couple of extra sections called `allow` and `callouts`.

```json
"render": {
  "component": "slipwayhq.render.0.7.0",
  "allow": [
    {
      "permission": "fonts"
    },
    {
      "permission": "registry_components"
    }
  ],
  "callouts": {
    "energy_flow_chart": {
      "component": "jamesthurley.energy_dashboard__energy_flow_chart.1.0.0",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    },
    "energy_graph": {
      "component": "jamesthurley.energy_dashboard__energy_graph.1.0.0",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    },
    "energy_lifetime": {
      "component": "jamesthurley.energy_dashboard__energy_lifetime.1.0.0",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    },
    "tariff_rate_graph": {
      "component": "jamesthurley.energy_dashboard__tariff_rate_graph.1.0.0",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    },
    "energy_cash_flow": {
      "component": "jamesthurley.energy_dashboard__energy_cash_flow.1.0.0",
      "allow": [
        { "permission": "fonts" },
        { "permission": "registry_components" }
      ]
    }
  },
  ...
}
```

The `allow` section defines the permissions given to the `render` Component, which in this case gives it access
to fonts and other registry components.

The `callouts` section defines what Components the `render` Component will call during execution,
and the permissions given to those Components.

Each of the visualization Components we wrote in this post requires access to fonts, so they can render text, and
permission to access other registry Components, so they can call their respective renderers (`slipwayhq.svg`, `slipwayhq.echarts`, 
`slipwayhq.jsx`).

This boilerplate is part of Slipway's zero-trust security model, which allows us to safely run Components written by others
knowing they can only perform the actions we've explicitly given them permission to perform.

We could restrict these further, specifying exactly what fonts and Components each Component is allowed to access, but
this is a reasonable compromise between security and complexity.

### Loading the Visualizations

With that out of the way we define the input to the `render` Component,
of which the two interesting parts are the `host_config` and `card` sections.

#### The Host Config

The "host config" is how Adaptive Cards allows a JSON layout to adapt across devices.
Devices (hosts) define their specific colors, margins, fonts, and other theming properties in their
host config.

In this case we're just constructing a simple host config using parts of our theme,
setting the background and foreground (text) colors for the `default` and `attention`
styles. We use the `attention` style for hour header at the top of the dashboard.

```json
"host_config": {
  "containerStyles": {
    "default": {
      "backgroundColor": "$.context.device.theme.background_color",
      "foregroundColors": {
        "default": {
          "default": "$.context.device.theme.foreground_color"
        }
      }
    },
    "attention": {
      "backgroundColor": "$.context.device.theme.header_background_color",
      "borderThickness": 0,
      "foregroundColors": {
        "default": {
          "default": "$.context.device.theme.header_foreground_color"
        }
      }
    }
  }
}
```

#### The Card

I won't inline the entire card here as it is quite long, but you can expand the full `energy_dashboard.json`
above to see them.

The `card` section is our original skeleton layout from the start of this post,
tweaked slightly, and with the placeholder text replaced with our new visualization Components.

The snippet below shows an example of how the `slipwayhq.render` Component lets us 
insert one of our visualizations:

```json title="energy_flow_chart" 
{
  "type": "Image",
  "height": "180px",
  "spacing": "large",
  "url": "component://energy_flow_chart?width=$width&height=$height",
  "body": {
    "data": "$$.givenergy.today.day",
    "theme": "$.context.device.theme"
  }
},
```

So our Components, which return [Canvases](/docs/guides/canvases) (which are just images),
are inserted like any other image except they are using a special `component://` URL scheme.

Starting with the request body, you'll see that it contains some JsonPath queries
which are referencing part of the output of the `givenergy` Component, and our theme.

:::info[Aside]
As mentioned in [the docs](/docs/basics/rigs#rigginginput), in the `$$.givenergy` syntax is just a useful shortcut
for the JsonPath query `$.rigging.givenergy.output`.
:::

Slipway uses these JsonPath queries to plan the execution order of Components, and will
replace the queries with the referenced data before the `slipwayhq.render` Component is run.

Next, looking at the URL, when the `slipwayhq.render` Component comes across an image URL 
containing `$width` or `$height` variables it delays fetching the image until
it has performed the layout pass, so that it knows the precise size the image needs to be.

It then replaces the `$width` and `$height` parameters with the actual
width and height before passing the URL, along with the request body, to Slipway.

The `slipwayhq.render` Component doesn't actually care about the `component://` scheme. It would do this for
any image URL.

Slipway does understand the `component://` scheme however.
The scheme causes it to execute the requested Component,
passing in the request body as the input.

The `energy_flow_chart` Component then executes and returns an image which is precisely
the right size to be placed into the final dashboard.

While there is a bunch of complexity here, for the most part it is all handled for us
behind the scenes by Slipway and the `slipwayhq.render` Component.

What it boils down to is that our Component is inserted into the Dashboard as an image,
and Slipway takes care of running it.

## Sharing the Components

I've published all these Components along with the example Rig
[in GitHub here](https://github.com/jamesthurley/slipway_energy_dashboard).

I've also created a GitHub release, which means the Components are now automatically available
in the [Slipway Component Registry](/docs/guides/component-registries#slipway-component-registry).

This means that anyone can now use these Components: Slipway will find and download them
automatically if you reference them in your Rigs.

I'm using these Components in my own self-hosted Slipway server, and you can see 
[how I do that here](https://github.com/jamesthurley/slipway_self_host).


## The Final Result

As I mentioned in the introduction, my current eInk TRMNL isn't color, but with some tweaking of the
theme and some Atkinson dithering (automatically done by Slipway), it still looks great!

![Energy Dashboard on TRMNL](/img/blog/eink-energy-dashboard-trmnl.jpg)

## One Last Thing

We made this modular and themeable for a reason, so let's take advantage of that now and
create bonus widget for my Apple Watch.

Here is a Rig for displaying the energy graph and cashflow on my Apple watch, using
a dark mode theme and sized for the rectangular widget:

<details>
  <summary>Show `rigs/watch_energy_dashboard.json`</summary>
::insert{file=slipway_energy_dashboard/rigs/watch_energy_dashboard.json}
</details>

Here is how that renders:

![Apple Watch Dashboard](/img/blog/eink-energy-dashboard-watchos-widget.png)

And finally, here is how it looks running on my (very battered looking) watch:

![Apple Watch Dashboard](/img/blog/eink-energy-dashboard-watchos-photo.jpg)

I could really do with adding some additional theme parameters for font sizes, 
and support for high density displays, but I think that will do for the sake of
getting this post published.

## Conclusions

### The Energy Dashboard

I'm super happy with how the dashboard turned out, and how closely it matches George Cave's
original design. If he comes across this, I hope he takes the imitation as flattery.

While this was quite a long post, with a fair amount of code, I think each individual
Component is quite short and simple.

The real goal of Slipway is that when I have an idea for something I want to display "ambiently",
so on an eInk screen in my home, or a widget on my watch, to reduce the amount of boilerplate right
down to just the code required for the particular job at hand.

This was the first "proper" dashboard I've written in Slipway and I'm really happy with how much I've achieved that goal.

### Slipway Improvements

As I implemented the dashboard I came across some issues which have been added to the backlog.

This section is as much to keep a record for myself as much as it is to inform others.

- __Javascript performance.__ As I mentioned above, Javascript performance is becoming an issue with more complicated
Rigs like the one we've just created. I'm going to try moving to a different Javascript runtime
which should in theory be much faster. I do it reluctantly as I really want to stick with Boa, but unfortunately some of these
big libraries like ECharts and Satori are just taking too long to execute.

- __Support for different pixel densities.__ This hasn't been an issue for me yet, but I can see it becoming an issue
soon. At the moment if you specify a really high resolution display you'll get very small fonts, requiring you to make
font sizes configurable. I think if I added support for specifying pixel densities it would help a lot.

- __Streamlined releasing.__ Currently if you want to publish your Components it's _fairly_ easy, but there are some
chores which you have to do that could be automated by Slipway itself, such as updating version numbers in various places.

- __Integrated testing.__ Right now if you're writing a Component in Rust then testing is easy
as you can just use `cargo test`.
However if you're writing a Javascript Component it isn't clear where to put unit tests.
Plus if you want to have integration tests on Rigs you have to set that up manually. I feel like these scenarios are
common enough that Slipway itself could offer a solution.

- __Default fonts.__ I improved the default font handling as I wrote this blog post, but right now there isn't an easy
way to override the default font for the entire Rig.

These are currently next on my todo list, and I'll blog about them as I get to them.

### Give Slipway a try!

If you want to give Slipway a go yourself, the [front page](/) is a good place to start, or the [docs](/docs/intro).

I'd also love to chat about any issues you have, ideas you have, or see what you've created in
[the Zulip chat](https://slipway.zulipchat.com/).

I've also just started an [Instagram account](https://www.instagram.com/slipwayhq/) where I'll post anything Slipway related.

Thanks for reading!
