const DEFAULT_CACHE_TIME = 3600;
const ONE_DAY_IN_SECONDS = 86400;

interface CacheResponse<T> {
    response: T;
    cacheTime: number;
}

export const htmlExtractor = (response: Response): Promise<string> => (
  response.text()
);

export const fetchCached = async <T>(
  url: string,
  cacheValidCondition = defaultCacheValidCondition,
  extractor: (response: Response) => Promise<T>,
  header = null,
): Promise<T> => new Promise((resolve) => {
  chrome.storage.local.get(url, cachedItems => {
    if (cachedItems[url]) {
      if (cacheValidCondition(cachedItems[url])) {
        resolve(cachedItems[url].response);
        return;
      }
    }
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

const defaultCacheValidCondition = <T>(cacheResponse: CacheResponse<T>): boolean => (
  timeDependentCacheValidCondition(cacheResponse.cacheTime, DEFAULT_CACHE_TIME)
);

export const cacheForOneDay = <T>(cacheResponse: CacheResponse<T>): boolean => (
  timeDependentCacheValidCondition(cacheResponse.cacheTime, ONE_DAY_IN_SECONDS)
);

const timeDependentCacheValidCondition = (cacheTime: number, maxAgeInSeconds: number): boolean => (
  cacheTime > Date.now() - maxAgeInSeconds * 1000
);