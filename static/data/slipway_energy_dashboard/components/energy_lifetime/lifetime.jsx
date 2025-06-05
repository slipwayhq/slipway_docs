<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  }}
>
  <span style={{ fontSize: "0.9rem", marginRight: 16 }}>
    {data.title}:
  </span>

  <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
    <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
        <g fill="#ffcf00fe">
            <circle cx="6" cy="6" r="3"/>
            <path d="M10.53 5.5h.94a.53.53 45 0 1 .53.53.5.5 138.34 0 1-.53.47h-.94a.53.53 45 0 1-.53-.53.5.5 138.34 0 1 .53-.47zm-.97 3.35.66.66a.53.53 90 0 1 0 .75.5.5 3.34 0 1-.7-.04l-.67-.66a.53.53 90 0 1 0-.75.5.5 3.34 0 1 .7.04zm-.71-6.41.66-.66a.53.53 0 0 1 .75 0 .5.5 93.34 0 1-.04.7l-.66.67a.53.53 0 0 1-.75 0 .5.5 93.34 0 1 .04-.7zm-3.35-.97v-.94a.53.53 135 0 1 .53-.53.5.5 48.34 0 1 .47.53v.94a.53.53 135 0 1-.53.53.5.5 48.34 0 1-.47-.53zm-3.06 1.68-.66-.66a.53.53 90 0 1 0-.75.5.5 3.34 0 1 .7.04l.67.66a.53.53 90 0 1 0 .75.5.5 3.34 0 1-.7-.04zm4.06 7.38v.94a.53.53 135 0 1-.53.53.5.5 48.34 0 1-.47-.53v-.94a.53.53 135 0 1 .53-.53.5.5 48.34 0 1 .47.53zm-3.35-.97-.66.66a.53.53 0 0 1-.75 0 .5.5 93.34 0 1 .04-.7l.66-.67a.53.53 0 0 1 .75 0 .5.5 93.34 0 1-.04.7zm-1.68-3.06h-.94a.53.53 45 0 1-.53-.53.5.5 138.34 0 1 .53-.47h.94a.53.53 45 0 1 .53.53.5.5 138.34 0 1-.53.47z"/>
        </g>
    </svg>
    <span style={{ fontSize: "1.5rem", marginLeft: 1 }}>
      {data.solar.toPrecision(3)}
    </span>
    <span style={{ fontSize: "0.9rem" }}>
      {data.solarUnits}
    </span>
  </span>

  <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 16 }}>
    <svg width="16" height="25" xmlns="http://www.w3.org/2000/svg"viewBox="0 0 5.72 10.6">
        <path fill="#ff0000fe" d="M1.45 0h1.94a.38.38 0 0 1 .36.5l-.66 2a.38.38 0 0 0 .36.5h1.94a.33.33 0 0 1 .3.47l-3.53 7.06a.12.12 0 0 1-.24-.06V6.53A.53.53 0 0 0 1.39 6H.45A.45.45 0 0 1 0 5.48L.83.52A.62.62 0 0 1 1.45 0Z"/>
    </svg>
    <span style={{ fontSize: "1.5rem", marginLeft: 1 }}>
      {data.gridExport.toPrecision(3)}
    </span>
    <span style={{ fontSize: "0.9rem" }}>
      {data.gridExportUnits} export
    </span>
  </span>
</div>