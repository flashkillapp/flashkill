const SEASON_START_DATE_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr[2]/td[1]/a";
const SEASON_END_DATE_XPATH_EXPRESSION = "//table[@class='league_table_matches']/tbody/tr[last()]/td[1]/a";
const SEASON_NAME_XPATH_EXPRESSION = "//div[@class='l2']";
var seasonResultsToggled = new Array(getNumberOfSeasons()).fill(false);

improveMemberTable();

improveResultsTable();

async function getSeasonStartAndEndDates(seasonUrl) {
    //TODO: fetch Logik in background.js
    const response = await fetch(seasonUrl);
    const text = await response.text();
    const seasonDocument = new DOMParser().parseFromString(text, "text/html"); 
    const seasonNameElements = seasonDocument.evaluate(SEASON_NAME_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const seasonName = seasonNameElements.snapshotItem(0).innerHTML;
    if (seasonName == "Saison 12") {
        return new Season(seasonName, new Date(Date.now()), new Date(Date.now()));
    }
    const startDateRawElements = seasonDocument.evaluate(SEASON_START_DATE_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const endDateRawElements = seasonDocument.evaluate(SEASON_END_DATE_XPATH_EXPRESSION, seasonDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
    const startDateRaw = startDateRawElements.snapshotItem(0).text.trim();
    const endDateRaw = endDateRawElements.snapshotItem(0).text.trim();
    var startDate = new Date(formatDateToStandard(startDateRaw));
    startDate = startDate.setDate(startDate.getDate() - 7);
    return new Season(seasonName, new Date(startDate), new Date(formatDateToStandard(endDateRaw)));
}

function improveResultsTable() {
    const resultsTable = document.getElementById("content").getElementsByTagName("table")[1];
    const tableHead = document.createElement("thead");
    const headerTr = document.createElement("tr");
    const seasonTh = document.createElement("th");
    seasonTh.innerHTML = "Saison";
    headerTr.appendChild(seasonTh);
    const divisionTh = document.createElement("th");
    divisionTh.innerHTML = "Division";
    headerTr.appendChild(divisionTh);
    const resultsTh = document.createElement("th");
    resultsTh.innerHTML = "Ergebnisse";
    resultsTh.colSpan = "2";
    headerTr.appendChild(resultsTh);
    const konsensTh = document.createElement("th");
    konsensTh.innerHTML = "Konsens";
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
            konsensTd.innerHTML = getConsensusFromSeasonMembers(seasonMembers[i])+"%";
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
        if (logElements[2].innerHTML == "create") {
            if (members.includes(logElements[1].innerHTML)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].innerHTML, action: "join"});
            }
        } else if (logElements[2].innerHTML == "member_join") {
            if (members.includes(logElements[1].innerHTML)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].innerHTML, action: "join"});
            }
        } else if (logElements[2].innerHTML == "member_leave") {
            if (members.includes(logElements[1].innerHTML)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[1].innerHTML, action: "leave"});
            }
        } else if (logElements[2].innerHTML == "member_kick") {
            if (members.includes(logElements[3].innerHTML)) {
                relevantLogs.push({date: new Date(getDateFromTeamLogEntry(logElements[0])), member: logElements[3].innerHTML, action: "leave"});
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
    const teamMembers = Array.from(document.getElementById("member-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr")).map(member => member.getElementsByTagName("td")[2].firstChild.innerHTML);
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

function getMembers() {
    //Returns the names of all current team members
    return new Array();
}

function parseTeamEvents() {
    //Returns memberships of all the current team members
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

class Season {
    constructor(seasonNumber, startDate, endDate) {
        this.seasonNumber = seasonNumber;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

function improveMemberTable() {
    const memberTable = document.getElementById("content").getElementsByTagName("table")[0];
    memberTable.id = "member-table";
    memberTable.lastChild.removeChild(memberTable.lastChild.childNodes[0]);
    memberTable.appendChild(getMemberTableHead());
    const memberTrs = memberTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const steamIds = Array.from(memberTrs).map(getSteamId);
    const addedColumsForEachRow = initialiseMemberRows(memberTrs);
    makeMemberTableADatatable();
    chrome.runtime.sendMessage(
        { contentScriptQuery: "queryPlayerInfo", steamIds: steamIds },
        playerInfos => {
            playerInfos.forEach(playerInfo => {
                const columns = addedColumsForEachRow.find(columns => columns.steamId == playerInfo.steamId);
                fillMemberRow(columns, playerInfo);
            });
            // reinitialiseMemberDatatable();
            const faceitEloMean = calcFaceitEloMean(playerInfos);
            insertFaceitEloMean(faceitEloMean);
            addEventListenerToShowSteamIdCheckbox(addedColumsForEachRow);
        }
    );
}

function addEventListenerToShowSteamIdCheckbox(addedColumsForEachRow) {
    document.getElementById("showSteamIdsCheckbox").addEventListener("change", event => showSteamIdsCheckboxClicked(addedColumsForEachRow, event));
}

function reinitialiseMemberDatatable(centerSteamIdColumn = true) {
    $('#member-table').DataTable().destroy();
    makeMemberTableADatatable(centerSteamIdColumn);
}

function insertFaceitEloMean(faceitEloMean) {
    const faceitEloMeanH2 = document.createElement("h2");
    faceitEloMeanH2.innerHTML = "FACEIT Elo: " + Math.round(faceitEloMean);
    faceitEloMeanH2.title = "Durchschnittliche FACEIT Elo";
    const firstH2 = document.getElementById("content").getElementsByTagName("h2")[1];
    firstH2.parentNode.insertBefore(faceitEloMeanH2, firstH2.nextSibling);
}

function calcFaceitEloMean(playerInfos) {
    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
    return average(playerInfos.filter(playerInfo => playerInfo.faceitInfo != null).map(playerInfo => playerInfo.faceitInfo.games.csgo.faceit_elo));
}

function makeMemberTableADatatable(centerSteamIdColumn = true) {
    $('#member-table').DataTable({
        autoWidth: false,
        paging: false,
        searching: false,
        bInfo: false,
        aaSorting: [],
        scrollX: true,
        columnDefs: [
            {
                targets: [0, 1],
                className: 'dt-body-center'
            },
            {
                targets: [2, 3, 4],
                className: 'dt-body-left'
            },
            {
                targets: [2, 3, 4],
                className: 'dt-head-left'
            },
            {
                targets: [5],
                className: (centerSteamIdColumn ? "dt-center" : "dt-left")
            },
            {
                targets: [4, 5],
                sortable: false
            }
        ],
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/German.json"
        },
        rowCallback: function (row, data, index) {
            if (row.className == "odd") {
                $(row).css('backgroundColor', "WhiteSmoke");
            }
            else if (row.className == "even") {
                $(row).css('backgroundColor', "");
            }
        }
    });
}

function initialiseMemberRows(memberTrs) {

    var addedColumns = new Array();

    for (var i = 0; i < memberTrs.length; i++) {
        if (i % 2 == 0) {
            memberTrs[i].className = "even";
        } else {
            memberTrs[i].className = "odd";
        }

        const faceitEloTd = document.createElement("td");
        faceitEloTd.innerHTML = "lädt...";
        faceitEloTd.align = "center";
        memberTrs[i].insertBefore(faceitEloTd, memberTrs[i].firstChild);

        const faceitTd = document.createElement("td");
        faceitTd.innerHTML = "lädt...";
        faceitTd.align = "center";
        memberTrs[i].insertBefore(faceitTd, memberTrs[i].firstChild);

        const steamProfileTd = document.createElement("td");
        const steamProfileA = document.createElement("a");
        steamProfileA.innerHTML = "lädt...";
        chrome.runtime.sendMessage(
            { contentScriptQuery: "querySteamLink", steamId: getSteamId(memberTrs[i]) },
            steamLink => {
                steamProfileA.href = steamLink;
                steamProfileA.target = "_blank";
            }
        );
        steamProfileTd.appendChild(steamProfileA);
        const steamIdColumn = memberTrs[i].getElementsByTagName("td")[memberTrs[i].getElementsByTagName("td").length - 1];
        memberTrs[i].insertBefore(steamProfileTd, steamIdColumn);

        addedColumns.push({ steamId: getSteamId(memberTrs[i]), faceitTd, faceitEloTd, steamProfileTd, steamProfileA, steamIdColumn });
        steamIdColumn.innerHTML = "...";
    }

    return addedColumns;
}

function fillMemberRow(columns, playerInfo) {
    const steamId64 = playerInfo.steamId64;

    if (steamId64 == "") {
        columns.steamProfileTd.innerHTML = "N/A";
    } else {
        columns.steamProfileA.innerHTML = playerInfo.steamName;
    }

    if (playerInfo.faceitInfo != null) {
        const faceitImg = document.createElement("img");
        faceitImg.style.width = "28px";
        faceitImg.style.height = "28px";
        const faceitInfo = playerInfo.faceitInfo;
        faceitImg.src = getFaceitLevel(faceitInfo.games.csgo.skill_level);
        faceitImg.alt = faceitInfo.games.csgo.skill_level;
        const faceitA = document.createElement("a");
        faceitA.appendChild(faceitImg);
        faceitA.href = getFaceitLink(faceitInfo.nickname);
        faceitA.target = "_blank";
        columns.faceitTd.setAttribute("data-sort", faceitInfo.games.csgo.faceit_elo);
        columns.faceitTd.innerHTML = "";
        columns.faceitTd.appendChild(faceitA);
        columns.faceitEloTd.innerHTML = faceitInfo.games.csgo.faceit_elo;
    } else {
        columns.faceitTd.innerHTML = "N/A";
        columns.faceitEloTd.innerHTML = "N/A";
    }
}

function getFaceitLevel(faceitLevel) {
    return `https://cdn-frontend.faceit.com/web/960/src/app/assets/images-compress/skill-icons/skill_level_${faceitLevel}_svg.svg`;
}

function getFaceitLink(name) {
    return `https://www.faceit.com/en/players/${name}`;
}

function getSteamId(memberTr) {
    return memberTr.getElementsByTagName("td")[memberTr.getElementsByTagName("td").length - 1].innerHTML;
}

function getMemberTableHead() {
    const memberTableThead = document.createElement("thead");
    const headerTr = document.createElement("tr");
    const faceitTh = document.createElement("th");
    const faceitEloTh = document.createElement("th");
    const userTh = document.createElement("th");
    const statusTh = document.createElement("th");
    const steamProfileTh = document.createElement("th");
    const steamIdTh = document.createElement("th");
    faceitTh.innerHTML = "FACEIT Profil";
    faceitEloTh.innerHTML = "FACEIT Elo";
    userTh.innerHTML = "Benutzer";
    statusTh.innerHTML = "Status";
    steamProfileTh.innerHTML = "Steam Profil";
    const showSteamIdsCheckbox = document.createElement("input");
    showSteamIdsCheckbox.type = "checkbox";
    showSteamIdsCheckbox.id = "showSteamIdsCheckbox";
    showSteamIdsCheckbox.name = "steamId";
    showSteamIdsCheckbox.value = "0";
    steamIdTh.appendChild(showSteamIdsCheckbox);
    steamIdTh.innerHTML += "Steam ID";
    steamIdTh.id = "steamIdTableHeader";
    headerTr.appendChild(faceitTh);
    headerTr.appendChild(faceitEloTh);
    headerTr.appendChild(userTh);
    headerTr.appendChild(statusTh);
    headerTr.appendChild(steamProfileTh);
    headerTr.appendChild(steamIdTh);
    memberTableThead.appendChild(headerTr);
    return memberTableThead;
}

function showSteamIdsCheckboxClicked(columns, event) {
    if (!event.target.checked) {
        columns.forEach(column => {
            column.steamIdColumn.innerHTML = "...";
        });
        resetClassNamesOfSteamIdColumn();
        reinitialiseMemberDatatable(true);
    } else {
        columns.forEach(column => {
            column.steamIdColumn.innerHTML = column.steamId;
        });
        resetClassNamesOfSteamIdColumn();
        reinitialiseMemberDatatable(false);
    }
}

function resetClassNamesOfSteamIdColumn() {
    const memberTable = document.getElementById("member-table");
    const steamIdTableHeader = document.getElementById("steamIdTableHeader");
    steamIdTableHeader.className = "";
    Array.from(memberTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr")).forEach(tableRow => {
        const columns = tableRow.getElementsByTagName("td");
        const steamIdColumn = columns[columns.length - 1];
        steamIdColumn.className = "";
    });
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
    const teamName = teamNameH2.innerHTML.split("(")[0];
    return teamName.trim();
}

function getTeamShorthand() {
    const teamNameH2 = document.getElementsByTagName("h2")[0];
    const teamShorthandRaw = teamNameH2.innerHTML.split("(")[1];
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
    seasonResult.innerHTML = "Ergebnisse anzeigen";
    seasonResult.addEventListener("click", () => {
        if (seasonResultsToggled[season] == false) {
            const seasonUrl = "";
            insertSeasonResults(season);
            seasonResult.innerHTML = "Ergebnisse ausblenden";
            seasonResultsToggled[season] = true;
        } else {
            removeSeasonResults(season);
            seasonResult.innerHTML = "Ergebnisse anzeigen";
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