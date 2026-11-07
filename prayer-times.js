function getDateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function toApiDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}

async function requestPrayerTimesForDate(latitude, longitude, date) {
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${toApiDate(date)}?latitude=${latitude}&longitude=${longitude}&method=2`
  );
  if (!response.ok) {
    throw new Error(`Prayer time request failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200 || !result.data?.meta?.timezone || !result.data?.timings) {
    throw new Error('Prayer time API returned an invalid response');
  }

  return {
    date,
    timezone: result.data.meta.timezone,
    timings: result.data.timings
  };
}

async function fetchPrayerTimes(latitude, longitude) {
  const utcDate = getDateInTimeZone(new Date(), 'UTC');
  const initial = await requestPrayerTimesForDate(latitude, longitude, utcDate);
  const localDate = getDateInTimeZone(new Date(), initial.timezone);
  return localDate === utcDate
    ? initial
    : requestPrayerTimesForDate(latitude, longitude, localDate);
}

function getNextCalendarDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

function getPrayerTimestamp(date, time, timeZone) {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) {
    throw new Error(`Invalid prayer time: ${time}`);
  }

  const [year, month, day] = date.split('-').map(Number);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const targetUtc = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = targetUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date(timestamp));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
    const representedUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second
    );
    const adjustment = targetUtc - representedUtc;
    timestamp += adjustment;
    if (adjustment === 0) break;
  }

  return timestamp;
}

globalThis.PrayerTimes = {
  fetchPrayerTimes,
  requestPrayerTimesForDate,
  getDateInTimeZone,
  getNextCalendarDate,
  getPrayerTimestamp
};
