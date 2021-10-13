import { TeamPageRequestTypes } from './background';
import {
  getTeamId, getTeamUrlName, getCurrentDivision, getPreviousDivisions,
} from './selectors';
import { notNull } from '../util/notNull';
import '../components/MatchesTable';
import { component } from '../util/component';
import { DivisionMatches } from '../model';

const printMatchDetails = (divisionMatches: DivisionMatches[]): void => {
  const header = document.querySelector('.content-portrait-head');
  const matchesTable = component('flashkill-matches-table', {
    matchItems: divisionMatches.flatMap(({ division, matches }) => (
      matches.flatMap((match, index) => {
        if (match.scores[index] === undefined) {
          return {
            division,
            ...match,
          };
        }

        return match.scores.map((score) => ({
          match_id: match.match_id,
          time: match.time,
          division,
          score_1: score.score_1,
          score_2: score.score_2,
        }));
      })
    )),
  });
  header?.parentNode?.appendChild(matchesTable);
};

export const addMatchTable = (): void => {
  const teamId = getTeamId();
  const teamUrlName = getTeamUrlName();

  if (teamId === null || teamUrlName === null) {
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
      teamUrlName,
    },
    printMatchDetails,
  );
};
