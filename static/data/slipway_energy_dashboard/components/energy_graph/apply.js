chart.xAxis.axisLabel.formatter = function (value) {
  const date = new Date(value);
  let hours = date.getHours();

  if (hours !== 6 && hours !== 12 && hours !== 18) {
    return '';
  }

  const am_pm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  return `${hours}${am_pm}`;
};

// chart.yAxis[0].axisLabel.formatter = function (value) {

//   if (value !== chart.yAxis[0].max) {
//     return '';
//   }

//   return `${value}kW`;
// };