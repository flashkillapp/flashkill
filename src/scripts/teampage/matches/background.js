const MATCH_LINK_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr/td[1]/a";
const MATCH_TEAM1_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr/td[2]/a";
const MATCH_TEAM2_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr/td[3]/a";
const TEAM_NAMES_XPATH_EXPRESSION = "//div[@class='match_names']/div[@class='team']/a";
const MAP_SCORES_XPATH_EXPRESSION = "//div[@id='content']/div[preceding-sibling::br]/text()[following-sibling::br]";
const MAP_VOTE_XPATH_EXPRESSION = "//*[@id='match_log']/tbody/tr/td[preceding-sibling::td[text()='mapvote_ended']]/text()";
const MAP_VOTE_REGEX = "(T[12]+) (bans|picks) (de_[a-z2]+)";
// const MATCH_DATE_XPATH_EXPRESSION = "//div[@class='match_head']/div[@class='right']/text()";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryMatches") {
            getMatches(request.linkInformation, request.teamName, request.teamShorthand).then(matches => {
                sendResponse(matches);
            }).catch(console.log);
            return true;  // Will respond asynchronously.
        }
    }
);

async function getMatches(linkInformation, teamName, teamShorthand) {
    const seasonUrl = linkInformation.seasonUrl;
    const text = await fetchCached(seasonUrl);
    const matchLinks = await parseMatches(text, teamShorthand);
    var matches = await buildMatchEntries(matchLinks, teamName, null);
    if (linkInformation.additionalUrl != null) {
        var additionalInfo = linkInformation.additionalInfo;
        if (additionalInfo.includes("Relegation")) {
            additionalInfo = "Relegation";
        } else if (additionalInfo.includes("Finals")) {
            additionalInfo = "Finals";
        }
        const additionalText = await fetchCached(linkInformation.additionalUrl);
        const additionalMatches = await parseMatches(additionalText, teamShorthand);
        const additionalMatchEntries = await buildMatchEntries(additionalMatches, teamName, additionalInfo);
        matches = matches.concat(additionalMatchEntries);
    }
    return matches;
}

function parseMatches(html, teamShorthand) {
    const seasonDoc = new DOMParser().parseFromString(html, "text/html");
    const matchLinkElements = seasonDoc.evaluate(MATCH_LINK_XPATH_EXPRESSION, seasonDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const matchTeam1Fields = seasonDoc.evaluate(MATCH_TEAM1_XPATH_EXPRESSION, seasonDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const matchTeam2Fields = seasonDoc.evaluate(MATCH_TEAM2_XPATH_EXPRESSION, seasonDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var matches = new Array();
    for (var i = 0; i < matchLinkElements.snapshotLength; i++) {
        const team1Shorthand = matchTeam1Fields.snapshotItem(i).text.trim();
        const team2ShorthandRaw = matchTeam2Fields.snapshotItem(i).text;
        const team2Shorthand = team2ShorthandRaw.substring(3, team2ShorthandRaw.length).trim();
        if (team1Shorthand == teamShorthand || team2Shorthand == teamShorthand) {
            let linkElement = matchLinkElements.snapshotItem(i);
            let link = linkElement.href;
            matches.push(link);
        }
    }
    return matches;
}

async function buildMatchEntries(matchLinks, teamName, additionalInfo) {
    const htmlContents = await Promise.all(matchLinks.map(link => fetchCached(link, cacheOnlyPastMatches)));
    var matches = new Array();

    for (var i = 0; i < htmlContents.length; i++) {
        const match = buildMatchEntry(htmlContents[i], additionalInfo);
        if (match.mapResults.length == 0) {
            continue;
        }
        match.swapToFirstTeam(teamName);
        match.mapResults.forEach(map => {
            map.setMatchLink(matchLinks[i]);
        })
        matches.push(match);
    }

    return matches;
}

function buildMatchEntry(html, additionalInfo) {
    const matchDoc = new DOMParser().parseFromString(html, "text/html");
    const teamNames = matchDoc.evaluate(TEAM_NAMES_XPATH_EXPRESSION, matchDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const mapScores = matchDoc.evaluate(MAP_SCORES_XPATH_EXPRESSION, matchDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const team1 = $.trim(teamNames.snapshotItem(0).text);
    const team2 = $.trim(teamNames.snapshotItem(1).text);
    const team1Link = teamNames.snapshotItem(0).href;
    const team2Link = teamNames.snapshotItem(1).href;
    var mapResults = new Array();
    for (var i = 0; i < mapScores.snapshotLength; i++) {
        const mapResult = mapScores.snapshotItem(i).wholeText;
        if (mapResult.match("Nicht gespielt") || mapResult.match("Noch nicht gehostet.")) {
            continue;
        }
        mapResults.push(mapScores.snapshotItem(i).wholeText.match("([a-zA-Z_0-9]+) -.*?([0-9]+):([0-9]+)"));
    }
    const matchTimeEntries = matchDoc.evaluate(MATCH_DATE_XPATH_EXPRESSION, matchDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const matchTimeAsString = matchTimeEntries.snapshotItem(0).wholeText.trim();
    const parsedDate = matchTimeAsString.match("([0-9]{2}) ([a-zA-ZäöüßÄÖÜ]{3}) ([0-9]{4})");
    var date = null;
    if (parsedDate != null && parsedDate.length > 3) {
        date = parsedDate[3] + "-" + getMonthNumber(parsedDate[2]) + "-" + parsedDate[1];
    }
    
    const match = new Match();
    if (date != null) {
        const mapVotes = getMapVoteResult(matchDoc);
        if (mapVotes != null) {
            match.setMapVotes(mapVotes.mapVoteTeam1, mapVotes.mapVoteTeam2);
        }
        mapResults.forEach(result => {
            if (result != null && result.length == 4) {
                if (result[2] != 0 || result[3] != 0) {
                    match.addMapResult(new MapResult(team1, team2, team1Link, team2Link, result[2], result[3], result[1], date, additionalInfo));
                }
            }
        });
    }

    return match;
}

function getMapVoteResult(matchDoc) {
    const mapVotes = matchDoc.evaluate(MAP_VOTE_XPATH_EXPRESSION, matchDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0)
    if (mapVotes == null) {
        return null;
    }
    const matches = Array.from(mapVotes.wholeText.matchAll(MAP_VOTE_REGEX));
    const teamOneDidTwoBansFirst = didTeamOneDoTwoBansFirst(matches);
    const teamOneDidFirstBan = didTeamOneDoFirstBan(matches);
    return {
        mapVoteTeam1: buildMapVote(matches, "T1", teamOneDidTwoBansFirst, teamOneDidFirstBan),
        mapVoteTeam2: buildMapVote(matches, "T2", !teamOneDidTwoBansFirst, !teamOneDidFirstBan)
    }
}

function didTeamOneDoFirstBan(matches) {
    return teamOneDidNBansFirst(matches, 1);
}

function didTeamOneDoTwoBansFirst(matches) {
    return teamOneDidNBansFirst(matches, 2);
}

function teamOneDidNBansFirst(matches, countBans) {
    var teamOneBanCount = 0;
    var teamTwoBanCount = 0;
    for (i = 0; i < matches.length; i++) {
        if (matches[i][2] != "bans") {
            continue;
        }
        if (matches[i][1] == "T1") {
            teamOneBanCount++;
        }
        if (matches[i][1] == "T2") {
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

function buildMapVote(matches, team, didTwoBansFirst, didOneBanFirst) {
    const votes = matches.filter(match => match[1] == team);
    const bans = votes.filter(match => match[2] == "bans").map(match => match[3]);
    const picks = votes.filter(match => match[2] == "picks").map(match => match[3]);
    return new MapVote(picks[0], bans[0], bans[1], didTwoBansFirst, didOneBanFirst);
}

class Match {

    constructor() {
        this.mapResults = new Array();
    }
    
    setMapVotes(mapVoteTeam1, mapVoteTeam2) {
        this.mapVoteTeam1 = mapVoteTeam1;
        this.mapVoteTeam2 = mapVoteTeam2;
    }

    addMapResult(mapResult) {
        this.mapResults.push(mapResult);
    }

    swapToFirstTeam(firstTeam) {
        if (this.mapResults[0].team1 != firstTeam) {
            this.mapResults.forEach(map => {
                map.swapTeams();
            });
            const tmp = this.mapVoteTeam1;
            this.mapVoteTeam1 = this.mapVoteTeam2;
            this.mapVoteTeam2 = tmp;
        }
    }

}

class MapResult {

    constructor (team1, team2, team1Link, team2Link, scoreTeam1, scoreTeam2, map, date, additionalInfo) {
        this.team1 = team1;
        this.team2 = team2;
        this.team1Link = team1Link;
        this.team2Link = team2Link;
        this.scoreTeam1 = scoreTeam1;
        this.scoreTeam2 = scoreTeam2;
        this.map = map;
        this.date = date;
        this.additionalInfo = additionalInfo;
    }

    setMatchLink(link) {
        this.link = link;
    }

    swapTeams() {
        var tmp = this.team1;
        this.team1 = this.team2;
        this.team2 = tmp;
        tmp = this.team1Link;
        this.team1Link = this.team2Link;
        this.team2Link = tmp;
        tmp = this.scoreTeam1;
        this.scoreTeam1 = this.scoreTeam2;
        this.scoreTeam2 = tmp;
        tmp = this.mapVoteTeam1;
        this.mapVoteTeam1 = this.mapVoteTeam2;
        this.mapVoteTeam2 = tmp;
    }

}

class MapVote {

    constructor(pick, firstBan, secondBan, didTwoBansFirst, didFirstBan) {
        this.pick = pick;
        this.firstBan = firstBan;
        this.secondBan = secondBan;
        this.didTwoBansFirst = didTwoBansFirst;
        this.didFirstBan = didFirstBan;
    }

}