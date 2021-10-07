import { fetchCached, cacheForOneDay, htmlExtractor } from '../../util/background/fetchCached';
import { PlayerInfo, FaceitInfo } from '../../model';
import { getSteamLink } from '../../util/getSteamLink';
import { ID } from '@node-steam/id';

const STEAM_NAME_XPATH_EXPRESSION = '//head/title';
const STEAM_PROFILE_PAGE_TITLE_PREFIX = 'Steam Community :: ';

export enum MemberRequestTypes {
  QueryPlayerInfos = 'queryPlayerInfos',
  // QuerySteamLink = "querySteamLink",
}

export interface PlayerInfoRequest {
  contentScriptQuery: typeof MemberRequestTypes.QueryPlayerInfos;
  steamIds: string[];
}

// export interface SteamLinkRequest {
//     contentScriptQuery: typeof MemberRequestTypes.QuerySteamLink;
//     steamId: string;
// }

type MemberRequest = PlayerInfoRequest;// | SteamLinkRequest;

chrome.runtime.onMessage.addListener(
  function (request: MemberRequest, _, sendResponse): boolean {
    switch (request.contentScriptQuery) {
      case MemberRequestTypes.QueryPlayerInfos: {
        getPlayerInfo(request.steamIds).then(playerInfos => {
          sendResponse(playerInfos);
        }).catch(console.log);
        return true;  // Will respond asynchronously.
      }

      // case MemberRequestTypes.QuerySteamLink: {
      //     sendResponse(getSteamLink(request.steamId));
      //     return true;
      // }

      default:
        return false;
    }
  }
);

const getPlayerInfo = async (stringSteamIds: string[]): Promise<Array<PlayerInfo | null>> => {
  return Promise.all(stringSteamIds.map(async stringSteamId => {
    const steamId = new ID(stringSteamId);
    const faceitInfo = await findOnFaceit(steamId);
    const steamName = await getSteamName(steamId);
    return {
      steamId: stringSteamId,
      steamId64: steamId.get64(),
      faceitInfo,
      steamName
    };
  }));
};

const faceitExtractor = (faceitResponse: Response): Promise<FaceitInfo | null> => {
  if (faceitResponse.ok) {
    return faceitResponse.json();
  } else {
    return Promise.resolve(null);
  }
};

const findOnFaceit = async (steamId: ID): Promise<FaceitInfo | null> => {
  console.log(steamId);
  const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId.get64()}`;
  return fetchCached<FaceitInfo | null>(url, cacheForOneDay, faceitExtractor, {
    headers: {
      'Authorization': ' Bearer def684c3-589e-415f-a35f-ec6f1aef79cb'
    }
  });
};

const getSteamName = async (steamId: ID): Promise<string | null> => {
  const profileLink = getSteamLink(steamId.get64());
  const html = await fetchCached<string>(profileLink, cacheForOneDay, htmlExtractor);
  const profileDoc = new DOMParser().parseFromString(html, 'text/html');
  const nameElements = profileDoc.evaluate(STEAM_NAME_XPATH_EXPRESSION, profileDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  const pageTitle = nameElements.snapshotItem(0)?.textContent;
  return pageTitle?.substring(
    pageTitle?.lastIndexOf(STEAM_PROFILE_PAGE_TITLE_PREFIX) + STEAM_PROFILE_PAGE_TITLE_PREFIX.length,
  ) ?? null;
};
