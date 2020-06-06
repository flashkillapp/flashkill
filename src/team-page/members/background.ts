
import { fetchCached, cacheForOneDay } from "../../util/background/fetchCached";
import UINT64 from "../../../dist/thirdParty/uint64.js";

const STEAM_NAME_XPATH_EXPRESSION = "//head/title";
const STEAM_PROFILE_PAGE_TITLE_PREFIX = "Steam Community :: ";

export enum MemberRequestTypes {
    QueryPlayerInfos = "queryPlayerInfos",
    QuerySteamLink = "querySteamLink",
}

export interface PlayerInfoRequest {
    contentScriptQuery: typeof MemberRequestTypes.QueryPlayerInfos;
    steamIds: string[];
}

export interface SteamLinkRequest {
    contentScriptQuery: typeof MemberRequestTypes.QuerySteamLink;
    steamId: string;
}

type MemberRequest = PlayerInfoRequest | SteamLinkRequest;

chrome.runtime.onMessage.addListener(
    function (request: MemberRequest, sender, sendResponse) : boolean {
        switch (request.contentScriptQuery) {
            case MemberRequestTypes.QueryPlayerInfos: {
                getPlayerInfo(request.steamIds).then(playerInfos => {
                    sendResponse(playerInfos);
                }).catch(console.log);
                return true;  // Will respond asynchronously.
            }

            case MemberRequestTypes.QuerySteamLink: {
                sendResponse(getSteamLink(getSteamId64(request.steamId)));
                return true;
            }

            default:
                return false;
        }
    }
);

async function getPlayerInfo(steamIds: string[]) : Promise<PlayerInfo[]> {
    return Promise.all(steamIds.map(async steamId => {
        const steamId64 = getSteamId64(steamId);
        const faceitInfo = await findOnFaceit(steamId64);
        const steamName = await getSteamName(steamId64);
        return {
            steamId,
            steamId64,
            faceitInfo,
            steamName
        } as PlayerInfo;
    }));
}

interface FaceitGames {
    csgo: FaceitGame;
}

interface FaceitGame {
    skill_level: number;
    faceit_elo: number;
}

export interface FaceitInfo {
    nickname: string;
    games: FaceitGames;
}

export interface PlayerInfo {
    steamId: string;
    steamId64: string;
    faceitInfo: FaceitInfo;
    steamName: string;
}

function faceitExtractor(faceitResponse: Response) : Promise<FaceitInfo> {
    if (faceitResponse.ok) {
        return faceitResponse.json();
    } else {
        return null;
    }
}

async function findOnFaceit(steamId64: string) : Promise<FaceitInfo> {
    const url = `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId64}`;
    return fetchCached<FaceitInfo>(url, cacheForOneDay, faceitExtractor, {
        headers: {
            "Authorization": " Bearer def684c3-589e-415f-a35f-ec6f1aef79cb"
        }
    });
}

async function getSteamName(steamId64: string) : Promise<string> {
    const profileLink = getSteamLink(steamId64);
    const html = await fetchCached<string>(profileLink, cacheForOneDay);
    var profileDoc = new DOMParser().parseFromString(html, "text/html");
    var nameElements = profileDoc.evaluate(STEAM_NAME_XPATH_EXPRESSION, profileDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const pageTitle = nameElements.snapshotItem(0).textContent;
    return pageTitle.substring(pageTitle.lastIndexOf(STEAM_PROFILE_PAGE_TITLE_PREFIX) + STEAM_PROFILE_PAGE_TITLE_PREFIX.length);
}

function getSteamId64(steamId: string) : string {
    const matches = steamId.match("steam_([0-5]):([0-1]):([0-9]+)");
    if (matches == null) {
        return "";
    }
    const universe = parseInt(matches[1], 10) || 1; // If it's 0, turn it into 1 for public
    const type = 1;
    const instance = 1;
    const accountId = (parseInt(matches[3], 10) * 2) + parseInt(matches[2], 10);
    return new UINT64(accountId, (universe << 24) | (type << 20) | (instance)).toString(10);
}

export function getSteamLink(steamId64: string) : string {
    return `https://steamcommunity.com/profiles/${steamId64}`;
}
