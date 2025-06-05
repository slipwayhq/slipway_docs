---
slug: eink-energy-dashboard
title: eInk Energy Dashboard
authors: [jamesthurley]
tags: [examples]
---

I've been displaying a basic energy chart in my home for a few months now, running on
[a TRMNL device](https://usetrmnl.com/) and powered by [Slipway](https://slipway.co/). But recently I saw
[this post](https://interactionmagic.com/Octopus-solar-energy-dashboards)
by George Cave and it inspired me to do more.

<!-- truncate -->

His post is worth a read, but basically his dashboard looks like this:

![George Cave Energy Dashboard](/img/blog/eink-energy-dashboard-george-cave.jpg)

Whereas my existing dashboard looks like this:

![George Cave Energy Dashboard](/img/blog/eink-energy-dashboard-version-1.jpg)

George is using an eInk display which can display red and yellow in addition to black and white, 
which helps a lot with the vibrancy,
but beyond that his dashboard has just had more thought put into it:

- It displays the current total solar, grid and export power stats for the day in a nice chart, where as on mine you'd have to integrate
 the graph in your head (he says in his post, "don’t make people do maths").

- It displays what you paid for import and what you were paid for export on the previous day.

- It displays a daily price chart for his Octopus Agile tariff.

In addition, his energy chart is similar to mine but has less on it, and in this case I think less is definitely more.
It the chart clearer despite being a much smaller size. Being able to use colors helps here as well.

I'd like to replicate his dashboard using Slipway, so that myself and others can enjoy his work in our own homes, but
with far less effort.

## The Plan

I'm not just going to do a dumb copy however. I'm going to make a few improvements:

- I'm going to separate the data collection from the visualizations so that people can plug in their own data providers.

- I'm going to split the design into multiple Components, so people can mix and match the parts which interest them, 
create their own layouts, and add more information if they need it.

Like George, I have a house battery and solar panels, and an Octopus Energy tariff.

My energy data comes from a different provider, GivEnergy, which thankfully provides a much better API than what George
had to deal with.

Beyond that, for the purposes of this post, I'm going to keep the dashboard as similar as possible.

## Setting Things Up

I'm going to start by creating a folder called `slipway_energy_dashboard` which will contain all
the Components and test Rigs
(in Slipway a Rig is what rigs all the Components together into a single dashboard),
and allow me to view my progress.


:::info[Aside: Environment Variables]

I'm going to want my Components to pull API keys and other sensitive information from environment variables.

To make these easy to manage I'll create a `op.env` file that I can pass into the 
[1Password CLI](https://developer.1password.com/docs/cli/secrets-environment-variables) to populate
the necessary environment variables for this project:

::insert{file=slipway_energy_dashboard/op.env}

I can then use this to start VSCode with the necessary environment variables populated:
```
op run --env-file op.env -- code .
```

Or similarly, to open a terminal:
```
op run --env-file op.env -- open -na Ghostty --args --working-directory="$(pwd)"
```

For the remainder of the article you can assume I've got these environment variables already populated when I run
commands on the terminal.
:::


I'm going to initialize a Slipway server configuration file which will allow me to display the Rig in my browser.

```sh
slipway serve . init-config
slipway serve . add-api-key --name "key1"
```

The `slipway serve . init-config` command creates a default server configuration file `slipway_serve.json`,
which will allow us to view our Rigs in the browser.

The `add-api-key` sub-command updates the `slipway_serve.json` with a randomly generated hashed API key,
and displays the unhashed key in the terminal output.
I'll copy this API key and save it somewhere secure for later, as it is what will authorize me to view the dashboard.

Next I'll create a Rig within the server folder structure to display the dashboard:

```
slipway serve . add-rig --name energy_dashboard --allow-all
```

The Rig JSON file will be created in a `rigs` folder, and the Rig's permissions will be saved to the `slipway_serve.json` configuration file.
We've specified [the `--allow-all` permission](/docs/basics/permissions) because I'm creating this Rig myself, and so I can trust it.

Ignoring the `Dockerfile` and empty folders, the directory structure now looks like this:

```
slipway_energy_dashboard
├─ slipway_serve.json
├─ op.env
└─ rigs
   └─ energy_dashboard.json
```

The `energy_dashboard.json` currently contains an empty Rig, so I'll flesh this out using George's dashboard as a guide,
and using the `slipwayhq.render` Component to [create a basic layout](/docs/basics/laying-out-components):

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

... then navigating to the following URL, replacing `<API_KEY>` with the one I saved earlier...

```
http://localhost:8080/rigs/energy_dashboard?authorization=<API_KEY>
```

This displays the following image of the rendered dashboard in my browser:

![Basic Layout](/img/blog/eink-energy-dashboard-basic-layout.png)

This puts me in a pretty good position to start creating the Components which will fetch the data and create the visualizations.
As I make changes I can simply refresh the page in my browser to see my progress.


## Creating the Components

I want to showcase creating a complex dashboard by composing many Components together in a modular fashion, so
I'm going to create the following Components:

### Data Fetching Components

- `givenergy`: This will fetch my solar, battery and power data from the GivEnergy servers and output it to be fed into other Components.
- `octopus_tariff`: This will fetch my Octopus tariff data and output it to be fed into other Components.

If other people want to use this dashboard and have other data providers, they can simply swap out these Components for their own ones.

### Visualizations

- `energy_flow_chart`: The top graphic in George's dashboard.
- `energy_graph`: The chart showing solar generation, energy usage and battery level.
- `tariff_rate_graph`: The chart showing today's tariff rates throughout the day.
- `energy_cash_flow`: The graphic showing what we spent importing and what we were paid exporting.
- `energy_lifetime`: The final graphic showing the lifetime energy generated and exported.

This is quite a lot of Components, but some are going to be trivial.
I won't go through each one in detail, but I will link to the source of each so you can explore them for yourself.

## Folder Structure

I'll create a folder structure where each Component lives in its own folder under a `components` folder.

In each Component folder I'll run:

```
slipway init-component --publisher jamesthurley --name energy_dashboard__<NAME>
```

Where `<NAME>` is the name of the Component.
This command creates a default `slipway_component.json` for each component, with myself as the publisher.

For example, in the `components/octopus` folder I'll run
```
slipway init-component --publisher jamesthurley --name energy_dashboard__octopus
```

Prefixing the Component name with `energy_dashboard__` is called
[_namespacing_ the Component](/docs/guides/component-registries#namespaces),
and allows me to publish them all together in a single GitHub repository, while
still making them individually discoverable in the Slipway Component Registry.

My folder structure now looks like this:

```
slipway_energy_dashboard
├─ slipway_serve.json
├─ op.env
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
   ├─ octopus
   │  └─ slipway_component.json
   └─ tariff_rate_graph
      └─ slipway_component.json
```


## The `givenergy` Component

I already have most the code I need as part of my original energy dashboard, so all I need is to
create a `run.js` file and paste in the necessary code, making a few modifications so that it returns
JSON power data rather an ECharts definition.

I also want to simplify the data, rather than returning the raw GivEnergy API data, to make
it provider agnostic.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/givenergy/run.js}
</details>

Finally I need to update the `slipway_component.json` with the input and output schemas so that
Slipway can validate the data.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/givenergy/slipway_component.json}
</details>

I can test this component with the following command:
```
slipway run-component "file:components/givenergy" --allow-http --allow-env --input "{}"
```
The output I get looks something like this:

<details>
  <summary>Show JSON</summary>

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

It should be fairly straightforward for anyone who isn't using a GivEnergy battery and inverter to
call their own provider's API and return data in the same format, which will make it compatible with all
the visualizations which will follow.

Note that in the above data the timestamps for each day are starting just after `23:00:00Z`. This is because
I'm currently at GMT+1 timezone.

## The `energy_graph` Component

I'm going to tackle this one next so we have something to look at, and because I already had a similar
graph with my original dashboard.

Most of the time spent here was fiddling the graph, getting it to look like George's version.
I did add some dashed horizontal axis split lines, to make reading the chart easier.
This is the end result:

![Energy Graph](/img/blog/eink-energy-dashboard-energy-graph.png)

I was quite pleased with the battery image, as I just asked ChatGPT o3:

> Can you create a javascript function which will take a charge value between 1 and 100, and a width and height and return an SVG path vector of a vertically oriented battery symbol showing the appropriate charge. The result should be a string starting `path://`.

It successfully one-shotted the resulting function.
I then tweaked it slightly for aesthetic reasons: The ChatGPT version was a dark outer boarder with 
an inner light rectangle representing charge, so I added a full height light inner rectangle and made the charge a black rectangle
inside of that.

The `slipway_component.json` input schema is a subset of what the `givenergy` Component outputs, as I only need
the data from a single day to draw this chart.

The output is a [Canvas](/docs/guides/canvases), using the `slipwayhq.echarts` Component
to render the output of my `run.js` script.

I also added some optional properties to theme the chart.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/slipway_component.json}
</details>

The `run.js` is primarily just constructing the ECharts definition, along with the battery icon
generating code at the bottom.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/run.js}
</details>

I found that I couldn't quite match George's X axis style, which was delightfully minimalist,
without using a javascript function as the label formatter.
However I could only pass JSON Echarts definitions to the `slipwayhq.echarts` Component.

To get around this I had to release a new version of `slipwayhq.echarts` which would optionally take 
some "apply" Javascript that would be executed within the component. I could then pass in some code
to attach the Javascript formatters to the chart definition once it was inside the `slipwayhq.echarts`
component:

<details>
  <summary>Show `apply.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_graph/apply.js}
</details>

## The `energy_flow_chart` Component

To create this Component I first approximated George's diagram in [InkScape](https://inkscape.org/).
I then exported it to a plain SVG, and then ran it through [SVGOMG](https://jakearchibald.github.io/svgomg/)
to simplify it and make it suitable for human editing.

![Inkscape Screenshot](/img/blog/eink-energy-dashboard-inkscape.png)

After that I spent far to long simplifying it even further, in particular adjusting the transforms to be sane values,
as straight out of InkScape it had groups with large negative translations with their inner elements having
large positive translations to compensate. AI helped a lot here to automate adjusting paths.

Next I needed to template the SVG files so I could color the various parts as per the theme specified by the
user, and insert the actual numbers from the data.

I considered using a templating engine, but I wanted the SVG to still be viewable as a normal SVG so that
I could easily tweak it and immediately see the result. That meant colors had to be valid, rather than,
for example, `{solar_color}`.

In the end I settled on using special colors like `#00ff00fe` that I could search and replace
with user specified colors, and strings like `{s}` that I could search and replace with actual numbers.

I was slightly concerned that as I replaced each color in turn, one of the colors I inserted would clash with
one of the `template` colors. To make this unlikely I used an alpha value of `fe` in all of the template colors.
That alpha value would still let me preview the template, but it was unlikely to be specified as part of
a theme by any sane user.

The result was very pleasing, and the Component turned out to be extremely trivial to write despite having the fancy
graphics, and despite it being the one I was most concerned about at the beginning.

![Energy Flow Chart](/img/blog/eink-energy-dashboard-energy-flow-chart.png)

The Javascript for this Component simply loads the SVG template, replaces the template values, and returns the result.

::insert{file=slipway_energy_dashboard/components/energy_flow_chart/run.js}

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

## The `energy_lifetime` Component

After the previous Component this one should be trivial, right?

Surprisingly, it posed some challenges.

My first thought was to do it all in SVG, but the issue is that SVG requires each piece of text to be spaced
absolutely. However I can't have one long piece of text as I need icons to the left of solar and export values.
That means I have to place the "Lifetime:" text separately from each of the solar and export text.
It's hard to do that when I don't know what font the user will want to use, or have available on their system.
It would be quite easy to end up with janky spacing, or even worse, overlapping text. This is simply a limitation
of SVG.

My second thought was to use a mix of Adaptive Cards and SVG, however I quickly hit upon a limitation of Adaptive Cards
which is that it isn't very good at putting text of different sizes on one line, as it has no way to line up the baselines.

This is what that ended up looking like, with the debug bounding boxes enabled:

![Adaptive Cards Energy Lifetime](/img/blog/eink-energy-dashboard-lifetime-ac-debug.png)

You can see it is also centering the text vertically including the descender space.
Font alignment is complicated!

So with SVG we get janky horizontal alignment. With Adaptive Cards we get janky vertical alignment.

How about JSX? I tend to pick JSX last because it's quite a slow renderer relative to SVG or Adaptive Cards,
because it's written using the Javascript [Satori](https://github.com/vercel/satori) library (the SVG and Adaptive
Cards renderers are Rust compiled to WASM).

However, JSX did give me rather a nice result with minimum fuss:

![JSX Energy Lifetime](/img/blog/eink-energy-dashboard-lifetime-jsx.png)

To give some hard numbers on `slipwayhq.jsx` being a relatively slow renderer:
On my M3 Macbook Air the `energy_flow_chart` renders in about 4ms using the `slipwayhq.svg`
renderer, where as this visually simpler Component takes about 400ms, 100x longer, using the `slipwayhq.jsx`
renderer. This is more in line with the the `energy_graph` Component we did first, which also takes about 400ms,
and is also using a Javascript library for rendering (`slipwayhq.echarts`).

However, for now I think this is a good compromise.

Once again the actual Javascript is quite simple.
I do a few calculations at the top to decide if I should display in `mWh` or `kWh`, and then
load the JSX, swap out the colors, and return the resulting JSX and the data for it to bind to:

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/energy_lifetime/run.js}
</details>

The `slipway_component.json` defines a subset of the givenergy data as its input schema,
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

## The `octopus_tariff` Component

This is another fairly straightforward data fetching Component.

It takes the user's API token and account number, and returns a structure with half-hourly
prices for the current day, taking the user's time zone into account.

Depending on what tariff you're on, Octopus will either return quite course-grained data 
(for the Go tariff, only two sections per day) or
quite fine-grained (30 minute sections for the Agile tariff).

I wanted to turn this into a standard format: a list of 48 prices in 30 minute slots, to
cover the user's current day. AI is perfect for this kind of data wrangling, so I just asked
ChatGPT to generate the function for me.


<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/octopus_tariff/slipway_component.json}
</details>

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/octopus_tariff/run.js}
</details>

## The `tariff_rate_graph` Component

Once again, most of the time here was spent fiddling with the ECharts definition
to get it looking close to George's chart. I made a few changes, partly because
I'm not on the Agile tariff so have different requirements, but I'm happy
with the end result:

![Tariff Rate Graph](/img/blog/eink-energy-dashboard-tariff-rate-graph.png)

The title in the screenshot isn't part of the Component.
I decided to put it in the Rig instead, as it felt like part of the
Rig styling than something every user of the Component would want.

The `slipway_component.json` is pretty standard. It takes the half-hourly pricing 
data and some optional theming parameters, and passes the `run.js` output to the
`slipwayhq.echarts` renderer.

<details>
  <summary>Show `slipway_component.json`</summary>
::insert{file=slipway_energy_dashboard/components/tariff_rate_graph/slipway_component.json}
</details>

The `run.js` is just some data wrangling and EChart definition construction.

<details>
  <summary>Show `run.js`</summary>
::insert{file=slipway_energy_dashboard/components/tariff_rate_graph/run.js}
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
would if I was attaching it as a lambda function from `run.js`, so instead 
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
