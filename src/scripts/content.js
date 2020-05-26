const iconUrlBlack = "https://i.ibb.co/1d0kk8g/flashkill-logo-black.png";
const iconUrlWhite = "https://i.ibb.co/7vC3dsf/flashkill-logo-white.png";

insertDataTablesCss();
addFlashkillNavigationButton();

function addFlashkillNavigationButton() {
    const flashkillA = document.createElement("a");
    flashkillA.href = "";
    flashkillA.style = "height: 16px";
    flashkillA.addEventListener("click", () => {
        document.getElementById("flashkill").lastChild.firstChild.firstChild.click();
    })
    flashkillA.onmouseover = () => makeLogoWhite();
    flashkillA.onmouseleave = () => makeLogoBlack();
    flashkillA.href = "javascript:void(0);";

    const flashkillSpan = document.createElement("span");
    const image = buildFlashkillLogo();
    image.id = "flashkillLogo";
    flashkillSpan.appendChild(image);

    const flashkillLi = document.createElement("li");
    const flashkillUl = document.createElement("ul");
    flashkillUl.onmouseover = () => makeLogoWhite();
    flashkillUl.onmouseleave = () => makeLogoBlack();

    const teamSucheLi = document.createElement("li");
    const teamSucheA = document.createElement("a");
    teamSucheA.textContent = "Teamsuche";
    teamSucheA.addEventListener("click", () => {
        const currentActive = document.getElementsByClassName("active");
        if (currentActive != null && currentActive.length > 0) {
            currentActive[0].className = "";
        }
        document.getElementById("flashkill").className = "active";
        makeLogoWhite();
        insertTeamTable(document.getElementById("left"));
    });

    teamSucheLi.appendChild(teamSucheA);
    flashkillUl.appendChild(teamSucheLi);

    flashkillA.appendChild(flashkillSpan);
    flashkillLi.appendChild(flashkillA);
    flashkillLi.appendChild(flashkillUl);
    document.getElementById("nav").appendChild(flashkillLi);

    flashkillLi.id = "flashkill";

    document.getElementById("container").style.width = "1020px"
    var containerChildren = Array.from(document.getElementById("container").children);
    for (var i = 0; i < containerChildren.length; i++) {
        if (containerChildren[i].className != "global-user-ucp") {
            containerChildren[i].style.width = "1020px";
        }
    }
    document.getElementById("left").style.width = "697px";
    const eventElement = document.getElementById("event");
    if (eventElement != null) {
        eventElement.style.width = "697px"; 
        document.getElementsByClassName("event_left")[0].style.width = "483px";
    }

    function buildFlashkillLogo() {
        const image = document.createElement("img");
        image.src = iconUrlBlack;
        image.alt = "flashkill";
        image.height = 13;
        image.className = "center";
        return image;
    }
}

function makeLogoWhite() {
    document.getElementById("flashkillLogo").src = iconUrlWhite;
}

function makeLogoBlack() {
    if (document.getElementById("flashkill").className != "active") {
        document.getElementById("flashkillLogo").src = iconUrlBlack;
    }
}

function insertDataTablesCss() {
    const datatablescss = document.createElement("link");
    datatablescss.setAttribute("rel", "stylesheet");
    datatablescss.setAttribute("type", "text/css");
    datatablescss.setAttribute("href", "https://cdn.datatables.net/v/dt/jq-3.3.1/dt-1.10.18/datatables.min.css");
    document.body.appendChild(datatablescss);
}