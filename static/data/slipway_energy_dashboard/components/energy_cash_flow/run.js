export async function run(input) {

  const exportRate = input.export_rate || 0;
  const generationRate = input.generation_rate || 0;

  const theme = input.theme || {};
  const gridImportColor = theme.grid_import_color || 'rgba(125, 0, 0, 1)';
  const gridExportColor = theme.grid_export_color || 'rgba(230, 150, 0, 1)';
  const gridGenerationColor = theme.solar_color || 'rgba(230, 150, 0, 1)';

  const tz = process.env.TZ;
  const prices = input.prices || [];
  const power = input.power || [];

  const totalExported = input.day.grid.export || 0;
  const totalGenerated = input.day.solar || 0;

  const importCost = calculateImportCost(prices, power, tz);
  const exportCost = totalExported * exportRate;
  const generationCost = totalGenerated * generationRate;

  const dimensions = {
    xPadding: 0,
    yPadding: 10,
    linePadding: theme.cash_flow_line_padding || 30,
    lineHeight: 30,
  };

  let lineCount = 0;
  let svgLines = '';
  if (importCost > 0) {
    svgLines += getSvgLine(importCost, gridImportColor, 'imported', dimensions, lineCount);
    lineCount += 1;
  };
  if (exportCost > 0) {
    svgLines += getSvgLine(exportCost, gridExportColor, 'exported', dimensions, lineCount);
    lineCount += 1;
  };
  if (generationCost > 0) {
    svgLines += getSvgLine(generationCost, gridGenerationColor, 'generated', dimensions, lineCount);
    lineCount += 1;
  };

  const svg = getSvgStart(dimensions, lineCount) + svgLines + getSvgEnd();

  return {
    svg,
  };
}

function getSvgStart(dimensions, lineCount) {
  const d = dimensions;
  const width = 220 + (2 * d.xPadding);
  const height = (2 * d.yPadding) + (d.lineHeight * lineCount) + (d.linePadding * (lineCount - 1));

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="sans-serif" font-size="20">`;
}


function getSvgLine(value, color, suffix, dimensions, lineIndex) {
  const d = dimensions;
  let valueString = '';
  if (value < 100) {
    valueString = `${value.toFixed(0)}p`;
  }
  else {
    valueString = `£${(value / 100).toFixed(2)}`;
  }
  const y = d.yPadding + (d.lineHeight * (lineIndex + 1)) + (d.linePadding * lineIndex);
  const xPadding = d.xPadding;
  
  return `
    <g transform="translate(${xPadding} ${y})" style="text-align:start" text-anchor="start">
      <text fill="${color}"><tspan font-size="42">${valueString}</tspan><tspan> ${suffix}</tspan></text>
    </g>`;
}


function getSvgEnd() {
  return `</svg>`;
}

/**
 * Calculate the total cost of imported energy (grid < 0),
 * matching each import interval to the most-recent price whose
 * timestamp ≤ the interval start, *all in the caller-supplied time-zone*.
 *
 * @param {Array<{price:number,time:string}>} priceData – ISO strings, ascending
 * @param {Array<{grid:number,time:string}>}  powerData – ISO strings, ascending
 * @param {string} tz  IANA zone, e.g. "Europe/London"
 * @returns {number}   Total cost (same units as `priceData.price`)
 */
export function calculateImportCost(priceData, powerData, tz) {
  // 1.  Pre-parse times directly into ZonedDateTime in the desired zone ——––
  const prices = priceData.map(({ price, time }) => ({
    price,
    zdt: Temporal.Instant.from(time).toZonedDateTimeISO(tz),   // ZonedDateTime
  }));

  const powers = powerData.map(({ grid, time }) => ({
    grid,
    zdt: Temporal.Instant.from(time).toZonedDateTimeISO(tz),
  }));

  let cost = 0;
  let pIdx = prices.length - 1;                 // start at newest price slot

  // Helper: true if a ZonedDateTime is exactly 00:00:00.000 in its zone
  const isMidnight = z =>
    z.hour === 0 && z.minute === 0 && z.second === 0 &&
    z.millisecond === 0 && z.microsecond === 0 && z.nanosecond === 0;

  // 2.  Loop over consecutive power samples (all but the final one) ——––––––
  for (let i = 0; i < powers.length - 1; i++) {
    const cur = powers[i];
    const nxt = powers[i + 1];

    if (cur.grid >= 0) continue;               // exporting ⇒ no cost

    // Step backward until price.zdt ≤ cur.zdt
    while (pIdx > 0 && prices[pIdx].zdt.epochMilliseconds > cur.zdt.epochMilliseconds)
      pIdx--;

    if (prices[pIdx].zdt.epochMilliseconds > cur.zdt.epochMilliseconds)
      throw new Error(`No price before ${cur.zdt.toString()}`);

    // Energy (kWh) for this interval
    const durationH =
      (nxt.zdt.epochMilliseconds - cur.zdt.epochMilliseconds) / 3_600_000;
    const energyKWh = Math.abs(cur.grid) / 1_000 * durationH;

    cost += energyKWh * prices[pIdx].price;
  }

  // 3.  Handle the *final* sample: bill up to local-midnight —————–––––––––
  const last = powers[powers.length - 1];
  const lastZdt = last.zdt;

  if (last.grid < 0 && !isMidnight(lastZdt)) {
    while (pIdx > 0 && prices[pIdx].zdt.epochMilliseconds > lastZdt.epochMilliseconds)
      pIdx--;
    
    if (prices[pIdx].zdt.epochMilliseconds > lastZdt.epochMilliseconds)
      throw new Error(`No price before final sample ${lastZdt.toString()}`);

    // Midnight at start of *next* calendar day in this zone
    const midnightNext = lastZdt
      .add({ days: 1 })
      .startOfDay();

    const durationH =
      (midnightNext.epochMilliseconds - lastZdt.epochMilliseconds) / 3_600_000;
    const energyKWh = Math.abs(last.grid) / 1_000 * durationH;

    cost += energyKWh * prices[pIdx].price;
  }

  return cost;
}
