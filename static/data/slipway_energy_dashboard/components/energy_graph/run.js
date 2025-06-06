export async function run(input) {  
  const chart = buildChart(input.power, input.theme || {});

  let apply_js = await slipway_host.load_text('', 'apply.js');

  return { 
    chart,
    apply: apply_js,
  };
}

function buildChart(data, theme) {

  let solarColor = theme.solar_color || 'rgba(230, 150, 0, 1)';
  let gridColor = theme.grid_import_color || 'rgba(125, 0, 0, 1)';
  let batteryColor = theme.battery_color || 'rgba(0, 0, 0, 1)';
  let foregroundColor = theme.foreground_color || 'rgba(0, 0, 0, 1)';

  const times = data.map(d => new Date(d.time).getTime());
  const solar = data.map(d => d.solar/1000);
  const batteryPercent = data.map(d => d.battery_percent);
  const consumption = data.map(d => d.consumption/1000);

  let power_axis_max = Math.ceil(Math.max(...solar, ...consumption));

  let dayStart = undefined;
  let dayEnd = undefined;
  let lastPercent = undefined;
  let lastPercentIndex = 0;
  let lastTime = undefined;
  let hourOfDay = 0;
  if (times.length > 0) {
    // Find the start and end of the day based on the first time
    dayStart = new Date(times[0]);
    dayStart.setHours(0, 0, 0, 0);

    dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    lastPercentIndex = batteryPercent.length - 1;
    lastPercent = batteryPercent[lastPercentIndex];

    lastTime = new Date(times[lastPercentIndex]).getTime();
    
    hourOfDay = new Date(times[lastPercentIndex]).getHours();
  }

  const batteryWidth = 15;
  const batteryHeight = 30;

  let definition = {
    grid: { top: 20, bottom: 25, left: 30, right: 30 },
    xAxis: {
      type: "time",
      min: dayStart.getTime(),
      max: dayEnd.getTime(),
      axisLabel: {
        color: foregroundColor // Formatter set by apply.js.
      },
      splitNumber: 3,
      axisTick: {
        show: true,
        lineStyle: { width: 1, length: 5, color: foregroundColor }
      },
      minorTick: {
        show: true,
        lineStyle: { width: 1, length: 2, color: foregroundColor },
        splitNumber: 6
      },
      splitLine: { show: false },
      minorSplitLine: { show: false },
      axisLine: {
        lineStyle: { color: foregroundColor }
      },
    },
    yAxis: [
      {
        type: "value",
        min: 0,
        max: power_axis_max,
        name: `${power_axis_max}kW`,
        nameTextStyle: { color: foregroundColor },
        nameGap: 2,
        axisLine: {
          show: true,
          lineStyle: { color: foregroundColor }
        },
        axisLabel: { show: false },
        axisTick: { show: true, lineStyle: { width: 1, length: 2, color: foregroundColor } },
        splitLine: { show: true, lineStyle: { color: foregroundColor, type: [1, 8] } }
      },
      {
        type: "value",
        min: 0,
        max: 100,
        show: false,
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: "Solar",
        type: "line",
        showSymbol: false,
        data: times.map((t, i) => [t, solar[i]]),
        lineStyle: { width: 0 },
        areaStyle: { color: solarColor, opacity: 1.0 }
      },
      {
        name: "Consumption",
        type: "line",
        showSymbol: false,
        data: times.map((t, i) => [t, consumption[i]]),
        lineStyle: { width: 0 },
        areaStyle: { color: gridColor, opacity: 1.0 }
      },
      {
        name: "Solar Peek",
        type: "line",
        showSymbol: false,
        data: times.map((t, i) => [t, solar[i]]),
        lineStyle: { width: 1, color: solarColor },
      },
      {
        name: "Battery %",
        type: "line",
        showSymbol: false,
        yAxisIndex: 1,
        data: times.map((t, i) => [t, batteryPercent[i]]),
        lineStyle: { type: "solid", color: batteryColor, width: 1 },
        markPoint: {
          data: [
            {
              symbol: batteryPath(lastPercent, batteryWidth, batteryHeight),
              symbolSize: [batteryWidth, batteryHeight],
              symbolOffset: [hourOfDay < 22 ? '60%' : '-60%', lastPercent > 50 ? '60%' : '-60%'],
              coord: [lastTime, lastPercent],
              itemStyle: {
                color: batteryColor,
              },
              label: {
                show: true,
                formatter: `${Math.round(lastPercent)}%`,
                position: hourOfDay < 22 ? 'right' : 'left',
                fontSize: 16,
                color: batteryColor,
              }
            }
          ]
        }
      },
    ]
  };

  return definition;
}

/**
 * Build an SVG path for a vertical battery whose interior fill matches `charge`.
 *
 * @param {number} charge  1‒100, percentage of charge shown from the bottom up
 * @param {number} w       full width  of the icon (px, em, …)
 * @param {number} h       full height of the icon (px, em, …)
 * @returns {string}       e.g. "path://M…Z"
 */
function batteryPath(charge, w, h) {
  // --- safety guards --------------------------------------------------------
  charge = Math.max(1, Math.min(charge, 100)); // clamp to 1-100

  // --- proportions (feel free to tweak) -------------------------------------
  const capH      = h * 0.12;       // height of the positive-pole “nub”
  const capInset  = w * 0.2;        // nub is narrower than the body
  const border    = w * 0.1;       // wall thickness of the battery body

  // --- outer shell + nub ----------------------------------------------------
  const pathParts = [
    // nub (top, centered)
    `M${capInset},0`,
    `H${w - capInset}`,
    `V${capH}`,
    // right wall down to bottom
    `H${w}`,
    `V${h}`,
    // bottom & left wall back to nub
    `H0`,
    `V${capH}`,
    `H${capInset}`,
    `Z`
  ];

  // --- charge level (inner fill) -------------------------------------------
  const innerLeft   = border;
  const innerRight  = w - border;
  const innerBottom = h - border;
  const innerTop    = capH + border;

  // rectangle representing charge
  pathParts.push(
    `M${innerLeft},${innerBottom}`,
    `H${innerRight}`,
    `V${innerTop}`,
    `H${innerLeft}`,
    `Z`
  );

  const chargeLeft   = innerLeft + border;
  const chargeRight  = innerRight - border;
  const chargeBottom = innerBottom - border;
  const chargeTop    = innerTop + border;

  const maxFillH    = chargeBottom - chargeTop;           // usable height
  const fillHeight  = (maxFillH * charge) / 100;        // how much to fill
  const fillTopY    = chargeBottom - fillHeight;         // where fill stops

  // rectangle representing charge
  pathParts.push(
    `M${chargeLeft},${chargeBottom}`,
    `H${chargeRight}`,
    `V${fillTopY}`,
    `H${chargeLeft}`,
    `Z`
  );

  return 'path://' + pathParts.join('');
}