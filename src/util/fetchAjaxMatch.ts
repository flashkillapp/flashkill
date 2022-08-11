import { AjaxMatch } from '../model';
import { cacheForOneDay, fetchCached } from './fetchCached';
import { baseURL99 } from './getLink';

const ajaxMatchExtractor = (ajaxMatchResponse: Response): Promise<AjaxMatch | null> => {
  if (ajaxMatchResponse.ok) {
    return ajaxMatchResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

export const fetchAjaxMatch = async (matchId: number): Promise<AjaxMatch | null> => {
  const url = `${baseURL99}/ajax/leagues_match?id=${matchId}&action=init`;
  return fetchCached<AjaxMatch | null>(url, cacheForOneDay, ajaxMatchExtractor);
};
