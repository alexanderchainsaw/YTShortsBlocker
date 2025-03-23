let blockSettings = null;

// Function to hide shorts
function hideShorts() {
  const shortsElements = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-shorts');
  shortsElements.forEach(element => {
    element.style.display = 'none';
  });
}

// Function to show shorts
function showShorts() {
  const shortsElements = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-shorts');
  shortsElements.forEach(element => {
    element.style.display = '';
  });
}

// Function to check if current time is within daily block period
function isWithinDailyBlock(settings) {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  return currentTime >= settings.startTime && currentTime <= settings.endTime;
}

// Function to check block status
function checkBlockStatus() {
  if (!blockSettings) return;
  
  if (blockSettings.type === 'oneTime') {
    const now = new Date().getTime();
    if (now >= blockSettings.endTime) {
      showShorts();
      blockSettings = null;
    } else {
      hideShorts();
    }
  } else {
    if (isWithinDailyBlock(blockSettings)) {
      hideShorts();
    } else {
      showShorts();
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBlock') {
    blockSettings = message.settings;
    checkBlockStatus();
  } else if (message.action === 'removeBlock') {
    blockSettings = null;
    showShorts();
  } else if (message.action === 'checkDailyBlock') {
    blockSettings = message.settings;
    checkBlockStatus();
  }
});

// Initial check for block settings
chrome.storage.local.get(['blockSettings'], function(result) {
  if (result.blockSettings) {
    blockSettings = result.blockSettings;
    checkBlockStatus();
  }
});

// Create a MutationObserver to watch for new shorts being added to the page
const observer = new MutationObserver((mutations) => {
  if (blockSettings) {
    checkBlockStatus();
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true }); 