const STEAM_NAME_XPATH_EXPRESSION = "//head/title";
const STEAM_PROFILE_PAGE_TITLE_PREFIX = "Steam Community :: ";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryPlayerInfo") {
            getPlayerInfo(request.steamIds).then(playerInfo => {
                sendResponse(playerInfo);
            }).catch(console.log);
            return true;  // Will respond asynchronously.
        }
        if (request.contentScriptQuery == "querySteamLink") {
            sendResponse(getSteamLink(getSteamId64(request.steamId)));
            return true;
        }
    }
);

async function getPlayerInfo(steamIds) {
    return Promise.all(steamIds.map(async steamId => {
        const steamId64 = getSteamId64(steamId);
        const faceitInfo = await getFaceitInfo(steamId64);
        const steamName = await getSteamName(steamId64);
        return {
            steamId,
            steamId64,
            faceitInfo,
            steamName
        };
    }));
}

async function getFaceitInfo(steamId64) {
    return findOnFaceit(steamId64);
}

async function findOnFaceit(steamId64) {
    const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId64}`;
    return fetchCached(url, cacheForOneDay, faceitExtractor, {
        headers: {
            "Authorization": " Bearer def684c3-589e-415f-a35f-ec6f1aef79cb"
        }
    });
}

async function getSteamName(steamId64) {
    const profileLink = getSteamLink(steamId64);
    const html = await fetchCached(profileLink, cacheForOneDay);
    var profileDoc = new DOMParser().parseFromString(html, "text/html");
    var nameElements = profileDoc.evaluate(STEAM_NAME_XPATH_EXPRESSION, profileDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const pageTitle = nameElements.snapshotItem(0).text;
    return pageTitle.substring(pageTitle.lastIndexOf(STEAM_PROFILE_PAGE_TITLE_PREFIX) + STEAM_PROFILE_PAGE_TITLE_PREFIX.length);
}

function getSteamLink(steamId64) {
    return `https://steamcommunity.com/profiles/${steamId64}`;
}

function getSteamId64(steamId) {
    const matches = steamId.match("steam_([0-5]):([0-1]):([0-9]+)");
    if (matches == null) {
        return "";
    }
    const universe = parseInt(matches[1], 10) || 1; // If it's 0, turn it into 1 for public
    const type = 1;
    const instance = 1;
    const accountId = (parseInt(matches[3], 10) * 2) + parseInt(matches[2], 10);
    return new UINT64(accountId, (universe << 24) | (type << 20) | (instance)).toString();
}