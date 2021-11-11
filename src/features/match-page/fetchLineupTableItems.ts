import { ID } from '@node-steam/id';

import { LineupTableItem } from '../../components/LineupTables';
import { AjaxLineup, AjaxPlayer } from '../../model';
import { fetchAjaxMatch } from '../../util/fetchAjaxMatch';
import { fetchFaceitInfo } from '../team-page/fetchFaceitInfo';

async function extractPlayer(ajaxPlayer: AjaxPlayer): Promise<LineupTableItem> {
  const steamId64 = new ID(ajaxPlayer.gameaccounts[0].toUpperCase()).get64();
  const faceitInfo = await fetchFaceitInfo(steamId64);

  return {
    player: {
      id: ajaxPlayer.id,
      name: ajaxPlayer.name,
      steamId64,
    },
    ...faceitInfo && { faceitInfo },
  };
}

async function extractLineup(ajaxLineup: AjaxLineup): Promise<LineupTableItem[]> {
  return Promise.all(ajaxLineup.map(extractPlayer));
}

export async function fetchLineupTableItems(matchId: number): Promise<LineupTableItem[][] | null> {
  const ajaxMatch = await fetchAjaxMatch(matchId);

  if (!ajaxMatch) return Promise.resolve(null);

  const lineups =  Object.values(ajaxMatch.lineups);

  return Promise.all(lineups.map(extractLineup));
}
