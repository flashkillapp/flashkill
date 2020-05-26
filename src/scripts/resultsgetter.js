const mapImageInferno = "https://cdn0.gamesports.net/map_thumbs_big/90.png?1487240877";
const mapImageMirage = "https://cdn0.gamesports.net/map_thumbs_big/94.jpg?1543845869";
const mapImageDust2 = "https://cdn0.gamesports.net/map_thumbs_big/88.png?1525340267";
const mapImageCache = "https://cdn0.gamesports.net/map_thumbs_big/127.jpg?0";
const mapImageCobblestone = "https://cdn0.gamesports.net/map_thumbs_big/293.jpg?0";
const mapImageTrain = "https://cdn0.gamesports.net/map_thumbs_big/89.jpg?0";
const mapImageOverpass = "https://cdn0.gamesports.net/map_thumbs_big/295.jpg?0";
const mapImageVertigo = "https://cdn0.gamesports.net/map_thumbs_big/417.jpg?1554321447";
const mapImageNuke = "https://cdn0.gamesports.net/map_thumbs_big/91.jpg?1457434550";
var teamName;
var teamShorthand;

function insertResultsTable(container, seasonTd, teamName, teamShorthand, season) {
    container.textContent = "Ergebnisse werden geladen...";
    chrome.runtime.sendMessage(
        { contentScriptQuery: "queryMatches", linkInformation: buildLinkInformation(seasonTd), teamName, teamShorthand },
        matches => {
            if (matches.length == 0) {
                container.textContent = "Keine Ergebnisse gefunden.";
            } else {
                const table = document.createElement("table");
                table.className = "display";
                table.id = "matches-table" + season;
                const header = table.createTHead();
                const headerRow = header.insertRow(-1);
                const dateCell = headerRow.insertCell(-1);
                dateCell.outerHTML = "<th>Datum</th>";
                const team1Cell = headerRow.insertCell(-1);
                team1Cell.outerHTML = "<th>Team 1</th>";
                const score1Cell = headerRow.insertCell(-1);
                score1Cell.outerHTML = "<th>Score Team 1</th>";
                const score2Cell = headerRow.insertCell(-1);
                score2Cell.outerHTML = "<th>Score Team 2</th>";
                const team2Cell = headerRow.insertCell(-1);
                team2Cell.outerHTML = "<th>Team 2</th>";
                const mapCell = headerRow.insertCell(-1);
                mapCell.outerHTML = "<th>Map</th>";
                const linkCell = headerRow.insertCell(-1);
                linkCell.outerHTML = "<th>Matchroom</th>";

                const body = table.createTBody();
                container.textContent = "";
                container.appendChild(table);
                matches.filter(match => match.mapResults.length > 0).flatMap(match => match.mapResults).map(map => {
                    var row = body.insertRow(0);
                    fillMapRow(row, map);
                })
                $('#' + table.id).DataTable({
                    paging: false,
                    searching: false,
                    columnDefs: [
                        {
                            targets: [2, 3, -1],
                            className: 'dt-body-center'
                        },
                        {
                            targets: [1, 6],
                            sortable: false
                        }
                    ],
                    language: {
                        url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/German.json"
                    },
                    rowCallback: function (row, data, index) {
                        var columnColor;
                        if (parseInt(data[2]) > parseInt(data[3])) {
                            columnColor = 'MediumAquamarine';
                        } else if (parseInt(data[3]) > parseInt(data[2])) {
                            columnColor = 'RosyBrown';
                        } else {
                            columnColor = 'PaleGoldenrod';
                        }
                        $(row).find('td:eq(2)').css('backgroundColor', columnColor);
                        $(row).find('td:eq(3)').css('backgroundColor', columnColor);
                    }
                });
            }
        }
    );
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

function formatDate(date) {
    //Gets date in yyyy-mm-dd format
    //Returns date in yy.mm.dd format
    const year = date.substring(2, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    return day + "." + month + "." + year;
}

function fillMapRow(row, mapResult) {
    const date = row.insertCell(-1);
    const team1 = row.insertCell(-1);
    const score1 = row.insertCell(-1);
    const score2 = row.insertCell(-1);
    const team2 = row.insertCell(-1);
    const map = row.insertCell(-1);
    const link = row.insertCell(-1);
    date.setAttribute("data-sort", mapResult.date);
    date.textContent = formatDate(mapResult.date);
    if (mapResult.additionalInfo != null) {
        date.textContent = date.textContent + " " + mapResult.additionalInfo;
    }
    const team1A = document.createElement("a");
    team1A.textContent = mapResult.team1;
    team1A.href = mapResult.team1Link;
    team1A.target = "_blank";
    team1.appendChild(team1A);
    const team2A = document.createElement("a");
    team2A.textContent = mapResult.team2;
    team2A.href = mapResult.team2Link;
    team2A.target = "_blank";
    team2.appendChild(team2A);
    score1.textContent = mapResult.scoreTeam1;
    score2.textContent = mapResult.scoreTeam2;
    map.textContent = mapResult.map;
    const mapImageLink = getMapImage(mapResult.map);
    map.style = `
        background-image:url(${mapImageLink});
        text-align:center;
        background-size:cover;
        color:#fff;
        text-shadow:0 0 4px #000, 0px 0 4px #000, 0px 0 3px #000;
    `;
    const linkA = document.createElement("a");
    linkA.href = mapResult.link;
    linkA.target = "_blank";
    linkA.textContent = "mehr";
    link.appendChild(linkA);
}

function getMapImage(mapName) {
    switch (mapName) {
        case "de_inferno":
            return mapImageInferno;
        case "de_mirage":
            return mapImageMirage;
        case "de_dust2":
            return mapImageDust2;
        case "de_cache":
            return mapImageCache;
        case "de_cbble":
            return mapImageCobblestone;
        case "de_train":
            return mapImageTrain;
        case "de_overpass":
            return mapImageOverpass;
        case "de_vertigo":
            return mapImageVertigo;
        case "de_nuke":
            return mapImageNuke;
        default:
            return "";
    }
}