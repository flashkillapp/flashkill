const DEFAULT_SEASON_URL = "https://csgo.99damage.de/de/leagues/99dmg/1360-saison-12";

function insertTeamTable(container, seasonUrl = DEFAULT_SEASON_URL) {
    container.textContent = "Teamtabelle wird geladen...";
    chrome.runtime.sendMessage(
        { contentScriptQuery: "queryTeams", seasonUrl },
        teams => {
            const table = document.createElement("table");
            table.className = "display";
            table.id = "team-table";
            const header = table.createTHead();
            const headerRow = header.insertRow(0);
            const teamNameCell = headerRow.insertCell(-1);
            teamNameCell.outerHTML = "<th>Teamname</th>";
            const divisionCell = headerRow.insertCell(-1);
            divisionCell.outerHTML = "<th>Division</th>";
            const mapsWonCell = headerRow.insertCell(-1);
            mapsWonCell.outerHTML = "<th>Siege</th>";
            const mapsLostCell = headerRow.insertCell(-1);
            mapsLostCell.outerHTML = "<th>Niederl.</th>";
            const roundsCell = headerRow.insertCell(-1);
            roundsCell.outerHTML = "<th>Runden</th>";
            roundsCell.colSpan = "2";

            const body = table.createTBody();
            Array.from(teams).forEach(entry => {
                const row = body.insertRow(0);
                const team = row.insertCell(-1);
                const teamA = document.createElement("a");
                teamA.textContent = entry.name;
                teamA.target = "_blank";
                teamA.href = entry.link;
                team.appendChild(teamA);
                const division = row.insertCell(-1);
                const divisionA = document.createElement("a");
                divisionA.textContent = entry.divisionName;
                divisionA.target = "_blank";
                divisionA.href = entry.divisionLink;
                division.appendChild(divisionA);
                const mapsWon = row.insertCell(-1);
                mapsWon.textContent = entry.mapsWon;
                const mapsLost = row.insertCell(-1);
                mapsLost.textContent = entry.mapsLost;
                const rounds = row.insertCell(-1);
                rounds.textContent = entry.rounds
            })
            container.textContent = "";
            container.appendChild(table);
            $('#team-table').DataTable({
                pageLength: 50,
                columnDefs: [
                    {
                        targets: [0, 1],
                        className: 'dt-left'
                    },
                    {
                        targets: [2, 3, 4],
                        className: 'dt-body-center'
                    },
                    {
                        targets: [4],
                        sortable: false
                    },
                    {
                        targets: [0],
                        width: "200px"
                    }
                ],
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/German.json",
                }
            });
        }
    );
}