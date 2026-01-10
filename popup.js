const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getTodayDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

async function loadPrayerTimes() {
  const todayDate = getTodayDate();
  
  chrome.storage.local.get(['latitude', 'longitude', 'prayerTimes', 'cachedDate'], async (result) => {
    let latitude, longitude;
    
    if (result.latitude && result.longitude) {
      latitude = result.latitude;
      longitude = result.longitude;
    } else {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        chrome.storage.local.set({ latitude, longitude });
      } catch (error) {
        document.getElementById("times").innerHTML = "<p>Error getting location. Please enable geolocation.</p>";
        return;
      }
    }
    
    chrome.runtime.sendMessage({ latitude, longitude });
    
    if (result.prayerTimes && result.cachedDate === todayDate) {
      displayPrayerTimes(result.prayerTimes);
    } else {
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${todayDate}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const data = await res.json();
        const times = data.data.timings;
        
        chrome.storage.local.set({ 
          prayerTimes: times, 
          cachedDate: todayDate 
        });
        
        displayPrayerTimes(times);
      } catch (error) {
        document.getElementById("times").innerHTML = "<p>Error fetching prayer times.</p>";
      }
    }
  });
}

function displayPrayerTimes(times) {
  const timesDiv = document.getElementById("times");
  timesDiv.innerHTML = "";
  
  for (const name of mainPrayers) {
    if (times[name]) {
      const row = document.createElement("div");
      row.className = "time-row";
      row.innerHTML = `<strong>${name}</strong>: ${times[name]}`;
      timesDiv.appendChild(row);
    }
  }
}

loadPrayerTimes();
