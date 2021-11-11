interface FaceitLevel {
  level: number;
  lower: number;
  upper?: number;
  color: string;
}

const faceitLevels: FaceitLevel[] = [
  { level: 1, lower: 1, upper: 800, color: '#EEE' },
  { level: 2, lower: 801, upper: 950, color: '#1CE400' },
  { level: 3, lower: 951, upper: 1100, color: '#1CE400' },
  { level: 4, lower: 1101, upper: 1250, color: '#FFC800' },
  { level: 5, lower: 1251, upper: 1400, color: '#FFC800' },
  { level: 6, lower: 1401, upper: 1550, color: '#FFC800' },
  { level: 7, lower: 1551, upper: 1700, color: '#FFC800' },
  { level: 8, lower: 1701, upper: 1850, color: '#FF6309' },
  { level: 9, lower: 1851, upper: 2000, color: '#FF6309' },
  { level: 10, lower: 2001, color: '#FE1F00' },
];

export function getFaceitLevel(elo: number): FaceitLevel | undefined {
  return faceitLevels.find(({ lower, upper }) => (
    lower <= elo && (upper === undefined || upper >= elo)
  ));
}
