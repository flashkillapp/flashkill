addTeamsButton();

function addTeamsButton() {
    const headerNavUl = document.querySelector("#header-nav > nav > ul");
    const nextLi = document.querySelector("#header-nav > nav > ul > li:nth-child(3)");
    if (!headerNavUl || !nextLi) {
        return;
    }

    const teamsA = document.createElement("a");
    teamsA.href = "https://liga.99damage.de/de/leagues/teams";
    teamsA.textContent = "Teams";
    const teamsLi = document.createElement("li");
    teamsLi.appendChild(teamsA);

    headerNavUl.insertBefore(teamsLi, nextLi);
}