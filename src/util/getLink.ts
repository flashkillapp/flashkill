export const getSteamLink = (steamId64: string): string => (
  `https://steamcommunity.com/profiles/${steamId64}`
);

export const get99MatchLink = (matchId: number): string => (
  `https://liga.99damage.de/leagues/matches/${matchId}`
);

export const get99TeamLink = (teamId: number): string => (
  `https://liga.99damage.de/leagues/teams/${teamId}`
);

export const get99PlayerLink = (playerId: number): string => (
  `https://liga.99damage.de/users/${playerId}`
);
