import { sendMessage, MessageNames } from '../util/messages';
import { notNull } from '../util';
import '../components/MatchesTable';
import { component } from '../util/component';
import { Division } from '../model';
import { MatchTableItem } from '../components/MatchesTable';

import {
  getTabTeamId,
  getTabTeamShortName,
  getCurrentDivision,
  getPreviousDivisions,
  getSeason,
} from './selectors';

const printMatchDetails = (matchItems: MatchTableItem[]): void => {
  const header = document.querySelector('.content-portrait-head');
  const matchesTable = component('flashkill-matches-table', { matchItems });
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

      if (seasonA === null || seasonB === null) return 0;
      
      return seasonB.order - seasonA.order;
    })
    .slice(0, 3);

  sendMessage(
    MessageNames.GetDivisionMatches,
    { divisions, teamShortName, teamId },
    printMatchDetails,
  );
};
