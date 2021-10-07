import { MemberRequestTypes } from './background';
import { PlayerInfo } from '../../model';
import { component } from '../../util/component';
import { notNull } from '../../util/notNull';
import './AdditionalPlayerInfo';
import './TeamEloHeader';

const arrayAvg = (arr: number[]): number => (
  arr.reduce((p, c) => p + c, 0) / arr.length
);

const avgFaceitElo = (playerInfos: PlayerInfo[]): number => {
  const faceitInfos = playerInfos.map(({ faceitInfo }) => faceitInfo).filter(notNull);
  return arrayAvg(
    faceitInfos.map(({ games }) => games.csgo.faceit_elo)
  );
};

const injectAvgFaceitElo = (playerInfos: PlayerInfo[]): void => {
  const avgElo = avgFaceitElo(playerInfos);
  const teamHeader = document.getElementsByClassName('content-portrait-head')[0];
  const teamEloHeader = component('flashkill-team-elo-header', { avgElo });
  teamHeader.parentNode?.appendChild(teamEloHeader);
};

interface PlayerInfoWrapper {
  playerInfo: PlayerInfo;
  sourceElement: HTMLLIElement;
}

const injectAdditionalPlayerInfos = (playerInfos: PlayerInfoWrapper[]): void => {
  playerInfos.forEach(({ playerInfo, sourceElement }) => {
    if (playerInfo !== null) {
      const additionalPlayerInfo = component(
        'flashkill-additional-player-info',
        {
          steamId64: playerInfo.steamId64,
          steamName: playerInfo.steamName,
          faceitInfo: playerInfo.faceitInfo,
        },
      );
      sourceElement.appendChild(additionalPlayerInfo);
    }
  });
};

const parseSteamId2 = (memberCard: HTMLLIElement): string | null => (
  memberCard.getElementsByTagName('span')[0]?.textContent?.toUpperCase() ?? null
);

export const improveTeamPage = (): void => {
  const memberCards = document.getElementsByClassName('content-portrait-grid-l')[0].getElementsByTagName('li');

  const memberCardsBySteamId2: { [key in string]: HTMLLIElement } = Array.from(memberCards)
    .reduce((acc, memberCard) => {
      const steamId2String = parseSteamId2(memberCard);

      if (steamId2String === null) return acc;

      return {
        ...acc,
        [steamId2String]: memberCard,
      };
    }, {});

  chrome.runtime.sendMessage(
    {
      contentScriptQuery: MemberRequestTypes.QueryPlayerInfos,
      steamIds: Object.keys(memberCardsBySteamId2)
    },
    (playerInfos: PlayerInfo[]) => {
      const playerInfoWrappers = playerInfos.map((playerInfo) => ({
        playerInfo,
        sourceElement: memberCardsBySteamId2[playerInfo.steamId],
      }));
      injectAdditionalPlayerInfos(playerInfoWrappers);
      injectAvgFaceitElo(playerInfos);
    }
  );
};