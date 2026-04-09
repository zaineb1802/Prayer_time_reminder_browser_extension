const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('periodic_update', { periodInMinutes: 720 }); 
});

async function setPrayerAlarms() {
  const data = await chrome.storage.local.get(['latitude', 'longitude']);
  if (!data.latitude || !data.longitude) return;

  const today = new Date();
  const todayStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${todayStr}?latitude=${data.latitude}&longitude=${data.longitude}&method=2`
    );
    const json = await res.json();
    const timings = json.data.timings;

    for (const name of mainPrayers) {
      await chrome.alarms.clear(name);
    }

    const now = Date.now();

    for (const name of mainPrayers) {
      const [hour, minute] = timings[name].split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hour, minute, 0, 0);

      if (prayerTime.getTime() > now) {
        chrome.alarms.create(name, { when: prayerTime.getTime() });
      }
    }
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic_update') {
    setPrayerAlarms();
  } else if (mainPrayers.includes(alarm.name)) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Prayer Reminder",
      message: `🕌 It's time for ${alarm.name}.`,
      priority: 2
    });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_ALARMS") {
    setPrayerAlarms();
  }
});