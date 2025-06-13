chart.xAxis.axisLabel.formatter = function (value) {
  const zdt = Temporal.Instant
    .fromEpochMilliseconds(value)
    .toZonedDateTimeISO(process.env.TZ);

  let hours = zdt.hour;

  if (hours !== 6 && hours !== 12 && hours !== 18) {
    return '';
  }

  const am_pm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  return `${hours}${am_pm}`;
};
