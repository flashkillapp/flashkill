import { fetchCached, cacheForOneDay, htmlExtractor } from '../util/fetchCached';
import { PlayerInfo, FaceitInfo, Division } from '../model';
import { getSteamLink } from '../util/getLink';
import { notNull } from '../util/notNull';
import { AjaxMatch, DivisionMatches } from '../model';
import { getMatchId, getTeams, getMapScores } from './selectors';
import { MessageNames, receiveMessage } from '../util/communication';

const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

receiveMessage(
  MessageNames.QueryDivisionsMatches,
  async (payload) => (
    Promise.all(payload.divisions.map((division) =>
      fetchDivisionMatches(division, payload.teamShortName),
    ))
  ),
);

receiveMessage(
  MessageNames.QueryPlayerInfo,
  async (payload) => fetchPlayerInfo(payload.steamId64),
);

receiveMessage(
  MessageNames.QueryFaceitInfos,
  async (payload) => (
    Promise.all(payload.steamIds64.map(fetchFaceitInfo))
  ),
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
    const matchDoc = await fetchMatchPage(matchLink);

    const [team_1, team_2] = getTeams(matchDoc);

    if (
      ajaxMatch === null
      || team_1 === null
      || team_2 === null
    ) return null;

    const mapScores = getMapScores(matchDoc);

    return {
      match_id: ajaxMatch.match_id,
      time: ajaxMatch.time,
      score_1: ajaxMatch.score_1,
      score_2: ajaxMatch.score_2,
      team_1,
      team_2,
      scores: mapScores,
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

const fetchMatchPage = async (matchLink: string): Promise<Document> => {
  const html = await fetchCached<string>(matchLink, cacheForOneDay, htmlExtractor);
  return new DOMParser().parseFromString(html, 'text/html');
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
