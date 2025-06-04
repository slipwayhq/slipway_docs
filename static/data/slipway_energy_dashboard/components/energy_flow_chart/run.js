export async function run(input) {  
  const solar = input.data.solar || 0;
  const gridImport = input.data.grid.import || 0;
  const gridExport = input.data.grid.export || 0;
  const consumption = input.data.consumption || 0;

  let theme = input.theme || {};
  let solarColor = theme.solar_color || 'rgba(230, 150, 0, 1)';
  let gridImportColor = theme.grid_import_color || 'rgba(125, 0, 0, 1)';
  let gridExportColor = theme.grid_export_color || solarColor;
  let usedColor = theme.used_color || 'rgba(255, 255, 255, 1)';
  let houseColor = theme.house_color || 'rgba(0, 0, 0, 1)';

  let flowSvg = await slipway_host.load_text('', 'flow.svg');  

  flowSvg = flowSvg
    .replace(/#ffcf00fe/g, solarColor)
    .replace(/#ff0000fe/g, gridImportColor)
    .replace(/#00ff00fe/g, gridExportColor)
    .replace(/#fffffffe/g, usedColor)
    .replace(/#000000fe/g, houseColor)
    .replace("{s}", solar.toFixed(1))
    .replace("{g}", gridImport.toFixed(1))
    .replace("{e}", gridExport.toFixed(1))
    .replace("{u}", consumption.toFixed(1));

  return {
    svg: flowSvg,
  };
}