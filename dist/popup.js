
const clearCache = () => {
    chrome.storage.local.clear(() => alert("Cache wurde geleert."));
};

const changeMapsTableAutoLoad = () => {
    if (mapsTableAutoLoadCheckbox.checked) {
        alert(
            `Mit dieser Auswahl läufst du Gefahr einen IP-Ban von 99Damage zu erhalten,
            wenn du zu viele neue Teamseiten in kurze Zeit lädst.
            Die Änderung tritt ab dem nächsten Öffnen einer Teamseite in Kraft.`
        );
        chrome.storage.sync.set({ mapsTableAutoLoad: true }, () => { });
    }
    else {
        alert(
            `Die Map Übersicht wird jetzt nicht mehr automatisch geladen.
            Nutze den entsprechenden Button, der anstelle der Maps Übersicht erscheint, zum analysieren der Maps eines Teams.
            Die Änderung tritt ab dem nächsten Öffnen einer Teamseite in Kraft.`
        );
        chrome.storage.sync.set({ mapsTableAutoLoad: false }, () => { });
    }
};

const mapsTableAutoLoadCheckbox = document.getElementById("maps-table-auto-load");

chrome.storage.sync.get(['mapsTableAutoLoad'], (result) => {
    mapsTableAutoLoadCheckbox.checked = result.mapsTableAutoLoad;
});

document.getElementById("clear-cache-button").onclick = clearCache;

mapsTableAutoLoadCheckbox.onclick = changeMapsTableAutoLoad;
