// Check block status periodically
let blockCheckInterval = setInterval(checkBlockStatus, 60000); // Check every minute

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBlock') {
    updateBlock(message.settings);
  } else if (message.action === 'removeBlock') {
    removeBlock();
  }
});

function checkBlockStatus() {
  chrome.storage.local.get(['blockSettings'], function(result) {
    if (result.blockSettings) {
      const settings = result.blockSettings;
      
      if (settings.type === 'oneTime') {
        const now = new Date().getTime();
        if (now >= settings.endTime) {
          removeBlock();
        }
      } else {
        // For daily blocks, we'll check in the content script
        chrome.tabs.query({url: 'https://*.youtube.com/*'}, function(tabs) {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'checkDailyBlock', settings: settings });
          });
        });
      }
    }
  });
}

function updateBlock(settings) {
  chrome.tabs.query({url: 'https://*.youtube.com/*'}, function(tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'updateBlock', settings: settings });
    });
  });
}

function removeBlock() {
  chrome.storage.local.remove('blockSettings', function() {
    chrome.tabs.query({url: 'https://*.youtube.com/*'}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'removeBlock' });
      });
    });
  });
} 