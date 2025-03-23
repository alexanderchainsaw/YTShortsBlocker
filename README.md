# YouTube Shorts Blocker Chrome Extension

This Chrome extension allows you to block YouTube Shorts during specified time periods. You can set up either one-time blocks or daily recurring blocks.

## Features

- One-time blocking: Block Shorts for a specific duration (minutes, hours, or days)
- Daily blocking: Block Shorts during specific hours of the day (e.g., 10:00 AM to 6:00 PM)
- Easy to use popup interface
- Real-time status updates
- Automatic removal of expired blocks

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose between "One-time Block" or "Daily Block"
3. For one-time blocks:
   - Enter the duration
   - Select the time unit (minutes, hours, or days)
4. For daily blocks:
   - Set the start time
   - Set the end time
5. Click "Set Block" to activate the blocking
6. Use "Remove Block" to deactivate the blocking at any time

## How it Works

The extension works by hiding YouTube Shorts elements on the page when the block is active. It uses a MutationObserver to ensure that new Shorts are also hidden as they are loaded.
