import { getMatchId } from '../../util/getMatchId';

export const getMatchTabId = (): number | null => {
  const url = window.location.href;
  return getMatchId(url);
};
