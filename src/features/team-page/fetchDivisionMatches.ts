import { MatchTableItem } from '../../components/MatchesTable';
import { AjaxMatch, Division, Match } from '../../model';
import { cacheForOneDay, fetchCached, htmlExtractor } from '../../util/fetchCached';
import { notNull } from '../../util';

import { getMapScores, getMatchId, getSeason, getTeams } from './selectors';

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

const fetchMatchPage = async (matchLink: string): Promise<Document> => {
  const html = await fetchCached<string>(matchLink, cacheForOneDay, htmlExtractor);
  return new DOMParser().parseFromString(html, 'text/html');
};

const fetchDivisionMatches = async (
  division: Division, teamShortName: string,
): Promise<Match[]> => {
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

  return matches.filter(notNull);
};

const makeHomeMatches = (
  matchItems: MatchTableItem[], homeTeamId: number,
): MatchTableItem[] => (
  matchItems.map((matchItem) => {
    if (matchItem.team_1?.id === homeTeamId) return matchItem;

    return {
      ...matchItem,
      team_1: matchItem.team_2,
      team_2: matchItem.team_1,
      score_1: matchItem.score_2,
      score_2: matchItem.score_1,
    };
  })
);

const getMatchTableItems = (
  match: Match, division: Division,
): MatchTableItem[] => {
  const season = getSeason(division.url);

  if (match.scores.length === 0) {
    return [{
      ...match,
      division,
      season,
      map: null,
    }];
  }

  return match.scores.map((score, index) => ({
    ...match,
    division,
    season,
    score_1: score.score_1,
    score_2: score.score_2,
    map: match.draft_maps.find(
      (draft_map) => draft_map.id === match.draft_mapvoting_picks[index],
    ) ?? null,
  }));
};

export const fetchDivisionsMatches = async (
  divisions: Division[], teamShortName: string, teamId: number,
): Promise<MatchTableItem[]> => {
  const matchesPerDivision = await Promise.all(
    divisions.map(async (division) => {
      const matches = await fetchDivisionMatches(division, teamShortName);
      const matchItems = matches.flatMap((match) => getMatchTableItems(match, division));
      return makeHomeMatches(matchItems, teamId);
    }),
  );

  return matchesPerDivision.flatMap((match) => match);
};
