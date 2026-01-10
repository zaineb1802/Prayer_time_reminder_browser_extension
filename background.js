const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

async function setPrayerAlarms(latitude, longitude) {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const todayDate = `${day}-${month}-${year}`;
  
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${todayDate}?latitude=${latitude}&longitude=${longitude}&method=2`
  );
  const data = await res.json();
  const timings = data.data.timings;
  const now = new Date();

  for (const name of mainPrayers) {
    if (timings[name]) {
      const timeStr = timings[name];
      const [hour, minute] = timeStr.split(":").map(Number);
      const t = new Date();
      t.setHours(hour, minute, 0, 0);

      if (t > now) {
        chrome.alarms.create(name, { when: t.getTime() });
      }
    }
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.latitude && msg.longitude) {
    setPrayerAlarms(msg.latitude, msg.longitude);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Prayer Reminder",
    message: `🕌 It's time for ${alarm.name} prayer.`,
    priority: 2
  });
});