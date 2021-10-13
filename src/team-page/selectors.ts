import { ID } from '@node-steam/id';

import { Division } from '../model/Division';

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

export const getMatchId = (matchLink: string): number | null => {
  const matchIdRegex = /leagues\/matches\/([0-9]+)-/;
  const matchId = matchLink.match(matchIdRegex)?.[1] || null;
  return matchId !== null ? Number.parseInt(matchId, 10) : null;
};

export const getTeamId = (): number | null => {
  const teamIdRegex = /leagues\/teams\/([0-9]+)-/;
  const teamId = window.location.href.match(teamIdRegex)?.[1] || null;
  return teamId !== null ? Number.parseInt(teamId, 10) : null;
};

export const getTeamUrlName = (): string | null => {
  const teamUrlNameRegex = /leagues\/teams\/[0-9]+-(.+)/;
  return window.location.href.match(teamUrlNameRegex)?.[1] || null;
};

const extractDivision = (linkElement: HTMLLinkElement | null): Division | null => {
  const name = linkElement?.textContent;
  const url = linkElement?.getAttribute('href');

  if (!name || !url) return null;

  return { name, url };
};

export const getCurrentDivision = (): Division | null => {
  const linkElement = document.querySelector<HTMLLinkElement>(
    'section.league-team-stage ul.content-icon-info li .txt-content a',
  );
  return extractDivision(linkElement);
};

export const getPreviousDivisions = (): Array<Division | null> => {
  const linkElements = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'section.league-team-seasons > .section-content .section-item > table a',
    ),
  );
  return linkElements.map(extractDivision);
};
