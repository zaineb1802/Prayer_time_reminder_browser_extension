const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

async function init() {
  const result = await chrome.storage.local.get([
    'latitude',
    'longitude',
    'prayerTimes',
    'cachedDate',
    'timezone'
  ]);

  if (typeof result.latitude === 'number' && typeof result.longitude === 'number') {
    const localDate = result.timezone
      ? PrayerTimes.getDateInTimeZone(new Date(), result.timezone)
      : null;
    if (result.cachedDate === localDate && result.prayerTimes) {
      displayPrayerTimes(result.prayerTimes, result.timezone);
    } else {
      fetchTimes(result.latitude, result.longitude);
    }
  } else {
    getLocation();
  }
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      void chrome.storage.local.set({ latitude, longitude }).then(() => {
        fetchTimes(latitude, longitude);
      });
    },
    () => {
      document.getElementById("times").innerHTML = "<p>Please enable location permissions.</p>";
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
}

async function fetchTimes(lat, lon) {
  try {
    const result = await PrayerTimes.fetchPrayerTimes(lat, lon);
    await chrome.storage.local.set({
      prayerTimes: result.timings,
      cachedDate: result.date,
      timezone: result.timezone
    });
    displayPrayerTimes(result.timings, result.timezone);
    chrome.runtime.sendMessage({ type: "UPDATE_ALARMS" });
  } catch (e) {
    document.getElementById("times").innerHTML = "<p>Connection error.</p>";
  }
}

function displayPrayerTimes(times, timezone) {
  const timesDiv = document.getElementById("times");
  document.getElementById("timezone").textContent = `Timezone: ${timezone}`;
  timesDiv.innerHTML = mainPrayers.map(name => `
    <div class="time-row">
      <span class="prayer-name">${name}</span>
      <span class="prayer-time">${times[name]}</span>
    </div>
  `).join('');
}

init();