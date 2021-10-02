import { MemberRequestTypes, getSteamLink, PlayerInfo } from "./background";

const TEAM_LOG_ROWS_XPATH_EXPRESSION = "//*[@id='container']/main/section[4]/div/div/div[2]/table/tbody/tr";

function getDateFromTeamLogEntry(dateTd: HTMLTableDataCellElement): Date {
    var dateContent = dateTd.getElementsByTagName("span")[0].getElementsByTagName("span")[0];
    var dateStringRaw = dateContent.title;
    return new Date(dateStringRaw);
}

function compareTeamLogEntries(a: MemberAction, b: MemberAction): number {
    if (a.date < b.date) {
        return -1;
    }
    if (a.date > b.date) {
        return 1;
    }
    return 0;
}

interface Membership {
    member: string;
    startDate: Date;
    endDate: Date;
}

function getMemberships(members: string[]): Membership[] {
    const memberActions = getRelevantTeamLogRows(members);
    var memberships = new Array();
    for (var i = 0; i < memberActions.length; i++) {
        if (memberActions[i].action === Action.Join) {
            const currentMember = memberActions[i].member;
            for (var j = i; j <= memberActions.length; j++) {
                if (j === memberActions.length) {
                    memberships.push({ member: currentMember, startDate: memberActions[i].date, endDate: new Date(Date.now()) } as Membership);
                    break;
                }
                if (memberActions[j].member === currentMember && memberActions[j].action === Action.Leave) {
                    memberships.push({ member: currentMember, startDate: memberActions[i].date, endDate: memberActions[j].date } as Membership);
                    break;
                }
            }
        }
    }
    return memberships;
}

enum Action {
    Leave = "leave",
    Join = "join",
}

class MemberAction {
    date: Date;
    member: string;
    action: Action;

    constructor(date: Date, member: string, action: Action) {
        this.date = date;
        this.member = member;
        this.action = action;
    }
}

function getRelevantTeamLogRows(members: string[]): MemberAction[] {
    const teamLogRowEntries = document.evaluate(TEAM_LOG_ROWS_XPATH_EXPRESSION, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var relevantLogs = new Array();
    //Filter the rows for the patterns
    //date, teamMember, member_join, ...
    //date, teamMember, member_leave, ...
    //date, ..., member_kick, teamMember
    for (var i = 0; i < teamLogRowEntries.snapshotLength; i++) {
        const log = teamLogRowEntries.snapshotItem(i) as HTMLTableRowElement;
        const logElements = log.getElementsByTagName("td");

        if (logElements.length !== 4) {
            continue;
        }

        const action = logElements[2].textContent.substring(6);

        const actingMember = logElements[1].textContent.substring(6);

        const targetMember = logElements[3].textContent.substring(4);

        const date = getDateFromTeamLogEntry(logElements[0]);

        switch (action) {

            case "create": {
                if (members.includes(actingMember)) {
                    relevantLogs.push(new MemberAction(date, actingMember, Action.Join));
                }
                break;
            }

            case "member_join": {
                if (members.includes(actingMember)) {
                    relevantLogs.push(new MemberAction(date, actingMember, Action.Join));
                }
                break;
            }

            case "member_leave": {
                if (members.includes(actingMember)) {
                    relevantLogs.push(new MemberAction(date, actingMember, Action.Leave));
                }
                break;
            }

            case "member_kick": {
                if (members.includes(targetMember)) {
                    relevantLogs.push(new MemberAction(date, targetMember, Action.Leave));
                }
                break;
            }

        }
    }

    return relevantLogs.sort(compareTeamLogEntries);
}

function insertFaceitEloMean(faceitEloMean: number): void {
    const faceitEloMeanH2 = document.createElement("h2");
    faceitEloMeanH2.textContent = "FACEIT Elo: " + Math.round(faceitEloMean);
    faceitEloMeanH2.title = "Durchschnittliche FACEIT Elo";
    const teamHeader = document.getElementsByClassName("content-portrait-head")[0];
    teamHeader.parentNode.appendChild(faceitEloMeanH2);
}

function calcFaceitEloMean(playerInfos: PlayerInfo[]): number {
    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
    return average(playerInfos.filter(playerInfo => playerInfo.faceitInfo != null).map(playerInfo => playerInfo.faceitInfo.games.csgo.faceit_elo));
}

interface MemberCardWrapper {
    memberCard: HTMLLIElement;
    steamId: string;
}

export const improveMemberCards = (): void => {
    const memberCards = document.getElementsByClassName("content-portrait-grid-l")[0].getElementsByTagName("li");
    var memberCardWrappers: MemberCardWrapper[] = [];
    for (var i = 0; i < memberCards.length; i++) {
        const memberCard = memberCards[i];
        memberCardWrappers.push({ memberCard: memberCard, steamId: getSteamId(memberCard) } as MemberCardWrapper);
    }
    const steamIds = memberCardWrappers.map(memberCard => { return memberCard.steamId });
    chrome.runtime.sendMessage(
        { contentScriptQuery: MemberRequestTypes.QueryPlayerInfos, steamIds: steamIds },
        (playerInfos: PlayerInfo[]) => {
            playerInfos.forEach(playerInfo => {
                const memberCardWrapper = memberCardWrappers.find(memberCard => memberCard.steamId == playerInfo.steamId);
                inject(playerInfo, memberCardWrapper.memberCard);
            });
            const faceitEloMean = calcFaceitEloMean(playerInfos);
            insertFaceitEloMean(faceitEloMean);
        }
    );
};

function inject(playerInfo: PlayerInfo, memberCard: HTMLLIElement): void {
    const { steamId64, steamName } = playerInfo;

    if (steamId64 != "") {
        const steamDiv = document.createElement("div");
        steamDiv.className = "txt-subtitle";
        steamDiv.innerText = "Steam: ";
        steamDiv.style.paddingTop = "5px";
        steamDiv.style.whiteSpace = "nowrap";
        steamDiv.style.overflow = "hidden";
        const steamLink = document.createElement("a");
        steamLink.href = getSteamLink(steamId64);
        steamLink.textContent = steamName;
        steamLink.target = "_blank";

        steamDiv.appendChild(steamLink);

        memberCard.appendChild(steamDiv);
    }

    if (playerInfo.faceitInfo != null) {
        const { faceitInfo: { nickname, games: { csgo: { skill_level, faceit_elo } } } } = playerInfo;

        const eloDiv = document.createElement("div");
        eloDiv.style.textAlign = "left";
        eloDiv.style.float = "left";
        eloDiv.style.paddingTop = "7px";

        const faceitTextA = document.createElement("a");
        faceitTextA.href = getFaceitLink(nickname);
        faceitTextA.target = "_blank";
        faceitTextA.textContent = faceit_elo.toString();

        eloDiv.textContent = "FACEIT: "
        eloDiv.appendChild(faceitTextA);

        const imageDiv = document.createElement("div");
        imageDiv.style.textAlign = "right";

        const faceitImg = document.createElement("img");
        faceitImg.style.width = "28px";
        faceitImg.style.height = "28px";
        faceitImg.src = getFaceitLevel(skill_level);
        faceitImg.alt = skill_level.toString();

        const faceitImageA = document.createElement("a");
        faceitImageA.href = getFaceitLink(nickname);
        faceitImageA.target = "_blank";
        faceitImageA.appendChild(faceitImg);

        imageDiv.appendChild(faceitImageA);

        const faceitDiv = document.createElement("div");
        faceitDiv.className = "txt-subtitle";
        faceitDiv.style.width = "17.5em";
        faceitDiv.appendChild(eloDiv);
        faceitDiv.appendChild(imageDiv);

        memberCard.appendChild(faceitDiv);
    }
}

function getFaceitLevel(faceitLevel: number): string {
    return `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`;
}

function getFaceitLink(name: string): string {
    return `https://www.faceit.com/en/players/${name}`;
}

function getSteamId(memberCard: HTMLLIElement): string {
    return memberCard.getElementsByTagName("span")[0].textContent;
}
