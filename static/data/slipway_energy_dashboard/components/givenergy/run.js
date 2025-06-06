export async function run(input) {
  // Gather inverter_id and api_token
  const apiToken = input.api_token ?? slipway_host.env("GIVENERGY_API_TOKEN");
  if (!apiToken) {
    throw new Error("No API token provided. Use the input field or the GIVENERGY_API_TOKEN environment variable.");
  }

  const inverterId = input.inverter_id ?? slipway_host.env("GIVENERGY_INVERTER_ID");
  if (!inverterId) {
    throw new Error("No inverter ID provided. Use the input field or the GIVENERGY_INVERTER_ID environment variable.");
  }

  const requestOptions = {
    method: "GET",
    body: null,
    headers: [
      ["Authorization", `Bearer ${apiToken}`],
      ["Content-Type", "application/json"],
      ["Accept", "application/json"],
    ],
    timeout_ms: null
  };

  const tz = process.env.TZ;
  console.trace(`Timezone: ${tz}`);
  console.trace(`Now: ${Temporal.Now.plainDateTimeISO(tz).toString()}`);
  
  // Prepare day strings (yesterday & today) in YYYY-MM-DD
  const todayStr = Temporal.Now.plainDateISO(tz).toString();
  console.trace(`Today: ${todayStr}`);

  const yesterdayStr = Temporal.Now.plainDateISO(tz)
    .subtract({ days: 1 })
    .toString();
  console.trace(`Yesterday: ${yesterdayStr}`);

  // Fetch both days' data in parallel
  const [yesterdayData, todayData] = await Promise.all([
    gatherDayData(yesterdayStr, inverterId, requestOptions),
    gatherDayData(todayStr, inverterId, requestOptions),
  ]);

  return { 
    yesterday: yesterdayData,
    today: todayData,
  };
}

// Fetch the first page for a given day, then parallelize the rest of the pages
async function gatherDayData(dayStr, inverterId, requestOptions) {
  // Fetch page 1 first so we know how many pages there are
  const page1Url = `https://api.givenergy.cloud/v1/inverter/${inverterId}/data-points/${dayStr}?page=1`;
  // console.log(`Calling: ${page1Url}`);
  const page1Result = await slipway_host.fetch_text(page1Url, requestOptions);
  const page1Body = JSON.parse(page1Result.body);

  // Start our array of data with the first page
  const allData = [...page1Body.data];

  // If there's only one page, we're done
  const meta = page1Body.meta;
  if (!meta || !meta.last_page || meta.last_page === 1) {
    return allData;
  }

  // Otherwise, fetch pages 2..last_page in parallel
  const path = meta.path;        // Base path without ?page=...
  const lastPage = meta.last_page;

  const promises = [];
  for (let page = 2; page <= lastPage; page++) {
    promises.push(fetchPage(path, requestOptions, page));
  }

  // Wait for all parallel fetches, then merge them in ascending page order
  const pageResults = await Promise.all(promises);
  pageResults.sort((a, b) => a.page - b.page);
  for (const p of pageResults) {
    allData.push(...p.body.data);
  }

  const simplifiedPower = allData.map(d => ({
    time: d.time,
    solar: d.power.solar.power,
    grid: d.power.grid.power,
    battery: d.power.battery.power,
    battery_percent: d.power.battery.percent,
    consumption: d.power.consumption.power
  }));

  const lastData = allData[allData.length - 1];

  return {
    power: simplifiedPower,
    day: lastData.today,
    total: lastData.total,
  };
}

// Helper to fetch a specific page, returning { page, body }
function fetchPage(path, requestOptions, page) {
  const url = `${path}?page=${page}`;
  // console.log(`Calling: ${url}`);
  return slipway_host.fetch_text(url, requestOptions).then(result => {
    return {
      page,
      body: JSON.parse(result.body),
    };
  });
}
