
function insertDataTablesCss() {
    const datatablescss = document.createElement("link");
    datatablescss.setAttribute("rel", "stylesheet");
    datatablescss.setAttribute("type", "text/css");
    datatablescss.setAttribute("href", "https://cdn.datatables.net/v/dt/jq-3.3.1/dt-1.10.18/datatables.min.css");
    document.body.appendChild(datatablescss);
}

function formatDate(date) {
    //Gets date in yyyy-mm-dd format
    //Returns date in dd.mm.yy format
    const year = date.substring(2, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    return day + "." + month + "." + year;
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
