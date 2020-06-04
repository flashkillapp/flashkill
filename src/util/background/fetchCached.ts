const DEFAULT_CACHE_TIME = 3600;
const ONE_DAY_IN_SECONDS = 86400;
const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
const MATCH_DATE_XPATH_EXPRESSION = "/html/body/div[1]/main/section[1]/div/div[2]/div[1]/span/text()";

export async function fetchCached(url, cacheValidCondition = defaultCacheValidCondition, extractor = response => response.text(), header = null) : Promise<string> {
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

export function faceitExtractor(faceitResponse) {
    if (faceitResponse.ok) {
        return faceitResponse.json();
    } else {
        return null;
    }
}

export function cacheOnlyPastMatches(cacheResponse) {
    const matchDoc = new DOMParser().parseFromString(cacheResponse.response, "text/html");
    const matchTimeAsString = matchDoc.evaluate(MATCH_DATE_XPATH_EXPRESSION, matchDoc, null, XPathResult.STRING_TYPE, null).stringValue;
    const dateComponents = matchTimeAsString.split(".").map(parseInt);
    const matchDate = new Date(dateComponents[2], dateComponents[1], dateComponents[0]);
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

export function cacheForOneDay(cacheResponse) {
    return timeDependentCacheValidCondition(cacheResponse.cacheTime, ONE_DAY_IN_SECONDS);
}

function cacheForOneWeek(cacheResponse) {
    return timeDependentCacheValidCondition(cacheResponse.cacheTime, ONE_WEEK_IN_SECONDS);
}

function timeDependentCacheValidCondition(cacheTime, maxAgeInSeconds) {
    return cacheTime > Date.now() - maxAgeInSeconds * 1000;
}