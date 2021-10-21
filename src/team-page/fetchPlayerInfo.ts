import { PlayerInfo } from '../model';
import { cacheForOneDay, fetchCached, htmlExtractor } from '../util/fetchCached';
import { getSteamLink } from '../util/getLink';
import { fetchFaceitInfo } from './fetchFaceitInfo';

const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

const fetchSteamName = async (steamId64: string): Promise<string | null> => {
  const profileLink = getSteamLink(steamId64);
  const html = await fetchCached<string>(profileLink, cacheForOneDay, htmlExtractor);
  const profileDoc = new DOMParser().parseFromString(html, 'text/html');
  const pageTitle = profileDoc.querySelector('head title')?.textContent;
  return pageTitle?.substring(
    pageTitle?.lastIndexOf(STEAM_PROFILE_PAGE_TITLE_PREFIX) + STEAM_PROFILE_PAGE_TITLE_PREFIX.length,
  ) ?? null;
};

export const fetchPlayerInfo = async (steamId64: string): Promise<PlayerInfo | null> => {
  const faceitInfo = await fetchFaceitInfo(steamId64);
  const steamName = await fetchSteamName(steamId64);
  return {
    steamId64,
    faceitInfo,
    steamName,
  };
};
