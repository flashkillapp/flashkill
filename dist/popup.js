const clearCache = () => chrome.storage.local.clear(() => alert('Cache wurde geleert.'));

document.getElementById('clear-cache-button').onclick = clearCache;

document.getElementById('flashkill-logo').src = chrome.runtime.getURL('icons/flashkill-logo-white.png');
document.getElementById('donation-button').src = chrome.runtime.getURL('icons/donation-button.png');
document.getElementById('license-link').href = chrome.runtime.getURL('LICENSE-DETAILS.md');
