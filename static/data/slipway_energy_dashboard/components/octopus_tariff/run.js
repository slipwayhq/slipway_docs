export async function run(input) {
  const apiToken = input.api_token ?? slipway_host.env("OCTOPUS_API_TOKEN");
  if (!apiToken) {
    throw new Error("No API token provided. Use the input field or the OCTOPUS_API_TOKEN environment variable.");
  }

  const accountNumber = input.account_number ?? slipway_host.env("OCTOPUS_ACCOUNT_NUMBER");
  if (!accountNumber) {
    throw new Error("No account number provided. Use the input field or the OCTOPUS_ACCOUNT_NUMBER environment variable.");
  }

  const apiTokenBase64 = btoa(apiToken);

  const requestOptions = {
    method: "GET",
    body: null,
    headers: [
      ["Authorization", `Basic ${apiTokenBase64}`],
      ["Content-Type", "application/json"],
      ["Accept", "application/json"],
    ],
    timeout_ms: null
  };

  const accountResponse = await slipway_host.fetch_text(`https://api.octopus.energy/v1/accounts/${accountNumber}`, requestOptions);
  const accountData = JSON.parse(accountResponse.body);

  console.trace(`Account data: ${JSON.stringify(accountData, null, 2)}`);

  const properties = accountData?.properties;
  if (!properties || !properties.length) {
    throw new Error("No properties found for the given account number.");
  }

  const property = properties[0];
  const electricityMeterPoints = property.electricity_meter_points;
  if (!electricityMeterPoints || !electricityMeterPoints.length) {
    throw new Error("No electricity meter points found for the first property.");
  }

  let electricityMeterPoint = electricityMeterPoints[0];

  // Find an agreement with a null `valid_to` date, indicating it's current.
  const currentAgreement = electricityMeterPoint.agreements.find(agreement => !agreement.valid_to);
  if (!currentAgreement) {
    throw new Error("No current agreement found for the property.");
  }

  const tariffCode = currentAgreement.tariff_code;
  // Strip out everything before the first two hyphens, and after the last hyphen,
  // to get the product code.
  const productCode = tariffCode.split('-').slice(2, -1).join('-');

  console.debug(`Using product code "${productCode}" and tariff code "${tariffCode}".`);

  const productResponse = await slipway_host.fetch_text(`https://api.octopus.energy/v1/products/${productCode}/electricity-tariffs/${tariffCode}/standard-unit-rates/`, requestOptions);

  const productData = JSON.parse(productResponse.body);

  const results = productData.results;
  if (!results || !results.length) {
    throw new Error("No standard unit rates found for the given tariff code.");
  }

  const today = getDayHalfHourPrices(results, process.env.TZ, false);
  const yesterday = getDayHalfHourPrices(results, process.env.TZ, true);

  return {
    today,
    yesterday,
  }
}

/**
 * Build the 48 half-hour prices for the user’s current day.
 *
 * @param {Array<Object>} results – raw API rows (valid_from, valid_to, value_inc_vat …)
 * @param {string}        tz      – IANA zone, e.g. "Europe/London"
 * @returns {Array<{ time: string, price: number }>}
 */
export function getDayHalfHourPrices(results, tz, yesterday = false) {
  // --- 1. Pre-process API rows into { price, from, to } with Temporal.Instants ----
  const apiIntervals = results.map(r => ({
    price : r.value_inc_vat,                                   // or value_exc_vat
    from  : Temporal.Instant.from(r.valid_from),               // UTC
    to    : Temporal.Instant.from(r.valid_to)
  }));

  // --- 2. Establish the user’s “today” in their time-zone -------------------------
  const nowZD   = Temporal.Now.zonedDateTimeISO(tz);           // e.g. 2025-06-04T13:17 …
  let dayZD   = nowZD.startOfDay();                          // 00:00 local
  if (yesterday) {
    dayZD = dayZD.subtract({ days: 1 });                       // 00:00 local yesterday
  }
  const slots   = [];

  // --- 3. Walk the 48 half-hour boundaries ---------------------------------------
  for (let i = 0; i < 48; i++) {
    const slotZD = dayZD.add({ minutes: 30 * i });             // still in user tz
    const slotUT = slotZD.toInstant();                         // for comparisons

    const found  = apiIntervals.find(({ from, to }) =>
      Temporal.Instant.compare(slotUT, from) >= 0 && 
      Temporal.Instant.compare(slotUT, to) < 0
    );

    if (!found) {
      console.warn(`No price found for slot ${slotZD.toString()}`);
    }

    slots.push({
      time : slotZD.toString({ smallestUnit: 'minute', timeZoneName: 'never' }), // ISO wo/ zone, no seconds
      price: found ? found.price : 0
    });
  }

  return slots;
}