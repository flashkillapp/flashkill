export function getMatchId(matchLink: string): number | null {
  const matchIdRegex = /leagues\/matches\/([0-9]+)-/;
  const matchId = matchLink.match(matchIdRegex)?.[1];
  return matchId ? Number.parseInt(matchId) : null;
}
