chart.xAxis.axisLabel.formatter = function (value, index) {

  const zdt = Temporal.Instant
    .fromEpochMilliseconds(new Date(value).getTime())
    .toZonedDateTimeISO(process.env.TZ);

  let hours = zdt.hour;
  const minutes = zdt.minute;
  
  if (minutes !== 0) {
    return '';
  }

  if (hours !== 6 && hours !== 12 && hours !== 18) {
    return '';
  }

  const am_pm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${hours}${am_pm}`;
};

chart.series[0].markPoint.label.formatter = function (param) {
  return `${param.value.toFixed(1)}p`;
};

chart.series[0].itemStyle.color = function (params) {
  return params.data.color || "black";
};