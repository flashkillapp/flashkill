const clearCache = () => chrome.storage.local.clear(() => alert('Cache wurde geleert.'));

document.getElementById('clear-cache-button').onclick = clearCache;
