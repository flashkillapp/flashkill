const DIVISION_LINK_XPATH_EXPRESSION = "//ul[@class='groups']/li/a";
const TEAM_LINK_XPATH_EXPRESSION = "//table[@class='league_table']/tbody/tr/td[2]/a";
const TEAM_WINS_XPATH_EXPRESSION = "//table[@class='league_table']/tbody/tr/td[number(substring(.,1,1)+1) and contains(text(),')')]/preceding-sibling::td[number(substring(.,1,1)+1) and contains(text(),')')]";
const TEAM_LOSSES_XPATH_EXPRESSION = "//table[@class='league_table']/tbody/tr/td[number(substring(.,1,1)+1) and contains(text(),')')]/following-sibling::td[number(substring(.,1,1)+1) and contains(text(),')')]";
const DIV_NAME_XPATH_EXPRESSION = "//table[@class='league_table']/tbody/tr/th[@class='title']";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryTeams") {
            getTeams(request.seasonUrl).then(teams => {
                sendResponse(teams);
            }).catch(console.log);
            return true;  // Will respond asynchronously.
        }
    }
);

async function getTeams(seasonUrl) {
    const htmlContent = await fetchCached(seasonUrl);
    const divs = parseDivisions(htmlContent);
    const teamsExceptForDivOne = await buildTeams(divs);
    const divOneTeams = parseTeams(htmlContent, seasonUrl);
    divOneTeams.forEach(team => teamsExceptForDivOne.push(team));
    return teamsExceptForDivOne;
}

function getHtmlContentAndLink(link) {
    return fetchCached(link).then(htmlContent => [htmlContent, link]);
}

// function getTextAndLink(response, link) {
//     return response.text().then(htmlContent => [htmlContent, link]);
// }

async function buildTeams(divisions) {
    const htmlContents = await Promise.all(Array.from(divisions.entries()).map(entry => getHtmlContentAndLink(entry[1])));
    // const htmlContents = await Promise.all(responses.map(response => getTextAndLink(response[0], response[1])));
    const teamArrays = htmlContents.map(htmlContent => parseTeams(htmlContent[0], htmlContent[1]));
    const teams = new Array();
    teamArrays.forEach(teamArray => {
        Array.from(teamArray).forEach(team => teams.push(team));
    })
    return teams;
}

function parseDivisions(html) {
    var leagueDoc = new DOMParser().parseFromString(html, "text/html");
    var divisionLinkElements = leagueDoc.evaluate(DIVISION_LINK_XPATH_EXPRESSION, leagueDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var divisions = new Map();
    for (var i = 0; i < divisionLinkElements.snapshotLength; i++) {
        let linkElement = divisionLinkElements.snapshotItem(i);
        let link = linkElement.href;
        let division = linkElement.text;
        divisions.set(division, link);
    }
    return divisions;
}

function parseTeams(html, seasonUrl) {
    var divisionDoc = new DOMParser().parseFromString(html, "text/html");
    var teamLinkElements = divisionDoc.evaluate(TEAM_LINK_XPATH_EXPRESSION, divisionDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var teamWinsElements = divisionDoc.evaluate(TEAM_WINS_XPATH_EXPRESSION, divisionDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var teamLossesElements = divisionDoc.evaluate(TEAM_LOSSES_XPATH_EXPRESSION, divisionDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var divisionNameElement = divisionDoc.evaluate(DIV_NAME_XPATH_EXPRESSION, divisionDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var teams = new Array();
    for (var i = 0; i < teamLinkElements.snapshotLength; i++) { 
        let linkElement = teamLinkElements.snapshotItem(i);
        let link = linkElement.href;
        let team = linkElement.text;
        let divisionName = divisionNameElement.snapshotItem(0).innerText;
        let teamWins = teamWinsElements.snapshotItem(i).innerText;
        let teamLosses = teamLossesElements.snapshotItem(i).innerText;
        let splitWins = teamWins.split(" ");
        let splitLosses = teamLosses.split(" ");
        const mapsWon = splitWins[0];
        const roundsWon = splitWins[1];
        const mapsLost = splitLosses[0];
        const roundsLost = splitLosses[1];
        const rounds = roundsWon.split(")")[0] + " : " + roundsLost.split("(")[1];
        teams.push(new Team(team, link, divisionName, seasonUrl, mapsWon, mapsLost, rounds));
    }
    return teams;
}

class Team {
    constructor (name, link, divisionName, divisionLink, mapsWon, mapsLost, rounds) {
        this.name = name;
        this.link = link;
        this.divisionName = divisionName;
        this.divisionLink = divisionLink;
        this.mapsWon = mapsWon;
        this.mapsLost = mapsLost;
        this.rounds = rounds;
    }
}