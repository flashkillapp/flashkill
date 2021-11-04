import { Player } from '../../model';
import { PlayerTableItem } from '../../components/PlayerTable';

import { fetchFaceitInfo } from './fetchFaceitInfo';

export const fetchPlayerInfo = async (player: Player): Promise<PlayerTableItem> => {
  if (!player.steamId64) {
    return Promise.resolve({
      player,
    });
  }

  const faceitInfo = await fetchFaceitInfo(player.steamId64);

  return {
    player,
    ...faceitInfo && { faceitInfo },
  };
};
