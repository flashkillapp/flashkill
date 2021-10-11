import { PlayerInfo } from '../model';
import { component } from '../util/component';

import './AdditionalPlayerInfo';
import { getMemberCards, getSteamId64 } from './selectors';
import { TeamPageRequestTypes } from './background';

const injectAdditionalPlayerInfo = (playerInfo: PlayerInfo, memberCard: HTMLLIElement): void => {
  const additionalPlayerInfo = component( 'flashkill-additional-player-info', { ...playerInfo });
  memberCard.appendChild(additionalPlayerInfo);
};

export const addAdditionalPlayerInfos = (): void => {
  const memberCards = getMemberCards();

  memberCards.forEach((memberCard) => {
    const steamId64 = getSteamId64(memberCard);

    if (steamId64 === null) return;

    chrome.runtime.sendMessage(
      {
        contentScriptQuery: TeamPageRequestTypes.QueryPlayerInfo,
        steamId64,
      },
      (playerInfo: PlayerInfo | null) => {
        if (playerInfo === null) return;
        injectAdditionalPlayerInfo(playerInfo, memberCard);
      },
    );
  });
};
