import { notNull } from '../../util';
import { FaceitInfo } from '../../model';
import { component } from '../../util/component';
import { MessageName, sendMessage } from '../../util/messages';
import { avgFaceitElo } from '../../util/avgFaceitElo';
import '../../components/TeamEloHeader';
import { flashkillTeamEloHeader } from '../../components/TeamEloHeader';

import { getMemberCards, getSteamId64 } from './selectors';

const injectAvgFaceitElo = (faceitInfos: Array<FaceitInfo | null>): void => {
  const avgElo = avgFaceitElo(faceitInfos);
  const teamHeader = document.querySelector('.content-portrait-head');
  const teamEloHeader = component(flashkillTeamEloHeader, { avgElo });
  teamHeader?.parentNode?.appendChild(teamEloHeader);
};

export const addAverageFaceitElo = (): void => {
  const steamIds64 = getMemberCards()
    .map(getSteamId64)
    .filter(notNull);

  sendMessage(
    MessageName.GetFaceitInfos,
    { steamIds64 },
    (faceitInfos: Array<FaceitInfo | null>) => {
      injectAvgFaceitElo(faceitInfos);
    },
  );
};
