const SEASON_TR_XPATH_EXPRESSION = "//*[@id='content']/table[preceding::h2[text()='Werdegang'] and following::h2]/tbody/tr";
const TEAM_LOG_XPATH_EXPRESSION = "//*[@id='content']/h2[contains(text(), 'Team Log')]";

var mapsTableShown = false;

chrome.storage.sync.get(['mapsTableAutoLoad'], function(result) {
    var mapsTableAutoLoad = result.mapsTableAutoLoad;
    if (mapsTableAutoLoad) {
        insertMapsTable();
    } else {
        insertMapsButton();
    }
});

function insertMapsButton() {
    const mapsButton = getMapsButton();
    const teamLog = document.evaluate(TEAM_LOG_XPATH_EXPRESSION, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0);
    teamLog.parentNode.insertBefore(mapsButton, teamLog);
}

function getMapsButton() {
    const mapsButton = document.createElement("a");
    mapsButton.textContent = "Map Übersicht (BETA) anzeigen";
    mapsButton.addEventListener("click", () => {
        if (mapsTableShown == false) {
            const seasonUrl = "";
            insertMapsTable();
            mapsButton.textContent = "Map Übersicht (BETA) ausblenden";
            mapsTableShown = true;
        } else {
            removeMapsTable();
            mapsButton.textContent = "Map Übersicht (BETA) anzeigen";
            mapsTableShown = false;
        }
    })
    mapsButton.href = "javascript:void(0);"
    const div = document.createElement("div");
    div.className = "ylinks";
    div.appendChild(mapsButton);
    return div;
}

function removeMapsTable() {
    while (document.getElementById("maps-table_wrapper") != null) {
        const tableWrapper = document.getElementById("maps-table_wrapper");
        tableWrapper.parentNode.removeChild(tableWrapper);
    }
    const tableHeader = document.getElementById("maps-table-header");
    tableHeader.parentNode.removeChild(tableHeader);
    const tableFilter = document.getElementsByClassName("ms-options-wrap")[0];
    tableFilter.parentNode.removeChild(tableFilter);
    const tableSelect = document.getElementById("maps-table-filter");
    tableSelect.parentNode.removeChild(tableSelect);
}

function insertMapsTable() {
    chrome.runtime.sendMessage(
        { contentScriptQuery: "queryMapInfosPerSeason", seasons: getAllSeasons(), teamName: getTeamName(), teamShorthand: getTeamShorthand() },
        mapInfosPerSeason => {
            mapInfosPerSeason = addPreSelection(mapInfosPerSeason);
            const mapInfosPerSelectedSeason = mapInfosPerSeason.filter(season => season.preSelection);
            const mapInfosForSeasonsToShow = mapInfosPerSelectedSeason.flatMap(mapInfoPerSeason => mapInfoPerSeason.mapInfos);
            buildTable(mapInfosForSeasonsToShow);
            buildFilter(mapInfosPerSeason);
        }
    );
}

function addPreSelection(mapInfosPerSeason) {
    if (mapInfosPerSeason.length <= 2) {
        mapInfosPerSeason.map(season => {
            season.preSelection = getConsensusSelection(season);
        });
    } else {
        const firstNSeasons = mapInfosPerSeason.slice(0, -2);
        firstNSeasons.map(season => season.preSelection = false);
        const lastTwoSeasons = mapInfosPerSeason.slice(-2);
        lastTwoSeasons.map(season => season.preSelection = getConsensusSelection(season));
        mapInfosPerSeason = firstNSeasons.concat(lastTwoSeasons);
    }

    return mapInfosPerSeason;
}

function getConsensusSelection(season) {
    const consensus = getSeasonConsensus(season.seasonName);
    if (consensus >= 50) {
        return true;
    }
    return false;
}

function getSeasonConsensus(seasonName) {
    const seasonConsensusString = document.getElementById(`${seasonName} Consensus`).textContent;
    const seasonConsensusValue = seasonConsensusString.replace(/%/g, "");
    return seasonConsensusValue;
}

function getAllSeasons() {
    const seasonTrs = document.evaluate(SEASON_TR_XPATH_EXPRESSION, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const seasons = new Array();
    for (var i = 0; i < seasonTrs.snapshotLength; i++) {
        const currentSeasonsTr = seasonTrs.snapshotItem(i);

        if (currentSeasonsTr.className != "season-results") {
            seasons.push(getSeasonsWithSeasonInformation(currentSeasonsTr));
        }
    }
    return seasons;
}

function getSeasonsWithSeasonInformation(seasonTr) {
    const tableColumns = seasonTr.getElementsByTagName("td");
    return {
        seasonName: tableColumns[0].innerText,
        seasonInformation: buildLinkInformation(tableColumns[1])
    }
}

function buildLinkInformation(seasonTd) {
    const links = seasonTd.getElementsByTagName("a");
    if (links.length == 2) {
        return {
            seasonUrl: links[0].href,
            additionalUrl: links[1].href,
            additionalInfo: links[1].textContent
        }
    }
    return {
        seasonUrl: links[0].href
    }
}

function buildTable(mapInfos) {
    const table = document.createElement("table");
    table.className = "display";
    table.id = "maps-table";
    const header = table.createTHead();
    const headerRow = header.insertRow(-1);
    const mapCell = headerRow.insertCell(-1);
    mapCell.outerHTML = "<th>Map</th>";
    const playedCell = headerRow.insertCell(-1);
    playedCell.outerHTML = "<th>Gespielt</th>";
    const pickCell = headerRow.insertCell(-1);
    pickCell.outerHTML = "<th>Picked</th>";
    const firstBanCell = headerRow.insertCell(-1);
    firstBanCell.outerHTML = "<th>First Ban</th>"
    const secondBanCell = headerRow.insertCell(-1);
    secondBanCell.outerHTML = "<th>Second Ban</th>";
    const wonCell = headerRow.insertCell(-1);
    wonCell.outerHTML = "<th>Gewonnen</th>";
    const lossCell = headerRow.insertCell(-1);
    lossCell.outerHTML = "<th>Verloren</th>";

    const body = table.createTBody();

    const distinct = (x, i, a) => a.indexOf(x) == i;
    const playedMaps = mapInfos.map(mapInfo => mapInfo.map).filter(distinct);
    const countMatches = sumProperty(mapInfos, mapInfo => mapInfo.countMapPlayed);
    playedMaps.forEach(map => {
        const mapInfosForThisMap = mapInfos.filter(mapInfo => mapInfo.map == map);
        const countPicked = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countPicked);
        const countPickable = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countPickable);
        const percentagePicked = calcPercentage(countPicked, countPickable);
        const countWins = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countWins);
        const countLosses = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countLosses);
        const countMapPlayed = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countMapPlayed);
        const percentageMapPlayed = calcPercentage(countMapPlayed, countMatches);
        const percentageWon = calcPercentage(countWins, countMapPlayed);
        const percentageLost = calcPercentage(countLosses, countMapPlayed);
        const countFirstBan = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countFirstBan);
        const countSecondBan = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countSecondBan);
        const countFirstBanable = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countFirstBanable);
        const countSecondBanable = sumProperty(mapInfosForThisMap, mapInfo => mapInfo.countSecondBanable);
        const percentageFirstBan = calcPercentage(countFirstBan, countFirstBanable);
        const percentageSecondBan = calcPercentage(countSecondBan, countSecondBanable);

        const row = body.insertRow(-1);
        const mapCell = row.insertCell(-1);
        mapCell.textContent = map;
        mapCell.style = "background-image:url(" + getMapImage(map) + "); text-align:center; background-size:cover; color:#fff; text-shadow:0 0 4px #000, 0px 0 4px #000, 0px 0 3px #000"
        insertCell(row, percentageMapPlayed, countMapPlayed, "Das Team spielte " + map + " " + countMapPlayed + " mal.");
        insertCell(row, percentagePicked, countPicked, map + " war zum Pickzeitpunkt noch " + countPickable + " mal pickbar und " + countPicked + " mal davon pickte das Team die Map.", countPickable);
        insertCell(row, percentageFirstBan, countFirstBan, "Das Team bannte " + map + " im First Ban " + countFirstBan + " mal, von den " + countFirstBanable + " mal, als sie vorher noch nicht gebannt wurde.", countFirstBanable);
        insertCell(row, percentageSecondBan, countSecondBan, "Das Team bannte " + map + " im Second Ban " + countSecondBan + " mal, von den " + countSecondBanable + " mal, als sie vorher noch nicht gebannt wurde.", countSecondBanable);
        insertCell(row, percentageWon, countWins, "Das Team gewann " + map + " " + countWins + " von " + countMapPlayed + " mal.");
        insertCell(row, percentageLost, countLosses, "Das Team verlor " + map + " " + countLosses + " von " + countMapPlayed + " mal.");
    });
    const teamLog = document.evaluate(TEAM_LOG_XPATH_EXPRESSION, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0);
    teamLog.parentNode.insertBefore(table, teamLog);
    const dataTable = makeDatatable(table.id);
    dataTable.$('td').tooltipster();
}

function buildFilter(mapInfosPerSeason) {
    const select = createFilterSelectElement();
    select.id = "maps-table-filter";
    addSeasonsToFilter(select, mapInfosPerSeason);
    insertFilter(select);
    makeMultiselect(select.id, mapInfosPerSeason);
    insertHeading(select);
}

function makeMultiselect(selectId, mapInfosPerSeason) {
    $('#' + selectId).multiselect({
        selectAll: true,
        texts: {
            selectAll: "Alle auswählen",
            unselectAll: "Alle abwählen",
            selectedOptions: " Saisons ausgewählt",
            placeholder: "Saison auswählen",
        },
        maxWidth: "300px",
        minHeight: "175px",
        maxHeight: "175px",
        onSelectAll: (element, selected) => onMapsFilterOptionClicked(mapInfosPerSeason, element),
        onOptionClick: (element, option) => onMapsFilterOptionClicked(mapInfosPerSeason, element)
    });
}

function insertHeading(filter) {
    const heading = document.createElement("h2");
    heading.id = ("maps-table-header");
    heading.textContent = "Map Übersicht (BETA)";
    filter.parentNode.insertBefore(heading, filter);
}

function insertFilter(filter) {
    const mapsTable = document.getElementById("maps-table");
    mapsTable.parentNode.insertBefore(filter, mapsTable);
}

function createFilterSelectElement() {
    const select = document.createElement("select");
    select.id = "map-filter-select";
    select.setAttribute("multiple", "multiple");
    return select;
}

function addSeasonsToFilter(select, mapInfosPerSeason) {
    mapInfosPerSeason.forEach(mapInfoPerSeason => addSeasonToFilter(select, mapInfoPerSeason));
}

function addSeasonToFilter(select, mapInfoPerSeason) {
    const option = document.createElement("option");
    option.value = mapInfoPerSeason.seasonName;
    option.textContent = mapInfoPerSeason.seasonName;
    option.selected = mapInfoPerSeason.preSelection;
    select.appendChild(option);
}

function onMapsFilterOptionClicked(mapInfosPerSeason, element) {
    const selectedSeasons = Array.from(element).filter(opt => opt.selected).map(opt => opt.value);
    const mapInfosToShow = mapInfosPerSeason.filter(mapInfoPerSeason => selectedSeasons.some(selectedSeason => selectedSeason == mapInfoPerSeason.seasonName))
        .flatMap(mapInfoPerSeason => mapInfoPerSeason.mapInfos);
    document.getElementById("maps-table").remove();
    buildTable(mapInfosToShow);
}

function makeDatatable(tableId) {
    return $('#' + tableId).dataTable({
        paging: false,
        searching: false,
        bInfo: false,
        order: [[2, "desc"]],
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/German.json"
        },
        columnDefs: [
            {
                targets: [0, 1, 2, 3, 4],
                className: "dt-left"
            },
            {
                targets: [0],
                sortable: false
            }
        ]
    });
}

function formatPercentageWithAbsolute(percentage, absolute) {
    return percentage + "%" + " (" + absolute + ")";
}

function formatPercentageWithAbsoluteAndFromAbsolute(percentage, absolute, fromAbsolute) {
    return percentage + "%" + " (" + absolute + "/" + fromAbsolute + ")";
}

function insertCell(row, percentage, absolute, title, fromAbsolute = null) {
    const cell = row.insertCell(-1);
    cell.setAttribute("data-sort", absolute);
    cell.setAttribute("title", title);
    if (fromAbsolute) {
        cell.textContent = formatPercentageWithAbsoluteAndFromAbsolute(percentage, absolute, fromAbsolute);
    } else {
        cell.textContent = formatPercentageWithAbsolute(percentage, absolute);
    }
}

function calcPercentage(countActual, countPossible) {
    if (countPossible == 0) {
        return 0;
    }
    return Math.round(100 * (countActual / countPossible));
}

function sumProperty(array, extractor) {
    const sum = arr => arr.reduce((p, c) => p + c, 0);
    return sum(array.map(extractor));
}