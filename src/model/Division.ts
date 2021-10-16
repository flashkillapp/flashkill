import { Match } from '.';

export interface Division {
  name: string;
  url: string;
}

export interface DivisionMatches {
  division: Division;
  matches: Match[];
}
