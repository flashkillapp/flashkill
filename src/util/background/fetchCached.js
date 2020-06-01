const DEFAULT_CACHE_TIME = 3600;
const ONE_DAY_IN_SECONDS = 86400;
const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
const MATCH_DATE_XPATH_EXPRESSION = "//div[@class='match_head']/div[@class='right']/text()";

async function fetchCached(url, cacheValidCondition = defaultCacheValidCondition, extractor = response => response.text(), header = null) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(url, cachedItems => {
            if (cachedItems[url]) {
                if (cacheValidCondition(cachedItems[url])) {
                    resolve(cachedItems[url].response);
                    return;
                }
            };
            fetch(url, header).then(extractor).then(response => {
                chrome.storage.local.set(
                    {
                        [url]: {
                            response,
                            cacheTime: Date.now()
                        }
                    },
                    () => resolve(response));
            });
        });
    });
}

function getMonthNumber(monthName) {
    switch (monthName) {
        case "Jan":
            return "01";
        case "Feb":
            return "02";
        case "Mar":
            return "03";
        case "Apr":
            return "04";
        case "Mai":
            return "05";
        case "Jun":
            return "06";
        case "Jul":
            return "07";
        case "Aug":
            return "08";
        case "Sep":
            return "09";
        case "Okt":
            return "10";
        case "Nov":
            return "11";
        case "Dec":
            return "12";
        case "Dez":
            return "12";
        case "May":
            return "05";
        case "Oct":
            return "10";
        case "Mär":
            return "03";
    }
}


function faceitExtractor(faceitResponse) {
    if (faceitResponse.ok) {
        return faceitResponse.json();
    } else {
        return null;
    }
}

function cacheOnlyPastMatches(cacheResponse) {
    const matchDoc = new DOMParser().parseFromString(cacheResponse.response, "text/html");
    const matchTimeEntries = matchDoc.evaluate(MATCH_DATE_XPATH_EXPRESSION, matchDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const matchTimeAsString = matchTimeEntries.snapshotItem(0).wholeText.trim();
    const parsedDate = matchTimeAsString.match("([0-9]{2}) ([a-zA-ZäöüßÄÖÜ]{3}) ([0-9]{4})");
    const day = parsedDate[1];
    const month = getMonthNumber(parsedDate[2]);
    const year = parsedDate[3];
    const matchDate = new Date(year, month, day);
    const twoWeeksAgo = new Date(Date.now());
    twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);

    if (matchDate > twoWeeksAgo) {
        return false;
    } else {
        return true;
    }
}

function defaultCacheValidCondition(cacheResponse) {
    return timeDependentCacheValidCondition(cacheResponse.cacheTime, DEFAULT_CACHE_TIME);
}

function cacheForOneDay(cacheResponse) {
    return timeDependentCacheValidCondition(cacheResponse.cacheTime, ONE_DAY_IN_SECONDS);
}

function cacheForOneWeek(cacheResponse) {
    return timeDependentCacheValidCondition(cacheResponse.cacheTime, ONE_WEEK_IN_SECONDS);
}

function timeDependentCacheValidCondition(cacheTime, maxAgeInSeconds) {
    return cacheTime > Date.now() - maxAgeInSeconds * 1000;
}