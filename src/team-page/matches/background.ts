import { fetchCached, cacheOnlyPastMatches } from "../../util/background/fetchCached";
import { ApiMatch } from "../seasons/content";

const MAP_VOTE_XPATH_EXPRESSION = "//td/span[text()='mapvote_ended']/../following-sibling::td/span/text()";
const MAP_VOTE_REGEX = /(T[12]+) (bans|picks) (de_[a-z2]+)/g;

interface MapVote {
    teamId: string;
    pick: string;
    firstBan: string;
    secondBan: string;
    didTwoBansFirst: boolean;
    didFirstBan: boolean;
}

interface MatchMapVotes {
    match: ApiMatch;
    mapVoteTeam1: MapVote;
    mapVoteTeam2: MapVote;
}

export async function getMatchMapVotes(matches: ApiMatch[]): Promise<MatchMapVotes[]> {
    return Promise.all(matches.map(async (match) => {
        const matchLink = `https://liga.99damage.de/de/leagues/matches/${match.id}`;
        const htmlContent = await fetchCached(matchLink, cacheOnlyPastMatches);
        const htmlDocument = new DOMParser().parseFromString(htmlContent, "text/html");
        return getMapVotesForMatch(match, htmlDocument);
    }));
}

function getMapVotesForMatch(match: ApiMatch, matchDoc: HTMLDocument) : MatchMapVotes {
    const mapVoteLogEntry = matchDoc.evaluate(MAP_VOTE_XPATH_EXPRESSION, matchDoc, null, XPathResult.STRING_TYPE, null);
    if (mapVoteLogEntry == null) {
        return null;
    }
    const mapVotesFromLogs = Array.from(mapVoteLogEntry.stringValue.matchAll(MAP_VOTE_REGEX));
    const teamOneDidTwoBansFirst = didTeamOneDoTwoBansFirst(mapVotesFromLogs);
    const teamOneDidFirstBan = didTeamOneDoFirstBan(mapVotesFromLogs);
    return {
        match,
        mapVoteTeam1: buildMapVote(getTeamId(1, matchDoc), mapVotesFromLogs, "T1", teamOneDidTwoBansFirst, teamOneDidFirstBan),
        mapVoteTeam2: buildMapVote(getTeamId(2, matchDoc), mapVotesFromLogs, "T2", !teamOneDidTwoBansFirst, !teamOneDidFirstBan)
    }
}

function didTeamOneDoFirstBan(mapVotesFromLogs) : boolean {
    return teamOneDidNBansFirst(mapVotesFromLogs, 1);
}

function didTeamOneDoTwoBansFirst(mapVotesFromLogs) : boolean{
    return teamOneDidNBansFirst(mapVotesFromLogs, 2);
}

function teamOneDidNBansFirst(mapVotesFromLogs, countBans: number) : boolean {
    var teamOneBanCount = 0;
    var teamTwoBanCount = 0;
    for (let i = 0; i < mapVotesFromLogs.length; i++) {
        if (mapVotesFromLogs[i][2] != "bans") {
            continue;
        }
        if (mapVotesFromLogs[i][1] == "T1") {
            teamOneBanCount++;
        }
        if (mapVotesFromLogs[i][1] == "T2") {
            teamTwoBanCount++;
        }
        if (teamOneBanCount == countBans) {
            return true;
        }
        if (teamTwoBanCount == countBans) {
            return false;
        }
    }
}

function buildMapVote(teamId: string, mapVotesFromLogs, team, didTwoBansFirst, didFirstBan) : MapVote {
    const votes = mapVotesFromLogs.filter(match => match[1] == team);
    const bans = votes.filter(match => match[2] == "bans").map(match => match[3]);
    const picks = votes.filter(match => match[2] == "picks").map(match => match[3]);
    return {
        teamId,
        pick: picks[0],
        firstBan: bans[0],
        secondBan: bans[1],
        didTwoBansFirst,
        didFirstBan
    }
}

function teamNameXPathExpression(teamNumber: number) : string {
    return `(//div[@class='content-match-head-team-titles']/a)[${teamNumber}]`;
}

function getTeamId(teamNumber: number, matchPage: HTMLDocument) : string {
    const teamLink = (<HTMLLinkElement>matchPage.evaluate(teamNameXPathExpression(teamNumber), matchPage, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0)).href;
    const teamIdWithTeamName = teamLink.split("teams/")[1];
    return teamIdWithTeamName.split("-")[0];
}
