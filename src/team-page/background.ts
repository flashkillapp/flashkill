import { fetchCached, cacheForOneDay, htmlExtractor } from '../util/fetchCached';
import { PlayerInfo, FaceitInfo, Division } from '../model';
import { getSteamLink } from '../util/getSteamLink';
import { notNull } from '../util/notNull';
import { AjaxMatch } from '../model';
import { getMatchId } from './selectors';

const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

export enum TeamPageRequestTypes {
  QueryPlayerInfo = 'queryPlayerInfo',
  QueryFaceitInfos = 'queryFaceitInfos',
  QueryDivisionMatches = 'queryDivisionmatches',
  QueryMatchesDetails = 'queryMatchesDetails',
}

export interface PlayerInfoRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryPlayerInfo;
  steamId64: string;
}

export interface FaceitInfosRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryFaceitInfos;
  steamIds64: string[];
}

export interface DivisionMatchesRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryDivisionMatches;
  divisions: Division[];
}

export interface MatchesDetailsRequest {
  contentScriptQuery: typeof TeamPageRequestTypes.QueryMatchesDetails;
  divisionTuples: [Division, string[]][];
}

type MemberRequest = PlayerInfoRequest
  | FaceitInfosRequest
  | DivisionMatchesRequest
  | MatchesDetailsRequest;

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

      case TeamPageRequestTypes.QueryDivisionMatches: {
        Promise.all(request.divisions.map(fetchDivisionMatches))
          .then(sendResponse)
          .catch(console.log);
        return true;
      }

      case TeamPageRequestTypes.QueryMatchesDetails: {
        Promise.all(request.divisionTuples.map(async ([division, links]) => {
          const ajaxMatches = await Promise.all(links.map(async (link) => ([
            link, await fetchAjaxMatch(link),
          ])));
          return [
            division,
            ajaxMatches,
          ];
        }))
          .then(sendResponse)
          .catch(console.log);
        return true;
      }

      default:
        return false;
    }
  },
);

const fetchDivisionMatches = async (division: Division): Promise<[Division, string[]]> => {
  const html = await fetchCached<string>(division.url, cacheForOneDay, htmlExtractor);
  const divisionDoc = new DOMParser().parseFromString(html, 'text/html');
  const matchLinkElements = Array.from(
    divisionDoc.querySelectorAll<HTMLLinkElement>(
      'section.league-group-matches td.col-2 a',
    ),
  );

  const matchLinks = matchLinkElements
    .map((matchLinkElement) => (
      matchLinkElement.getAttribute('href')
    ))
    .filter(notNull);

  return [
    division,
    matchLinks,
  ];
};

const ajaxMatchExtractor = (ajaxMatchResponse: Response): Promise<AjaxMatch | null> => {
  if (ajaxMatchResponse.ok) {
    return ajaxMatchResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

const fetchAjaxMatch = async (matchLink: string): Promise<AjaxMatch | null> => {
  const url = `https://liga.99damage.de/ajax/leagues_match?id=${getMatchId(matchLink)}&action=init`;
  return fetchCached<AjaxMatch | null>(url, cacheForOneDay, ajaxMatchExtractor);
};

const fetchPlayerInfo = async (steamId64: string): Promise<PlayerInfo | null> => {
  const faceitInfo = await fetchFaceitInfo(steamId64);
  const steamName = await fetchSteamName(steamId64);
  return {
    steamId64,
    faceitInfo,
    steamName,
  };
};

const faceitExtractor = (faceitResponse: Response): Promise<FaceitInfo | null> => {
  if (faceitResponse.ok) {
    return faceitResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

const fetchFaceitInfo = async (steamId64: string): Promise<FaceitInfo | null> => {
  const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId64}`;
  return fetchCached<FaceitInfo | null>(url, cacheForOneDay, faceitExtractor, {
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
