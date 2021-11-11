import { MatchTableItem } from '../../components/MatchesTable';
import { Division, Match } from '../../model';
import { cacheForOneDay, fetchCached, htmlExtractor } from '../../util/fetchCached';
import { notNull } from '../../util';
import { fetchAjaxMatch } from '../../util/fetchAjaxMatch';
import { getMatchId } from '../../util/getMatchId';

import { getMapScores, getSeason, getTeams } from './selectors';

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
    const matchId = getMatchId(matchLink);

    const ajaxMatch = matchId
      ? await fetchAjaxMatch(matchId)
      : null;

    const matchDoc = await fetchMatchPage(matchLink);

    const [team1, team2] = getTeams(matchDoc);

    if (!ajaxMatch || !team1 || !team2) return null;

    const mapScores = getMapScores(matchDoc);

    return {
      matchId: ajaxMatch.match_id,
      time: ajaxMatch.time,
      score1: ajaxMatch.score_1,
      score2: ajaxMatch.score_2,
      team1: team1,
      team2: team2,
      scores: mapScores,
      draftMapvotingBans: ajaxMatch.draft_mapvoting_bans,
      draftMapvotingPicks: ajaxMatch.draft_mapvoting_picks,
      draftMaps: ajaxMatch.draft_maps,
      draftOpp1: ajaxMatch.draft_opp1,
      draftOpp2: ajaxMatch.draft_opp2,
    };
  }));

  return matches.filter(notNull);
};

const makeHomeMatches = (
  matchItems: MatchTableItem[], homeTeamId: number,
): MatchTableItem[] => (
  matchItems.map((matchItem) => {
    if (matchItem.team1?.id === homeTeamId) return matchItem;

    return {
      ...matchItem,
      team1: matchItem.team2,
      team2: matchItem.team1,
      score1: matchItem.score2,
      score2: matchItem.score1,
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
      ...season && { season },
    }];
  }

  return match.scores.map((score, index) => ({
    ...match,
    division,
    score1: score.score1,
    score2: score.score2,
    ...season && { season },
    map: match.draftMaps.find(
      (draftMap) => draftMap.id === match.draftMapvotingPicks[index],
    ),
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
