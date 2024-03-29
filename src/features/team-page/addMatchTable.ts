import { sendMessage, MessageName } from '../../util/messages';
import { notNull } from '../../util';
import { component } from '../../util/component';
import { Division } from '../../model';
import '../../components/MatchesTable';
import { flashkillMatchesTable, MatchTableItem } from '../../components/MatchesTable';

import {
  getTabTeamId,
  getTabTeamShortName,
  getCurrentDivision,
  getPreviousDivisions,
  getSeason,
} from './selectors';

const injectMatchTable = (matchItems: MatchTableItem[]): void => {
  const header = document.querySelector('.content-portrait-head');
  const matchesTable = component(flashkillMatchesTable, { matchItems });
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

      if (!seasonA || !seasonB) return 0;
      
      return seasonB.order - seasonA.order;
    })
    .slice(0, 3);

  sendMessage(
    MessageName.GetDivisionMatches,
    { divisions, teamShortName, teamId },
    injectMatchTable,
  );
};
