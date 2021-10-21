import { PlayerInfo } from '../model';
import { component } from '../util/component';
import { sendMessage, MessageNames } from '../util/messages';
import { notNull } from '../util/index';
import '../components/PlayerTable';

import { getMemberCards, getSteamId64 } from './selectors';

const injectMemberTable = (playerInfos: Array<PlayerInfo | null>): void => {
  const header = document.querySelector('.content-portrait-head');
  const playerTable = component('flashkill-player-table', { playerItems: playerInfos.filter(notNull) });
  header?.parentNode?.appendChild(playerTable);
};

export const addPlayerTable = (): void => {
  const memberCards = getMemberCards();

  const steamIds64 = memberCards.map((memberCard) => getSteamId64(memberCard)).filter(notNull);

  sendMessage(
    MessageNames.GetPlayerInfos,
    { steamIds64 },
    (playerInfos: Array<PlayerInfo | null>) => {
      injectMemberTable(playerInfos);
    },
  );
};
