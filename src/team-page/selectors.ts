import { ID } from '@node-steam/id';

import { Division, Team } from '../model';

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

const getTeamIdFromUrl = (url: string): number | null => {
  const teamIdRegex = /\/teams\/([0-9]+)-/;
  const teamId = url.match(teamIdRegex)?.[1] || null;
  return teamId !== null ? Number.parseInt(teamId, 10) : null;
};

export const getTabTeamId = (): number | null => {
  const url = window.location.href;
  console.log(url);
  return getTeamIdFromUrl(url);
};

const getTeamShortNameFromUrl = (url: string): string | null => {
  const teamUrlNameRegex = /\/teams\/[0-9]+-(.+)/;
  return url.match(teamUrlNameRegex)?.[1] || null;
};

export const getTabTeamShortName = (): string | null => {
  const url = window.location.href;
  return getTeamShortNameFromUrl(url);
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

export const getTeam = (matchDoc: HTMLDocument, teamNumber: number): Team => {
  const teamHeader = matchDoc.querySelector(`.content-match-head-team${teamNumber} > .content-match-head-team-top`);
  const url = teamHeader.querySelector('a').href;
  const name = teamHeader.querySelector('img').getAttribute('alt');

  return {
    id: getTeamIdFromUrl(url),
    name,
    shortName: getTeamShortNameFromUrl(url),
  };
};
