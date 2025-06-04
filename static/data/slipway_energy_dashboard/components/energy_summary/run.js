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

  let sunSvg = await slipway_host.load_text('icons', 'sun.svg');  
  let lightningSvg = await slipway_host.load_text('icons', 'lightning.svg');
  let solarIcon = sunSvg.replace(/#ffff00/g, solarColor);
  let gridExportIcon = lightningSvg.replace(/#ff0000/g, gridExportColor);

  return {
        "canvas": {
          "width": input.width,
          "height": input.height
        },
        "card": {
          "type": "AdaptiveCard",
          "verticalContentAlignment": "center",
          "body": [
            {
              "type": "ColumnSet",
              "bleed": true,
              "height": "stretch",
              "columns": [
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": []
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "items": [
                    {
                      "type": "TextBlock",
                      "size": "large",
                      "text": title + ":",
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "spacing": "large",
                  "items": [
                    {
                      "type": "Image",
                      "url": "component://svg?width=$width&height=$height",
                      "height": "25px",
                      "width": "25px",
                      "body": {
                        "scale": true,
                        "svg": solarIcon
                      }
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "spacing": "small",
                  "items": [
                    {
                      "type": "TextBlock",
                      "size": "extraLarge",
                      "text": solar.toPrecision(4),
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "spacing": "none",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": solarUnits,
                    }
                  ]
                },
                {
                  "type": "Column",
                  "spacing": "large",
                  "items": [
                    {
                      "type": "Image",
                      "url": "component://svg?width=$width&height=$height",
                      "height": "25px",
                      "width": "16px",
                      "body": {
                        "scale": true,
                        "svg": gridExportIcon
                      }
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "spacing": "small",
                  "items": [
                    {
                      "type": "TextBlock",
                      "size": "extraLarge",
                      "text": gridExport.toPrecision(4),
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "spacing": "none",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": gridExportUnits,
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": []
                },
              ]
            }
          ]
        }
      };
}