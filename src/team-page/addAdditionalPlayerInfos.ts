import { PlayerInfo } from '../model';
import { component } from '../util/component';
import { isNull } from '../util';
import '../components/AdditionalPlayerInfo';

import { getMemberCards, getSteamId64 } from './selectors';
import { TeamPageRequestTypes } from './background';

const injectAdditionalPlayerInfo = (playerInfo: PlayerInfo, memberCard: HTMLLIElement): void => {
  const additionalPlayerInfo = component('flashkill-additional-player-info', { playerInfo });
  memberCard.appendChild(additionalPlayerInfo);
};

export const addAdditionalPlayerInfos = (): void => {
  const memberCards = getMemberCards();

  memberCards.forEach((memberCard) => {
    const steamId64 = getSteamId64(memberCard);

    if (isNull(steamId64)) return;

    chrome.runtime.sendMessage(
      {
        contentScriptQuery: TeamPageRequestTypes.QueryPlayerInfo,
        steamId64,
      },
      (playerInfo: PlayerInfo) => {
        injectAdditionalPlayerInfo(playerInfo, memberCard);
      },
    );
  });
};
