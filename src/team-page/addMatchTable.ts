import { TeamPageRequestTypes } from './background';
import {
  getTabTeamId, getTabTeamShortName, getCurrentDivision, getPreviousDivisions,
} from './selectors';
import { notNull } from '../util/notNull';
import '../components/MatchesTable';
import { component } from '../util/component';
import { DivisionMatches, Season } from '../model';

const getSeason = (divisionUrl: string): Season | null => {
  const seasonRegex = /99dmg\/([0-9]+)-.*?([0-9]+)\/group/;
  const regexResult = divisionUrl.match(seasonRegex);
  const idString = regexResult?.[1] ?? null;
  const seasonNumber = regexResult?.[2] ?? null;

  if (idString === null || seasonNumber === null) return null;

  return { id: Number.parseInt(idString, 10), name: `Saison ${seasonNumber}` };
};

const printMatchDetails = (divisionMatches: DivisionMatches[], teamId: number): void => {
  const header = document.querySelector('.content-portrait-head');
  const matchItems = divisionMatches.flatMap(({ division, matches }) => {
    const season = getSeason(division.url);

    return matches.flatMap((match) => {
      if (match.scores.length === 0) {
        return {
          ...match,
          division,
          season,
          map: null,
        };
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
    });
  });
  const switchedMatchItems = matchItems.map((matchItem) => {
    if (matchItem.team_1.id === teamId) return matchItem;

    return {
      ...matchItem,
      team_1: matchItem.team_2,
      team_2: matchItem.team_1,
      score_1: matchItem.score_2,
      score_2: matchItem.score_1,
    };
  });
  const matchesTable = component('flashkill-matches-table', { matchItems: switchedMatchItems });
  header?.parentNode?.appendChild(matchesTable);
};

export const addMatchTable = (): void => {
  const teamId = getTabTeamId();
  const teamShortName = getTabTeamShortName();

  if (teamId === null || teamShortName === null) {
    console.log('Could not read team id or name');
    return;
  }

  const divisions = [
    getCurrentDivision(),
    ...getPreviousDivisions(),
  ]
    .filter(notNull)
    .filter(({ name }) => !name.includes('Relegation'));

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: TeamPageRequestTypes.QueryDivisionsMatches,
      divisions,
      teamShortName,
    },
    (divisionMatches: DivisionMatches[]) => printMatchDetails(divisionMatches, teamId),
  );
};
