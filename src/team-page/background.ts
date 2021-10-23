import { fetchCached, cacheForOneDay, htmlExtractor } from '../util/fetchCached';
import { PlayerInfo, FaceitInfo } from '../model';
import { getSteamLink } from '../util/getSteamLink';

const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

export enum TeamPageRequestTypes {
  QueryPlayerInfo = 'queryPlayerInfo',
  QueryFaceitInfos = 'queryFaceitInfos',
}

export interface PlayerInfoRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryPlayerInfo;
  steamId64: string;
}

export interface FaceitInfosRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryFaceitInfos;
  steamIds64: string[];
}

type MemberRequest = PlayerInfoRequest | FaceitInfosRequest;

chrome.runtime.onMessage.addListener(
  (request: MemberRequest, _, sendResponse): boolean => {
    switch (request.contentScriptQuery) {
      case TeamPageRequestTypes.QueryPlayerInfo: {
        fetchPlayerInfo(request.steamId64)
          .then(sendResponse)
          .catch(console.log);
        return true;
      }

      case TeamPageRequestTypes.QueryFaceitInfos: {
        Promise.all(request.steamIds64.map(fetchFaceitInfo))
          .then(sendResponse)
          .catch(console.log);
        return true;
      }

      default:
        return false;
    }
  },
);

const fetchPlayerInfo = async (steamId64: string): Promise<PlayerInfo> => {
  const faceitInfo = await fetchFaceitInfo(steamId64);
  const steamName = await fetchSteamName(steamId64);
  return {
    steamId64,
    faceitInfo: faceitInfo ?? undefined,
    steamName: steamName ?? undefined,
  };
};

const faceitInfoExtractor = (faceitResponse: Response): Promise<FaceitInfo | null> => {
  if (faceitResponse.ok) {
    return faceitResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

const fetchFaceitInfo = async (steamId64: string): Promise<FaceitInfo | null> => {
  const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId64}`;
  return fetchCached<FaceitInfo | null>(url, cacheForOneDay, faceitInfoExtractor, {
    headers: {
      'Authorization': ' Bearer def684c3-589e-415f-a35f-ec6f1aef79cb',
    },
  });
};

const fetchSteamName = async (steamId64: string): Promise<string | null> => {
  const profileLink = getSteamLink(steamId64);
  const html = await fetchCached<string>(profileLink, cacheForOneDay, htmlExtractor);
  const profileDoc = new DOMParser().parseFromString(html, 'text/html');
  const pageTitle = profileDoc.querySelector('head title')?.textContent;
  return pageTitle?.substring(
    pageTitle?.lastIndexOf(STEAM_PROFILE_PAGE_TITLE_PREFIX) + STEAM_PROFILE_PAGE_TITLE_PREFIX.length,
  ) ?? null;
};
