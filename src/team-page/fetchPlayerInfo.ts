import { PlayerTableItem } from '../components/PlayerTable';
import { Player } from '../model';
import { fetchFaceitInfo } from './fetchFaceitInfo';

export const fetchPlayerInfo = async (player: Player): Promise<PlayerTableItem> => {
  const steamId64 = player.steamId64;

  if (steamId64 === null) {
    return Promise.resolve({
      player,
      faceitInfo: null,
    });
  }

  const faceitInfo = await fetchFaceitInfo(steamId64);

  return {
    player,
    faceitInfo,
  };
};
