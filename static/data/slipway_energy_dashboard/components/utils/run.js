export async function run(input) {
  const zoned = Temporal.Now.zonedDateTimeISO(process.env.TZ);
  return {
    "formatted_date": formatDateInTimeZone(zoned),
    "formatted_time": `Updated at ${getCurrentTime24Hour(zoned)}`,
    "generation_rate": 25.84
  }
}

function getCurrentTime24Hour(zoned) {
  const hour = String(zoned.hour).padStart(2, '0');
  const minute = String(zoned.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}

function formatDateInTimeZone(zoned) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekday = days[zoned.dayOfWeek % 7]; // Temporal uses 1 (Monday) to 7 (Sunday)
  const day = zoned.day;
  const month = months[zoned.month - 1];
  const year = zoned.year;

  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";

  return `${weekday} ${day}${suffix} ${month} ${year}`;
}
