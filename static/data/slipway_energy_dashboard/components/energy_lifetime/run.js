export async function run(input) {
  let solar = input.data.solar || 0;
  let solarUnits = "kWh";

  if (solar > 1000) {
    solar = solar / 1000;
    solarUnits = "MWh";
  }

  let gridExport = input.data.grid.export || 0;
  let gridExportUnits = "kWh";

  if (gridExport > 1000) {
    gridExport = gridExport / 1000;
    gridExportUnits = "MWh";
  }

  const title = input.title || "Lifetime";

  let theme = input.theme || {};
  let solarColor = theme.solar_color || 'rgba(230, 150, 0, 1)';
  let gridExportColor = theme.grid_export_color || solarColor;

  let jsx = await slipway_host.load_text('', 'lifetime.jsx');

  jsx = jsx
    .replace(/#ffcf00fe/g, solarColor)
    .replace(/#ff0000fe/g, gridExportColor);

  const data = {
    title,
    solar,
    solarUnits,
    gridExport,
    gridExportUnits,
  };

  return {
    data,
    jsx
  };
}