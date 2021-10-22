import { notNull } from '../util';
import { FaceitInfo } from '../model';
import { component } from '../util/component';
import '../components/TeamEloHeader';

import { TeamPageRequestTypes } from './background';
import { getMemberCards, getSteamId64 } from './selectors';

const average = (arr: number[]): number => (
  arr.reduce((p, c) => p + c, 0) / arr.length
);

const avgFaceitElo = (faceitInfos: Array<FaceitInfo | null>): number => {
  return average(
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

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: TeamPageRequestTypes.QueryFaceitInfos,
      steamIds64,
    },
    (faceitInfos: FaceitInfo[]) => {
      injectAvgFaceitElo(faceitInfos);
    },
  );
};
