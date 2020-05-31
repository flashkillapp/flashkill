
const teamPageRegex = /https:\/\/liga\.99damage\.de\/de\/leagues\/teams\/.*/
const pageMatches = window.location.href.match(teamPageRegex);
const contentScriptActive = pageMatches != undefined && pageMatches.length > 0;

var seasonResultsToggled = false;//new Array(getNumberOfSeasons()).fill(false);

const SEASON_START_DATE_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr[2]/td[1]/a";
const SEASON_END_DATE_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr[last()]/td[1]/a";
const SEASON_NAME_XPATH_EXPRESSION = "//div[@class='l2']";
const MEMBER_LIST_XPATH_EXPRESSION = "//ul[@class='content-portrait-grid-l']/li";

// improveMemberTable();

// improveResultsTable();

if (contentScriptActive) {
    // execute content script

    improveMemberCards();
}

async function getSeasonStartAndEndDates(seasonUrl) {
    //TODO: fetch Logik in background.js
    const response = await fetch(seasonUrl);
    const text = await response.text();
    const seasonDocument = new DOMParser().parseFromString(text, "text/html"); 
    const seasonNameElements = seasonDocument.evaluate(SEASON_NAME_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const seasonName = seasonNameElements.snapshotItem(0).textContent;
    if (seasonName == "Saison 12") {
        return new SeasonBounds(seasonName, new Date(Date.now()), new Date(Date.now()));
    }
    const startDateRawElements = seasonDocument.evaluate(SEASON_START_DATE_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const endDateRawElements = seasonDocument.evaluate(SEASON_END_DATE_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const startDateRaw = startDateRawElements.snapshotItem(0).text.trim();
    const endDateRaw = endDateRawElements.snapshotItem(0).text.trim();
    var startDate = new Date(formatDateToStandard(startDateRaw));
    startDate = startDate.setDate(startDate.getDate() - 7);
    return new SeasonBounds(seasonName, new Date(startDate), new Date(formatDateToStandard(endDateRaw)));
}

function improveResultsTable() {
    const resultsTable = document.getElementById("content").getElementsByTagName("table")[1];
    const tableHead = document.createElement("thead");
    const headerTr = document.createElement("tr");
    const seasonTh = document.createElement("th");
    seasonTh.textContent = "Saison";
    headerTr.appendChild(seasonTh);
    const divisionTh = document.createElement("th");
    divisionTh.textContent = "Division";
    headerTr.appendChild(divisionTh);
    const resultsTh = document.createElement("th");
    resultsTh.textContent = "Ergebnisse";
    resultsTh.colSpan = "2";
    headerTr.appendChild(resultsTh);
    const konsensTh = document.createElement("th");
    konsensTh.textContent = "Konsens";
    konsensTh.title = "Anteil des aktuellen Linups, das während dieser Saison in diesem Team gespielt hat.";
    headerTr.appendChild(konsensTh);
    tableHead.appendChild(headerTr);
    resultsTable.appendChild(tableHead);
    insertSeasonResultsButtons();
    insertMembersPerSeason();
}

function getConsensusFromSeasonMembers(seasonMembers) {
    const teamMembers = document.getElementById("member-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    return Math.round(100*(seasonMembers.length/teamMembers.length));
}

function insertMembersPerSeason() {
    getMembersPerSeason().then(seasonMembers => {
        const resultsTableRows = document.getElementById("content").getElementsByTagName("table")[2].getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        for (var i = 0; i < seasonMembers.length; i++) {
            const konsensTd = document.createElement("td");
            const seasonTr = resultsTableRows[i];
            const seasonName = seasonTr.firstChild.nextSibling.innerText;
            konsensTd.id = `${seasonName} Consensus`;
            konsensTd.textContent = getConsensusFromSeasonMembers(seasonMembers[i])+"%";
            konsensTd.title = seasonMembers[i].join(", ");
            konsensTd.style.verticalAlign = "top";
            konsensTd.align = "center";
            seasonTr.appendChild(konsensTd);
        }
    });
}

function getDateFromTeamLogEntry(dateTd) {
    var dateStringRaw = dateTd.firstChild.title;
    dateStringRaw = dateStringRaw.substring(5, 16);
    dateStringRaw = formatDateToStandard(dateStringRaw);
    return new Date(dateStringRaw);
}

function compareTeamLogEntries( a, b ) {
  if ( a.date < b.date ){
    return -1;
  }
  if ( a.date > b.date ){
    return 1;
  }
  return 0;
}

function getMemberships(members) {
    const relevantRows = getRelevantTeamLogRows(members);
    var memberships = new Array();
    for (var i = 0; i < relevantRows.length; i++) {
        if (relevantRows[i].action == "join") {
            const currentMember = relevantRows[i].member;
            for (var j = i; j <= relevantRows.length; j++) {
                if (j == relevantRows.length) {
                    memberships.push({member: currentMember, startDate: relevantRows[i].date, endDate: new Date(Date.now())});
                    break;
                }
                if (relevantRows[j].member == currentMember && relevantRows[j].action == "leave") {
                    memberships.push({member: currentMember, startDate: relevantRows[i].date, endDate: relevantRows[j].date});
                    break;
                }
            }
        }
    }
    return memberships;
}

function getRelevantTeamLogRows(members) {
    const teamLogRows = document.getElementById("team_log").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    var relevantLogs = new Array();
    //Filter the rows for the patterns
    //date, teamMember, member_join, ...
    //date, teamMember, member_leave, ...
    //date, ..., member_kick, teamMember
    Array.from(teamLogRows).forEach(log => {
        const logElements = log.getElementsByTagName("td");
        if (logElements.length == 4) {
        if (logElements[2].textContent == "create") {
            if (members.includes(logElements[1].textContent)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].textContent, action: "join"});
            }
        } else if (logElements[2].textContent == "member_join") {
            if (members.includes(logElements[1].textContent)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].textContent, action: "join"});
            }
        } else if (logElements[2].textContent == "member_leave") {
            if (members.includes(logElements[1].textContent)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].textContent, action: "leave"});
            }
        } else if (logElements[2].textContent == "member_kick") {
            if (members.includes(logElements[3].textContent)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[3].textContent, action: "leave"});
            }
        }
        }
    });
    return relevantLogs.sort(compareTeamLogEntries);
}

function wasMembershipDuringSeason(membership, season) {
    if (membership.startDate < season.startDate && membership.endDate > season.startDate) {
        return true;
    }
    if (membership.startDate > season.startDate && membership.startDate < season.endDate) {
        return true;
    }
    return false;
}

async function getMembersPerSeason() {
    var seasonsMembers = new Array();
    //Get each Season with start and end date
    const seasonRows = document.getElementById("content").getElementsByTagName("table")[1].getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const seasons = await Promise.all(Array.from(seasonRows).map(seasonRow => {
        const seasonUrl = seasonRow.getElementsByTagName("td")[1].getElementsByTagName("a")[0].href;
        return getSeasonStartAndEndDates(seasonUrl);
    }));
    //Get each Member
    const teamMembers = Array.from(document.getElementById("member-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr")).map(member => member.getElementsByTagName("td")[2].firstChild.textContent);
    //Get all Memberships for Members
    const membershipsMembers = getMemberships(teamMembers);
    //Check for each season if Member had membership during timeframe update Season with Membername
    seasons.forEach(season => {
        var seasonMembers = new Array();
        teamMembers.forEach(teamMember => {
            Array.from(membershipsMembers).forEach(membership => {
                if (membership.member == teamMember && wasMembershipDuringSeason(membership, season)) {
                    if (!seasonMembers.includes(teamMember)) {
                        seasonMembers.push(teamMember);
                    }
                }
            });
        });
        seasonsMembers.push(seasonMembers);
    });
    return seasonsMembers;
}

function formatDateToStandard(date) {
    //Gets date in "dd mmm yyyy" format where mmm are letters
    //Returns date in yyyy-mm-dd format where mm are digits
    const day = date.substring(0, 2);
    const month = date.substring(3, 6);
    const year = date.substring(7, 11);
    return year + "-" + getMonthNumber(month) + "-" + day;
    return 
}

function getMonthNumber(monthName) {
    switch (monthName) {
        case "Jan":
            return "01";
        case "Feb":
            return "02";
        case "Mar":
            return "03";
        case "Apr":
            return "04";
        case "Mai":
            return "05";
        case "Jun":
            return "06";
        case "Jul":
            return "07";
        case "Aug":
            return "08";
        case "Sep":
            return "09";
        case "Okt":
            return "10";
        case "Nov":
            return "11";
        case "Dec":
            return "12";
        case "Dez":
            return "12";
        case "May":
            return "05";
        case "Oct":
            return "10";
        case "Mär":
            return "03";
    }
}

class SeasonBounds {
    constructor(seasonNumber, startDate, endDate) {
        this.seasonNumber = seasonNumber;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

function insertFaceitEloMean(faceitEloMean) {
    const faceitEloMeanH2 = document.createElement("h2");
    faceitEloMeanH2.textContent = "FACEIT Elo: " + Math.round(faceitEloMean);
    faceitEloMeanH2.title = "Durchschnittliche FACEIT Elo";
    const teamHeader = document.getElementsByClassName("content-portrait-head")[0];
    teamHeader.parentNode.appendChild(faceitEloMeanH2);
}

function calcFaceitEloMean(playerInfos) {
    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
    return average(playerInfos.filter(playerInfo => playerInfo.faceitInfo != null).map(playerInfo => playerInfo.faceitInfo.games.csgo.faceit_elo));
}

function improveMemberCards() {
    const memberCards = document.getElementsByClassName("content-portrait-grid-l")[0].getElementsByTagName("li");
    var memberCardWrappers = [];
    for (var i = 0; i < memberCards.length; i++) {
        const memberCard = memberCards[i];
        memberCardWrappers.push( { memberCard: memberCard, steamId: getSteamId(memberCard) } );
    }
    const steamIds = memberCardWrappers.map(memberCard => { return memberCard.steamId });
    chrome.runtime.sendMessage(
        { contentScriptQuery: "queryPlayerInfo", steamIds: steamIds },
        playerInfos => {
            playerInfos.forEach(playerInfo => {
                const memberCardWrapper = memberCardWrappers.find(memberCard => memberCard.steamId == playerInfo.steamId);
                inject(playerInfo, memberCardWrapper.memberCard);
            });
            const faceitEloMean = calcFaceitEloMean(playerInfos);
            insertFaceitEloMean(faceitEloMean);
        }
    );
}

function inject(playerInfo, memberCard) {
    const steamId64 = playerInfo.steamId64;

    if (steamId64 != "") {
        const steamDiv = document.createElement("div");
        steamDiv.className = "txt-subtitle";
        steamDiv.innerText = "Steam: ";
        steamDiv.style.paddingTop = "5px";
        steamDiv.style.whiteSpace = "nowrap";
        steamDiv.style.overflow = "hidden";
        const steamLink = document.createElement("a");
        steamLink.href = `https://steamcommunity.com/profiles/${steamId64}`;
        steamLink.textContent = playerInfo.steamName;
        steamLink.target = "_blank";

        steamDiv.appendChild(steamLink);

        memberCard.appendChild(steamDiv);
    }

    if (playerInfo.faceitInfo != null) {
        const faceitInfo = playerInfo.faceitInfo;

        const faceitDiv1 = document.createElement("div");
        faceitDiv1.style.textAlign = "left";
        faceitDiv1.style.float = "left";
        faceitDiv1.style.paddingTop = "7px";

        const faceitTextA = document.createElement("a");
        faceitTextA.href = getFaceitLink(faceitInfo.nickname);
        faceitTextA.target = "_blank";
        faceitTextA.textContent = faceitInfo.games.csgo.faceit_elo;

        faceitDiv1.textContent = "FACEIT: "
        faceitDiv1.appendChild(faceitTextA);

        const faceitDiv2 = document.createElement("div");
        faceitDiv2.style.textAlign = "right";

        const faceitImg = document.createElement("img");
        faceitImg.style.width = "28px";
        faceitImg.style.height = "28px";
        faceitImg.src = getFaceitLevel(faceitInfo.games.csgo.skill_level);
        faceitImg.alt = faceitInfo.games.csgo.skill_level;
        
        const faceitImageA = document.createElement("a");
        faceitImageA.href = getFaceitLink(faceitInfo.nickname);
        faceitImageA.target = "_blank";
        faceitImageA.appendChild(faceitImg);

        faceitDiv2.appendChild(faceitImageA);

        const eloDiv = document.createElement("div");
        eloDiv.className = "txt-subtitle";
        eloDiv.style.width = "17.5em";
        eloDiv.appendChild(faceitDiv1);
        eloDiv.appendChild(faceitDiv2);

        memberCard.appendChild(eloDiv);
    }
}

function getFaceitLevel(faceitLevel) {
    return `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`;
}

function getFaceitLink(name) {
    return `https://www.faceit.com/en/players/${name}`;
}

function getSteamId(memberCard) {
    return memberCard.getElementsByTagName("span")[0].textContent;
}

function getNumberOfSeasons() {
    return document.getElementById("content").getElementsByTagName("table")[1].getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
}

function insertSeasonResultsButtons() {
    var i = 0;
    Array.from(document.getElementById("content").getElementsByTagName("table")[1].getElementsByTagName("tbody")[0].getElementsByTagName("tr")).forEach(element => {
        insertSeasonResultsButtonInto(element, i++);
    });
}

function insertSeasonResultsButtonInto(element, i) {
    const seasonResultsButton = getSeasonResultsButton(i);
    const seasonResultsButtonTd = document.createElement("td");
    seasonResultsButtonTd.style.verticalAlign = "top";
    seasonResultsButtonTd.appendChild(seasonResultsButton);
    element.appendChild(seasonResultsButtonTd);
}

function getTeamName() {
    const teamNameH2 = document.getElementsByTagName("h2")[0];
    const teamName = teamNameH2.textContent.split("(")[0];
    return teamName.trim();
}

function getTeamShorthand() {
    const teamNameH2 = document.getElementsByTagName("h2")[0];
    const teamShorthandRaw = teamNameH2.textContent.split("(")[1];
    const teamShorthand = teamShorthandRaw.substring(0, teamShorthandRaw.length-1);
    return teamShorthand.trim();
}

function insertSeasonResults(season) {
    const seasonsTableBody = document.getElementById("content").getElementsByTagName("table")[2].getElementsByTagName("tbody")[0];
    const seasonTr = Array.from(seasonsTableBody.getElementsByTagName("tr")).filter(tr => tr.parentNode == seasonsTableBody)[getActualTableIndexForSeason(season)];
    const resultsDiv = document.createElement("div");
    const resultsTr = document.createElement("tr");
    resultsTr.className = "season-results";
    const resultsTd = document.createElement("td");
    resultsTd.colSpan = 5;
    const seasonTd = seasonTr.getElementsByTagName("td")[1];
    resultsTr.appendChild(resultsTd);
    resultsTd.appendChild(resultsDiv);
    seasonTr.parentNode.insertBefore(resultsTr, seasonTr.nextSibling);
    insertResultsTable(resultsDiv, seasonTd, getTeamName(), getTeamShorthand(), season);
}

function removeSeasonResults(season) {
    const table = document.getElementById("content").getElementsByTagName("table")[2];
    const seasonsTableBody = document.getElementById("content").getElementsByTagName("table")[2].getElementsByTagName("tbody")[0];
    table.getElementsByTagName("tbody")[0].removeChild(Array.from(table.getElementsByTagName("tr")).filter(tr => tr.parentNode == seasonsTableBody)[getActualTableIndexForSeason(season)].nextSibling);
}

function getActualTableIndexForSeason(season) {
    const table = document.getElementById("content").getElementsByTagName("table")[2];
    var activeSeasonResultsBefore = 0;
    seasonResultsToggled.slice(0, season).forEach(element => {
        if (element) {
            activeSeasonResultsBefore++;
        }
    });
    return season + activeSeasonResultsBefore;
}

function getSeasonResultsButton(season) {
    const seasonResult = document.createElement("a");
    seasonResult.textContent = "Ergebnisse anzeigen";
    seasonResult.addEventListener("click", () => {
        if (seasonResultsToggled[season] == false) {
            const seasonUrl = "";
            insertSeasonResults(season);
            seasonResult.textContent = "Ergebnisse ausblenden";
            seasonResultsToggled[season] = true;
        } else {
            removeSeasonResults(season);
            seasonResult.textContent = "Ergebnisse anzeigen";
            seasonResultsToggled[season] = false;
        }
    })
    seasonResult.href = "javascript:void(0);"
    const div = document.createElement("div");
    div.className = "ylinks";
    div.style = "float: left; margin-top: -3px; margin-right: 5px;";
    div.appendChild(seasonResult);
    return div;
}