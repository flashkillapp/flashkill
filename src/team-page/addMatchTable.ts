import { sendMessage, MessageNames } from '../util/communication';
import {
  getTabTeamId, getTabTeamShortName, getCurrentDivision, getPreviousDivisions, getSeason,
} from './selectors';
import { notNull } from '../util/notNull';
import '../components/MatchesTable';
import { component } from '../util/component';
import { Division, DivisionMatches } from '../model';

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
    if (matchItem.team_1?.id === teamId) return matchItem;

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
    .filter(({ name }) => !name.includes('Relegation'))
    .sort((a: Division, b: Division) => {
      const seasonA = getSeason(a.url);
      const seasonB = getSeason(b.url);

      console.log(seasonA, seasonB);

      if (seasonA === null || seasonB === null) return 0;
      
      return seasonB.order - seasonA.order;
    })
    .slice(0, 3);

  sendMessage(
    MessageNames.QueryDivisionsMatches,
    { divisions, teamShortName },
    (divisionMatches: DivisionMatches[]) => printMatchDetails(divisionMatches, teamId),
  );
};
