# Prayer Time Reminder

## Project Overview
Prayer Time Reminder is a chromium-based browser extension that notifies muslim users when it’s time for the five daily prayers. The extension fetches accurate prayer times based on your current location and provides timely notifications, helping users stay consistent with their prayers.

## Features
- **Automatic Location Detection**: Fetches prayer times using high-accuracy geolocation.
- **Timezone-Aware Scheduling**: Displays and schedules times in the timezone returned for your coordinates.
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
├── background.js 
├── popup.html 
├── popup.js 
├── styles.css 
├── manifest.json 
└── icons/
└── icon128.png 
```

## Installation
1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable Developer mode (top right).
4. Click "Load unpacked" and select the project directory.
5. The Prayer Time Reminder extension will appear in your extensions list.

## Usage
1. **Grant Location Access**: When you first open the extension, click the extension icon to view the popup and allow location access.
2. **View Prayer Times**: The popup displays today's prayer times for your location automatically.
3. **Receive Notifications**: The next upcoming prayer is scheduled at its local prayer time. Missed alarms from before the browser opened are ignored.
4. **Manual Refresh**: Open the popup to refresh prayer times if your location changes.

## How It Works
- **Initial Setup**: On installation and browser startup, the extension clears outdated prayer alarms and schedules only the next upcoming prayer.
- **Location-Based Fetching**: Uses your device's geolocation to fetch prayer times and the associated timezone from the AlAdhan API.
- **Alarm Management**: Schedules the next prayer, then schedules the following one when it fires. Prayer times are converted from the location's timezone rather than the computer's timezone.
- **Notifications**: When an alarm triggers, a notification is displayed to remind you of the prayer time.
- **Local Caching**: Prayer times are cached locally to minimize API calls and improve performance.

## Permissions Explained
The extension requests the following permissions:
- **geolocation**: To determine your location for accurate prayer times.
- **alarms**: To schedule prayer time notifications.
- **notifications**: To display prayer reminders.
- **storage**: To cache prayer times and location data locally.
- **host_permissions**: Access to `api.aladhan.com` to fetch prayer times worldwide.

## Troubleshooting
- **Notifications Not Showing**: Ensure you have notifications enabled in Chrome settings and that the extension has notification permissions.
- **Prayer Times Not Updating**: Check that your device's location services are enabled and that you've allowed the extension to access your location.
- **"Locating..." Message**: This appears while fetching your location. Wait a few seconds for it to resolve.
- **API Issues**: If the AlAdhan API is temporarily unavailable, previously cached prayer times will be displayed if available.
