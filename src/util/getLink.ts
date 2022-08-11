export const baseURL99 = 'https://liga.esl-meisterschaft.de';

export const getSteamLink = (steamId64: string): string => (
  `https://steamcommunity.com/profiles/${steamId64}`
);

export const get99MatchLink = (matchId: number): string => (
  `${baseURL99}/leagues/matches/${matchId}`
);

export const get99TeamLink = (teamId: number): string => (
  `${baseURL99}/leagues/teams/${teamId}`
);

export const get99PlayerLink = (playerId: number): string => (
  `${baseURL99}/users/${playerId}`
);

export const getSteamLogoLink = (): string => (
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/28px-Steam_icon_logo.svg.png'
);

export const getFaceitLevelLogoLink = (faceitLevel: number): string => (
  `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`
);

export const getFaceitLink = (name: string): string => (
  `https://www.faceit.com/en/players/${name}`
);
