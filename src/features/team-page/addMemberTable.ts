import { component } from '../../util/component';
import { sendMessage, MessageName } from '../../util/messages';
import { notNull } from '../../util/index';
import { flashkillMemberTable, MemberTableItem } from '../../components/MemberTable';
import '../../components/MemberTable';

import { getMemberCards, getPlayer } from './selectors';

const injectMemberTable = (memberItems: MemberTableItem[]): void => {
  const remainingSubstitutions = document.querySelector(
    '.league-team-members .section-content .txt-content',
  )?.textContent;
  const header = document.querySelector('.content-portrait-head');
  const playerTable = component(
    flashkillMemberTable,
    {
      memberItems,
      ...remainingSubstitutions && { remainingSubstitutions },
    },
  );
  header?.parentNode?.appendChild(playerTable);
};

export const addMemberTable = (): void => {
  const memberCards = getMemberCards();

  const players = memberCards.map((memberCard) => getPlayer(memberCard)).filter(notNull);

  sendMessage(
    MessageName.GetPlayerInfos,
    { players },
    injectMemberTable,
  );
};
