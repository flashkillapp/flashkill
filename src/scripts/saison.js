var teamsucheToggled = false;

insertTeamSearch();


function insertTeamSearch() {
    const seasonSelectDivs = Array.from(document.getElementById("content").getElementsByTagName("div")).filter(element => {
        const elements = element.getElementsByTagName("select");
        return elements.length == 1
        && elements[0].getElementsByTagName("option")[0].innerHTML == "Saison 1";
    });

    seasonSelectDivs.forEach(element => {
        insertTeamSearchButton(element);
        const separatorDivAfterSeasonOverview = element.nextSibling.nextSibling.nextSibling;
        insertTeamSearchTable(separatorDivAfterSeasonOverview);
    });
}

function insertTeamSearchButton(element) {
    const teamsucheButton = getTeamSearchButton();
    element.insertBefore(teamsucheButton, element.firstChild);
}

function insertTeamSearchTable(element) {
    const tableDiv = document.createElement("div");
    tableDiv.id = "team-table-div";
    document.getElementById("content").insertBefore(tableDiv, element);
}

function getTeamSearchButton() {
    const teamsucheA = document.createElement("a");
    teamsucheA.innerHTML = "Teamsuche";
    teamsucheA.addEventListener("click", () => {
        const teamtableDiv = document.getElementById("team-table-div");
        if (teamsucheToggled == false) {
            const seasonUrl = window.location.href;
            insertTeamTable(teamtableDiv, seasonUrl);
            teamsucheA.innerHTML = "Teamsuche ausblenden";
            teamsucheToggled = true;
        } else {
            teamtableDiv.innerHTML = "";
            teamsucheA.innerHTML = "Teamsuche";
            teamsucheToggled = false;
        }
    })
    teamsucheA.href = "javascript:void(0);"
    const div = document.createElement("div");
    div.className = "ylinks";
    div.style = `
        float: left;
        margin-top: 2px;
        margin-right: 5px;
    `;
    div.appendChild(teamsucheA);
    return div;
}