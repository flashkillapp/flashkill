
const mapImageInferno = "https://cdn0.gamesports.net/map_thumbs_big/90.png?1487240877";
const mapImageMirage = "https://cdn0.gamesports.net/map_thumbs_big/94.jpg?1543845869";
const mapImageDust2 = "https://cdn0.gamesports.net/map_thumbs_big/88.png?1525340267";
const mapImageCache = "https://cdn0.gamesports.net/map_thumbs_big/127.jpg?0";
const mapImageCobblestone = "https://cdn0.gamesports.net/map_thumbs_big/293.jpg?0";
const mapImageTrain = "https://cdn0.gamesports.net/map_thumbs_big/89.jpg?0";
const mapImageOverpass = "https://cdn0.gamesports.net/map_thumbs_big/295.jpg?0";
const mapImageVertigo = "https://cdn0.gamesports.net/map_thumbs_big/417.jpg?1554321447";
const mapImageNuke = "https://cdn0.gamesports.net/map_thumbs_big/91.jpg?1457434550";

const teamIdRegex = /leagues\/teams\/([0-9]+)-/;
const teamId = window.location.href.match(teamIdRegex)[1];

class Season {
    constructor(name, startDate, endDate, id) {
        this.name = name;
        this.startDate = Date.parse(startDate);
        this.endDate = Date.parse(endDate);
        this.id = id;
        this.matches = [];
    }
}

const seasons = [
    new Season('Saison 15', '26 May 2020', '15 Aug 2020', 1513),
    new Season('Saison 14', '05 Feb 2020', '09 May 2020', 1460),
    new Season('Saison 13', '25 Sep 2019', '21 Dec 2019', 1418),
    new Season('Saison 12', '05 Jun 2019', '16 Aug 2019', 1360),
    new Season('Saison 11', '27 Feb 2019', '18 May 2019', 1236),
    new Season('Saison 10', '26 Sep 2018', '03 Dec 2018', 989),
    new Season('Saison 9', '25 May 2018', '12 Aug 2018', 798),
    new Season('Saison 8', '07 Feb 2018', '22 Apr 2018', 622),
    new Season('Saison 7', '05 Oct 2017', '03 Dec 2017', 607),
    new Season('Saison 6', '14 Jun 2017', '08 Sep 2017', 438),
    new Season('Saison 5', '09 Mar 2017', '13 May 2017', 282),
    new Season('Saison 4', '23 Sep 2016', '22 Jan 2017', 243),
    new Season('Saison 3', '15 Mar 2016', '04 Sep 2016', 113),
    new Season('Saison 2', '07 Nov 2015', '07 Feb 2016', 67),
    new Season('Saison 1', '09 Aug 2015', '25 Oct 2015', 65),
];

insertDataTablesCss();

insertMatchResults();

function insertMatchResults() {
    chrome.runtime.sendMessage(
        { contentScriptQuery: "apiMatches", teamId },
        matches => {
            for (matchEntry in matches) {
                let match = matches[matchEntry];
                if (match.team1 == undefined) {
                    continue;
                }
                match = makeHomeMatch(match, teamId);
                const season = seasons.find(season => season.id == match.season)
                if (season != undefined) season.matches.push(match);
            }
            insertSeasons(seasons);
        }
    );
}

function insertSeasons(seasons) {
    const activeSeasons = Array.from(seasons).filter(season => season.matches.length > 0);

    const parentDiv = document.querySelector("#container > main > section.boxed-section.hybrid");
    const resultsDiv = document.createElement("div");
    resultsDiv.id = "flashkill-results";
    parentDiv.appendChild(resultsDiv);

    if (activeSeasons.length > 0) {
        activeSeasons.forEach(season => {
            insertSeasonResults(season);
        });
    }
}

function insertSeasonResults(season) {
    const dividerDiv = document.createElement("div");
    const dividerBr = document.createElement("br");
    dividerDiv.appendChild(dividerBr);

    const seasonDiv = document.createElement("div");
    seasonDiv.className = "section-content";
    const seasonHeader = document.createElement("div");
    seasonHeader.textContent = season.name;
    seasonHeader.style = "color: black; font-size: 16px; font-weight: bold";
    const providedByFlashkillSpan = document.createElement("a");
    providedByFlashkillSpan.style = "color: grey; float: right; font-size: 10px; font-weight: normal; font-style: italic";
    providedByFlashkillSpan.textContent = "provided by flashkill";
    providedByFlashkillSpan.href = "https://github.com/flashkillapp/flashkill";
    providedByFlashkillSpan.target = "_blank";
    seasonHeader.appendChild(providedByFlashkillSpan);
    seasonDiv.appendChild(seasonHeader);

    matches = season.matches;
    const table = document.createElement("table");
    table.className = "display";
    table.id = "matches-table" + season.id;
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
    matches.forEach(match => {
        if (match.maps.length > 0) {
            match.maps.forEach(map => {
                var row = body.insertRow(0);
                console.log(match, match.team1, match.team2);
                fillMapRow(row, match.id, map, match.team1, match.team2, match.createdAt);
            });
        }
    });

    seasonDiv.appendChild(table);

    const seasonResultsDiv = document.getElementById("flashkill-results");
    seasonResultsDiv.appendChild(dividerDiv);
    seasonResultsDiv.appendChild(seasonDiv);

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

function fillMapRow(row, matchId, map, team1, team2, matchDate) {
    const dateC = row.insertCell(-1);
    const team1C = row.insertCell(-1);
    const score1C = row.insertCell(-1);
    const score2C = row.insertCell(-1);
    const team2C = row.insertCell(-1);
    const mapC = row.insertCell(-1);
    const linkC = row.insertCell(-1);
    dateC.setAttribute("data-sort", matchDate.substring(0, 10));
    dateC.textContent = formatDate(matchDate.substring(0, 10));
    const team1A = document.createElement("a");
    team1A.textContent = team1.name;
    team1A.href = `https://liga.99damage.de/de/leagues/teams/${team1.id}`;
    team1A.target = "_blank";
    team1C.appendChild(team1A);
    const team2A = document.createElement("a");
    team2A.textContent = team2.name;
    team2A.href = `https://liga.99damage.de/de/leagues/teams/${team2.id}`;
    team2A.target = "_blank";
    team2C.appendChild(team2A);
    score1C.textContent = map.score1;
    score2C.textContent = map.score2;
    mapC.textContent = map.map;
    const mapImageLink = getMapImage(map.map);
    mapC.style = `
        background-image:url(${mapImageLink});
        text-align:center;
        background-size:cover;
        color:#fff;
        text-shadow:0 0 4px #000, 0px 0 4px #000, 0px 0 3px #000;
    `;
    const linkA = document.createElement("a");
    linkA.href = `https://liga.99damage.de/de/leagues/matches/${matchId}`;
    linkA.target = "_blank";
    linkA.textContent = "mehr";
    linkC.appendChild(linkA);
}

function makeHomeMatch(match, teamId) {
    if (match.team1.id != teamId) {
        const tmpTeam = match.team1;
        match.team1 = match.team2;
        match.team2 = tmpTeam;
        match.maps.forEach(map => {
            const tmpScore = map.score1;
            map.score1 = map.score2;
            map.score2 = tmpScore;
        });
    }
    return match;
}
