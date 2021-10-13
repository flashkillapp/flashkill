export const getSteamLink = (steamId64: string): string => (
  `https://steamcommunity.com/profiles/${steamId64}`
);

export const get99DamageMatchLink = (matchId: number): string => (
  `https://liga.99damage.de/leagues/matches/${matchId}`
);
