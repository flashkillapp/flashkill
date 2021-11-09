import '../../components/LineupTables';
import { flashkillLineupTables, LineupTableItem } from '../../components/LineupTables';
import { component } from '../../util/component';
import { MessageName, sendMessage } from '../../util/messages';
import { getMatchTabId } from './selectors';

function injectTables(lineups: LineupTableItem[][] | null): void {
  if (lineups?.length !== 2) return;

  const lineupTable = component(
    flashkillLineupTables,
    { lineupItems1: lineups[0], lineupItems2: lineups[1] },
  );

  const matchHeader = document.querySelector('.content-league-match-head');

  matchHeader?.parentNode?.appendChild(lineupTable);
}

export function addLineupTables(): void {
  const matchId = getMatchTabId();

  if (!matchId) return;

  sendMessage(
    MessageName.GetMatchLineups,
    { matchId },
    injectTables,
  );
}
