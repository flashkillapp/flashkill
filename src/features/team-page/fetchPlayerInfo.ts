import { Player } from '../../model';
import { MemberTableItem } from '../../components/MemberTable';

import { fetchFaceitInfo } from './fetchFaceitInfo';

export const fetchPlayerInfo = async (player: Player): Promise<MemberTableItem> => {
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
