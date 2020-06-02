addTeamsButton();

function addTeamsButton() {
    const nextLi = document.querySelector("#header-nav > nav > ul > li:nth-child(3)");
    if (!nextLi) {
        return;
    }

    const teamsA = document.createElement("a");
    teamsA.href = "https://liga.99damage.de/de/leagues/teams";
    teamsA.textContent = "Teams";
    const teamsLi = document.createElement("li");
    teamsLi.appendChild(teamsA);

    nextLi.parentNode.insertBefore(teamsLi, nextLi);
}