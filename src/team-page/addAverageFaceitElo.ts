import { notNull } from '../util/notNull';
import { FaceitInfo } from '../model';
import { component } from '../util/component';
import '../components/TeamEloHeader';
import { MessageNames, sendMessage } from '../util/messages';

import { getMemberCards, getSteamId64 } from './selectors';

const arrayAvg = (arr: number[]): number => (
  arr.reduce((p, c) => p + c, 0) / arr.length
);

const avgFaceitElo = (faceitInfos: Array<FaceitInfo | null>): number => {
  return arrayAvg(
    faceitInfos
      .filter(notNull)
      .map(({ games }) => games.csgo.faceit_elo),
  );
};

const injectAvgFaceitElo = (faceitInfos: Array<FaceitInfo | null>): void => {
  const avgElo = avgFaceitElo(faceitInfos);
  const teamHeader = document.querySelector('.content-portrait-head');
  const teamEloHeader = component('flashkill-team-elo-header', { avgElo });
  teamHeader?.parentNode?.appendChild(teamEloHeader);
};

export const addAverageFaceitElo = (): void => {
  const steamIds64 = getMemberCards()
    .map(getSteamId64)
    .filter(notNull);

  sendMessage(
    MessageNames.GetFaceitInfos,
    { steamIds64 },
    (faceitInfos: Array<FaceitInfo | null>) => {
      injectAvgFaceitElo(faceitInfos);
    },
  );
};
