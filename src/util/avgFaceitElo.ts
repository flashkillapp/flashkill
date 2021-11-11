import { notNull, notUndefined } from '.';
import { FaceitInfo } from '../model';

const average = (arr: number[]): number => (
  arr.reduce((p, c) => p + c, 0) / arr.length
);

export function avgFaceitElo(faceitInfos: Array<FaceitInfo | null | undefined>): number {
  return average(
    faceitInfos
      .filter(notNull)
      .filter(notUndefined)
      .map(({ games }) => games.csgo.faceit_elo),
  );
}
