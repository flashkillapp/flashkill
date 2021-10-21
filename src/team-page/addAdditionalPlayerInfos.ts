import { PlayerInfo } from '../model';
import { component } from '../util/component';
import '../components/AdditionalPlayerInfo';

import { getMemberCards, getSteamId64 } from './selectors';
import { sendMessage, MessageNames } from '../util/messages';

const injectAdditionalPlayerInfo = (playerInfo: PlayerInfo, memberCard: HTMLLIElement): void => {
  const additionalPlayerInfo = component('flashkill-additional-player-info', { ...playerInfo });
  memberCard.appendChild(additionalPlayerInfo);
};

export const addAdditionalPlayerInfos = (): void => {
  const memberCards = getMemberCards();

  memberCards.forEach((memberCard) => {
    const steamId64 = getSteamId64(memberCard);

    if (steamId64 === null) return;

    sendMessage(
      MessageNames.GetPlayerInfo,
      { steamId64 },
      (playerInfo: PlayerInfo | null) => {
        if (playerInfo === null) return;
        injectAdditionalPlayerInfo(playerInfo, memberCard);
      },
    );
  });
};
