# Prayer Time Reminder

## Project Overview
Prayer Time Reminder is a chromium-based browser extension that notifies muslim users when it’s time for the five daily prayers. The extension fetches accurate prayer times based on your current location and provides timely notifications, helping users stay consistent with their prayers.

## Features
- **Automatic Location Detection**: Fetches prayer times based on your current geolocation.
- **Prayer Notifications**: Sends notifications for each prayer.
- **Daily Update**: Automatically updates prayer times every day.
- **Manual Caching**: Stores daily prayer times locally to reduce API calls and improve performance.
- **Clean Popup Interface**: Displays today's prayer times in an easy-to-read format.

## Technologies Used
- **JavaScript**: Handles logic for fetching prayer times and creating alarms.
- **HTML & CSS**: User interface for the popup displaying prayer times.
- **Chrome Extensions API**: Alarms, notifications, and storage.
- **AlAdhan API**: Provides accurate prayer times worldwide.

## Project Structure
```
├── background.js # Background service worker for alarms and notifications
├── popup.html # Extension popup displaying prayer times
├── popup.js # Logic for fetching and displaying prayer times
├── styles.css # Styling for the popup interface
├── manifest.json # Chrome extension manifest file
└── icons/
└── icon128.png # Extension icon
```

## Installation
1. Clone the repository
2. Open Chrome and navigate to chrome://extensions/.
3. Enable Developer mode (top right).
4. Click Load unpacked and select the project directory.
