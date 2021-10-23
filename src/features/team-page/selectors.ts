import { ID } from '@node-steam/id';

export const getMemberCards = (): HTMLLIElement[] => (
  Array.from(document.querySelectorAll('.content-portrait-grid-l > li'))
);

export const getSteamId64 = (memberCard: HTMLLIElement): string | null => {
  const steamId2String = memberCard.querySelector('span')?.textContent || null;
  try {
    return new ID(steamId2String?.toUpperCase()).get64();
  } catch {
    return null;
  }
};
