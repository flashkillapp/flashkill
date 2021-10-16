import { fetchCached, cacheForOneDay, htmlExtractor } from '../util/fetchCached';
import { PlayerInfo, FaceitInfo, Division } from '../model';
import { getSteamLink } from '../util/getLink';
import { notNull } from '../util/notNull';
import { AjaxMatch, MapScores, DivisionMatches } from '../model';
import { getMatchId, getTeam } from './selectors';

const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

export enum TeamPageRequestTypes {
  QueryPlayerInfo = 'queryPlayerInfo',
  QueryFaceitInfos = 'queryFaceitInfos',
  QueryDivisionsMatches = 'queryDivisionsMatches',
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
  contentScriptQuery: typeof TeamPageRequestTypes.QueryDivisionsMatches;
  divisions: Division[];
  teamShortName: string;
}

type MemberRequest = PlayerInfoRequest
  | FaceitInfosRequest
  | DivisionMatchesRequest;

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

      case TeamPageRequestTypes.QueryDivisionsMatches: {
        Promise.all(request.divisions.map((division) =>
          fetchDivisionMatches(division, request.teamShortName),
        ))
          .then(sendResponse)
          .catch(console.log);
        return true;
      }

      default:
        return false;
    }
  },
);

const fetchDivisionMatches = async (division: Division, teamShortName: string): Promise<DivisionMatches> => {
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
    .filter(notNull)
    .filter((matchLink) => matchLink.includes(teamShortName));

  const matches = await Promise.all(matchLinks.map(async (matchLink) => {
    const ajaxMatch = await fetchAjaxMatch(matchLink);
    const mapScores = await fetchMatchMapScores(matchLink);

    if (ajaxMatch === null) return null;

    return {
      match_id: ajaxMatch.match_id,
      time: ajaxMatch.time,
      score_1: ajaxMatch.score_1,
      score_2: ajaxMatch.score_2,
      team_1: mapScores.team_1,
      team_2: mapScores.team_2,
      scores: mapScores.scores,
      draft_mapvoting_bans: ajaxMatch.draft_mapvoting_bans,
      draft_mapvoting_picks: ajaxMatch.draft_mapvoting_picks,
      draft_maps: ajaxMatch.draft_maps,
      draft_opp1: ajaxMatch.draft_opp1,
      draft_opp2: ajaxMatch.draft_opp2,
    };
  }));

  return {
    division,
    matches: matches.filter(notNull),
  };
};

const fetchMatchMapScores = async (matchLink: string): Promise<MapScores> => {
  const html = await fetchCached<string>(matchLink, cacheForOneDay, htmlExtractor);
  const matchDoc = new DOMParser().parseFromString(html, 'text/html');
  const resultString = matchDoc.querySelector('.content-match-head-score div.txt-info');
  const mapScores = resultString?.textContent?.split('/') ?? null;

  return {
    team_1: getTeam(matchDoc, 1),
    team_2: getTeam(matchDoc, 2),
    scores: mapScores?.map((mapScore) => {
      const scores = mapScore.split(':');

      if (scores.length !== 2) return null;

      return {
        score_1: Number.parseInt(scores[0], 10),
        score_2: Number.parseInt(scores[1], 10),
      };
    }).filter(notNull) ?? [],
  };
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
