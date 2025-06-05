export async function run(input) {
  const chart = buildChart(input.prices, input.theme || {});

  let apply_js = await slipway_host.load_text('', 'apply.js');

  return {
    chart,
    apply: apply_js,
  };
}

function buildChart(data, theme) {

  let barHighColor = theme.bar_color || 'rgba(125, 0, 0, 1)';
  let barLowColor = theme.bar_color || 'rgba(230, 150, 0, 1)';
  let axisColor = theme.grid_color || 'rgba(0, 0, 0, 1)';

  const times = data.map(d => d.time);
  const prices = data.map(d => d.price);

  let currentTime = findCurrentTimeInterval(times);

  const average = prices.reduce((sum, val) => sum + val, 0) / prices.length;
  const enrichedPrices = prices.map(price => ({
    value: price,
    color: price >= average ? barHighColor : barLowColor,
  }));

  let definition = {
    grid: { top: 12, bottom: 22, left: 0, right: 0 },
    xAxis: {
      type: "category",
      data: times,
      axisLabel: {
        show: true,
        interval: 11,
        color: axisColor // Formatter set by apply.js.
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
        lineStyle: { width: 1, length: 5, color: axisColor }
      },
      minorTick: {
        show: true,
        lineStyle: { width: 1, length: 2, color: axisColor },
      },
      splitLine: { show: false },
      minorSplitLine: { show: false },
      axisLine: {
        lineStyle: { color: axisColor }
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLine: {
        show: false,
        lineStyle: { color: axisColor }
      },
      axisLabel: { show: false, formatter: '{value}p', color: axisColor },
      axisTick: { show: false, lineStyle: { width: 1, length: 2, color: axisColor } },
      splitLine: { show: false, lineStyle: { color: axisColor, type: [1, 8] } }
    },
    series: [
      {
        name: "Price",
        type: "bar",
        data: enrichedPrices,
        color: barHighColor,
        itemStyle: {
          // Color set by apply.js.
        },
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' },
            {
              name: 'Now',
              coord: [currentTime, 0],
              symbol: 'path://M 0 -0.577 L 0.5 0.289 L -0.5 0.289 Z',
              symbolOffset: [0, '50%'],
              symbolSize: 7,
              itemStyle: {
                color: axisColor
              },
              label: {
                show: false,
              }
            }
          ],
          symbol: 'arrow',
          symbolSize: 0,
          label: {
            show: true,
            position: [0, -12],
            color: axisColor,
            textBorderWidth: 0,
            // Formatter set by apply.js.
          }
        }
      },
    ]
  };

  return definition;
}

function findCurrentTimeInterval(times) {
  const now = new Date();

  // Iterate in reverse to find the most recent time before now
  for (let i = times.length - 1; i >= 0; i--) {
    const t = new Date(times[i]);
    if (t <= now) {
      return times[i];
    }
  }

  // If none found, return null or first time
  return null;
}
