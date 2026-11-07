const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const prayerAlarmPrefix = 'next_prayer:';
const staleAlarmTolerance = 60 * 1000;

importScripts('prayer-times.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('periodic_update', { periodInMinutes: 360 });
  void setPrayerAlarm();
});

async function clearPrayerAlarms() {
  await chrome.alarms.clear('next_prayer');
  for (const name of mainPrayers) {
    await chrome.alarms.clear(name);
    await chrome.alarms.clear(`${prayerAlarmPrefix}${name}`);
  }
}

async function setPrayerAlarm() {
  try {
    await clearPrayerAlarms();
    const location = await chrome.storage.local.get(['latitude', 'longitude']);
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return;

    let dailyTimes = await PrayerTimes.fetchPrayerTimes(location.latitude, location.longitude);
    let nextPrayer;

    for (let dayOffset = 0; dayOffset < 2 && !nextPrayer; dayOffset += 1) {
      if (dayOffset > 0) {
        const nextDate = PrayerTimes.getNextCalendarDate(dailyTimes.date);
        dailyTimes = await PrayerTimes.requestPrayerTimesForDate(
          location.latitude,
          location.longitude,
          nextDate
        );
      }

      for (const name of mainPrayers) {
        const timestamp = PrayerTimes.getPrayerTimestamp(
          dailyTimes.date,
          dailyTimes.timings[name],
          dailyTimes.timezone
        );
        if (timestamp > Date.now() && (!nextPrayer || timestamp < nextPrayer.timestamp)) {
          nextPrayer = { name, timestamp };
        }
      }
    }

    if (nextPrayer) {
      chrome.alarms.create(`${prayerAlarmPrefix}${nextPrayer.name}`, {
        when: nextPrayer.timestamp
      });
    } else {
      throw new Error('No upcoming prayer time was returned');
    }
  } catch (error) {
    console.error('Failed to schedule the next prayer:', error);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic_update') {
    void setPrayerAlarm();
  } else if (alarm.name.startsWith(prayerAlarmPrefix)) {
    if (alarm.scheduledTime && Date.now() - alarm.scheduledTime > staleAlarmTolerance) {
      void setPrayerAlarm();
      return;
    }

    const prayerName = alarm.name.slice(prayerAlarmPrefix.length);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Prayer Reminder',
      message: `🕌 It's time for ${prayerName}.`,
      priority: 2
    });
    void setPrayerAlarm();
  } else if (mainPrayers.includes(alarm.name)) {
    void chrome.alarms.clear(alarm.name);
  }
});

chrome.runtime.onStartup.addListener(() => {
  void setPrayerAlarm();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'UPDATE_ALARMS') {
    void setPrayerAlarm();
  }
});