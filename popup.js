document.addEventListener('DOMContentLoaded', function() {
  const blockTypeInputs = document.getElementsByName('blockType');
  const oneTimeBlock = document.getElementById('oneTimeBlock');
  const dailyBlock = document.getElementById('dailyBlock');
  const setBlockButton = document.getElementById('setBlock');
  const removeBlockButton = document.getElementById('removeBlock');
  const statusElement = document.getElementById('status');

  // Load current block status
  chrome.storage.local.get(['blockSettings'], function(result) {
    if (result.blockSettings) {
      updateStatus(result.blockSettings);
    }
  });

  // Handle block type selection
  blockTypeInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.value === 'oneTime') {
        oneTimeBlock.style.display = 'block';
        dailyBlock.style.display = 'none';
      } else {
        oneTimeBlock.style.display = 'none';
        dailyBlock.style.display = 'block';
      }
    });
  });

  // Handle set block button
  setBlockButton.addEventListener('click', function() {
    const selectedType = document.querySelector('input[name="blockType"]:checked').value;
    let blockSettings;

    if (selectedType === 'oneTime') {
      const duration = document.getElementById('duration').value;
      const timeUnit = document.getElementById('timeUnit').value;
      const endTime = new Date();
      
      switch(timeUnit) {
        case 'minutes':
          endTime.setMinutes(endTime.getMinutes() + parseInt(duration));
          break;
        case 'hours':
          endTime.setHours(endTime.getHours() + parseInt(duration));
          break;
        case 'days':
          endTime.setDate(endTime.getDate() + parseInt(duration));
          break;
      }

      blockSettings = {
        type: 'oneTime',
        endTime: endTime.getTime()
      };
    } else {
      const startTime = document.getElementById('startTime').value;
      const endTime = document.getElementById('endTime').value;
      
      blockSettings = {
        type: 'daily',
        startTime: startTime,
        endTime: endTime
      };
    }

    chrome.storage.local.set({ blockSettings: blockSettings }, function() {
      updateStatus(blockSettings);
      chrome.runtime.sendMessage({ action: 'updateBlock', settings: blockSettings });
    });
  });

  // Handle remove block button
  removeBlockButton.addEventListener('click', function() {
    if (window.countdownTimer) {
      clearInterval(window.countdownTimer);
      window.countdownTimer = null;
    }
    chrome.storage.local.remove('blockSettings', function() {
      statusElement.textContent = 'No active block';
      chrome.runtime.sendMessage({ action: 'removeBlock' });
    });
  });
});

function updateStatus(settings) {
  const statusElement = document.getElementById('status');
  
  if (settings.type === 'oneTime') {
    // Clear any existing timer
    if (window.countdownTimer) {
      clearInterval(window.countdownTimer);
    }

    function updateCountdown() {
      const endTime = new Date(settings.endTime);
      const now = new Date();
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0) {
        statusElement.textContent = 'No active block';
        chrome.storage.local.remove('blockSettings');
        clearInterval(window.countdownTimer);
        window.countdownTimer = null;
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        statusElement.textContent = `Blocked for ${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        statusElement.textContent = `Blocked for ${minutes}m ${seconds}s`;
      } else {
        statusElement.textContent = `Blocked for ${seconds}s`;
      }
    }

    // Update immediately and then every second
    updateCountdown();
    window.countdownTimer = setInterval(updateCountdown, 1000);
  } else {
    statusElement.textContent = `Daily block: ${settings.startTime} - ${settings.endTime}`;
  }
} 