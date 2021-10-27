import { component } from '../../util/component';
import { sendMessage, MessageName } from '../../util/messages';
import { notNull } from '../../util/index';
import { PlayerTableItem } from '../../components/PlayerTable';
import '../../components/PlayerTable';

import { getMemberCards, getPlayer } from './selectors';

const injectMemberTable = (playerItems: PlayerTableItem[]): void => {
  const remainingSubstitutions = document.querySelector(
    '.league-team-members .section-content .txt-content',
  )?.textContent;
  const header = document.querySelector('.content-portrait-head');
  const playerTable = component(
    'flashkill-player-table',
    {
      playerItems,
      ...remainingSubstitutions && { remainingSubstitutions },
    },
  );
  header?.parentNode?.appendChild(playerTable);
};

export const addPlayerTable = (): void => {
  const memberCards = getMemberCards();

  const players = memberCards.map((memberCard) => getPlayer(memberCard)).filter(notNull);

  sendMessage(
    MessageName.GetPlayerInfos,
    { players },
    injectMemberTable,
  );
};
