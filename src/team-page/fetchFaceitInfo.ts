import { FaceitInfo } from '../model';
import { cacheForOneDay, fetchCached } from '../util/fetchCached';

const faceitExtractor = (faceitResponse: Response): Promise<FaceitInfo | null> => {
  if (faceitResponse.ok) {
    return faceitResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

export const fetchFaceitInfo = async (steamId64: string): Promise<FaceitInfo | null> => {
  const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId64}`;
  return fetchCached<FaceitInfo | null>(url, cacheForOneDay, faceitExtractor, {
    headers: {
      'Authorization': ' Bearer def684c3-589e-415f-a35f-ec6f1aef79cb',
    },
  });
};
