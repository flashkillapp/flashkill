import { AjaxMatch } from '../model';
import { cacheForOneDay, fetchCached } from './fetchCached';

const ajaxMatchExtractor = (ajaxMatchResponse: Response): Promise<AjaxMatch | null> => {
  if (ajaxMatchResponse.ok) {
    return ajaxMatchResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

export const fetchAjaxMatch = async (matchId: number): Promise<AjaxMatch | null> => {
  const url = `https://liga.99damage.de/ajax/leagues_match?id=${matchId}&action=init`;
  return fetchCached<AjaxMatch | null>(url, cacheForOneDay, ajaxMatchExtractor);
};
