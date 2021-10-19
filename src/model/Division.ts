import { Match } from '.';

export interface Division {
  id: number;
  name: string;
  url: string;
}

export interface DivisionMatches {
  division: Division;
  matches: Match[];
}
