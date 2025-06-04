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
    .replace(/#ffff00/g, solarColor)
    .replace(/#ff0000/g, gridImportColor)
    .replace(/#00ff00/g, gridExportColor)
    .replace(/#ffffff/g, usedColor)
    .replace(/#000000/g, houseColor)
    .replace("{s}", solar.toFixed(1))
    .replace("{g}", gridImport.toFixed(1))
    .replace("{e}", gridExport.toFixed(1))
    .replace("{u}", consumption.toFixed(1));

  return {
    svg: flowSvg,
  };
  // return {
  //       "canvas": {
  //         "width": input.width,
  //         "height": input.height
  //       },
  //       "card": {
  //         "type": "AdaptiveCard",
  //         "body": [
  //           {
  //             "type": "ColumnSet",
  //             "bleed": true,
  //             "height": "stretch",
  //             "columns": [
  //               {
  //                 "type": "Column",
  //                 "items": [
  //                   {
  //                     "type": "ColumnSet",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "size": "extraLarge",
  //                             "text": solar.toFixed(1),
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "spacing": "none",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "kWh",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                   {
  //                     "type": "ColumnSet",
  //                     "spacing": "none",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "items": [
  //                           {
  //                             "type": "Image",
  //                             "url": "component://svg?width=$width&height=$height",
  //                             "height": "20px",
  //                             "width": "20px",
  //                             "body": {
  //                               "scale": true,
  //                               "svg": solarIcon
  //                             }
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "verticalContentAlignment": "center",
  //                         "spacing": "small",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "solar",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                   {
  //                     "type": "Container",
  //                     "height": "stretch",
  //                     "items": []
  //                   },
  //                   {
  //                     "type": "ColumnSet",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "size": "extraLarge",
  //                             "text": gridImport.toFixed(1),
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "spacing": "none",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "kWh",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                   {
  //                     "type": "ColumnSet",
  //                     "spacing": "none",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "items": [
  //                           {
  //                             "type": "Image",
  //                             "url": "component://svg?width=$width&height=$height",
  //                             "height": "20px",
  //                             "width": "13px",
  //                             "body": {
  //                               "scale": true,
  //                               "svg": gridImportIcon
  //                             }
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "spacing": "small",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "grid",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                 ]
  //               },
  //               {
  //                 "type": "Column",
  //                 "verticalContentAlignment": "center",
  //                 "horizontalAlignment": "center",
  //                 "width": "stretch",
  //                 "items": [
  //                   {
  //                     "type": "ColumnSet",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "verticalContentAlignment": "top",
  //                         "horizontalAlignment": "left",
  //                         "items": [
  //                           {
  //                             "type": "ColumnSet",
  //                             "columns": [
  //                               {
  //                                 "type": "Column",
  //                                 "items": [
  //                                   {
  //                                     "type": "TextBlock",
  //                                     "size": "extraLarge",
  //                                     "text": consumption.toFixed(1),
  //                                   }
  //                                 ]
  //                               },
  //                               {
  //                                 "type": "Column",
  //                                 "spacing": "none",
  //                                 "items": [
  //                                   {
  //                                     "type": "TextBlock",
  //                                     "text": "kWh",
  //                                   }
  //                                 ]
  //                               },
  //                             ]
  //                           },
  //                           {
  //                             "type": "TextBlock",
  //                             "spacing": "none",
  //                             "text": "used",
  //                           },
  //                         ]
  //                       }
  //                     ]
  //                   }
  //                 ]
  //               },
  //               {
  //                 "type": "Column",
  //                 "verticalContentAlignment": "center",
  //                 "items": [
  //                   {
  //                     "type": "ColumnSet",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "verticalContentAlignment": "top",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "size": "extraLarge",
  //                             "text": gridExport.toFixed(1),
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "verticalContentAlignment": "top",
  //                         "spacing": "none",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "kWh",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                   {
  //                     "type": "ColumnSet",
  //                     "spacing": "none",
  //                     "columns": [
  //                       {
  //                         "type": "Column",
  //                         "items": [
  //                           {
  //                             "type": "Image",
  //                             "url": "component://svg?width=$width&height=$height",
  //                             "height": "20px",
  //                             "width": "13px",
  //                             "body": {
  //                               "scale": true,
  //                               "svg": gridExportIcon
  //                             }
  //                           }
  //                         ]
  //                       },
  //                       {
  //                         "type": "Column",
  //                         "spacing": "small",
  //                         "items": [
  //                           {
  //                             "type": "TextBlock",
  //                             "text": "export",
  //                           }
  //                         ]
  //                       },
  //                     ]
  //                   },
  //                 ]
  //               },
  //             ]
  //           }
  //         ]
  //       }
  //     };
}