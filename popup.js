const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

async function init() {
  const result = await chrome.storage.local.get(['latitude', 'longitude', 'prayerTimes', 'cachedDate']);
  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

  if (result.latitude && result.longitude) {
    if (result.cachedDate === todayDate && result.prayerTimes) {
      displayPrayerTimes(result.prayerTimes);
    } else {
      fetchTimes(result.latitude, result.longitude, todayDate);
    }
  } else {
    getLocation(todayDate);
  }
}

function getLocation(todayDate) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      chrome.storage.local.set({ latitude, longitude });
      fetchTimes(latitude, longitude, todayDate);
      // Tell background to set alarms now that we have location
      chrome.runtime.sendMessage({ type: "UPDATE_ALARMS" });
    },
    () => {
      document.getElementById("times").innerHTML = "<p>Please enable location permissions.</p>";
    }
  );
}

async function fetchTimes(lat, lon, date) {
  try {
    const res = await fetch(`https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=2`);
    const data = await res.json();
    const times = data.data.timings;

    chrome.storage.local.set({ prayerTimes: times, cachedDate: date });
    displayPrayerTimes(times);
    chrome.runtime.sendMessage({ type: "UPDATE_ALARMS" });
  } catch (e) {
    document.getElementById("times").innerHTML = "<p>Connection error.</p>";
  }
}

function displayPrayerTimes(times) {
  const timesDiv = document.getElementById("times");
  timesDiv.innerHTML = mainPrayers.map(name => `
    <div class="time-row">
      <span class="prayer-name">${name}</span>
      <span class="prayer-time">${times[name]}</span>
    </div>
  `).join('');
}

init();