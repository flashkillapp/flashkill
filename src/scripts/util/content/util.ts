const mapImageInferno = "https://cdn0.gamesports.net/map_thumbs_big/90.png?1487240877";
const mapImageMirage = "https://cdn0.gamesports.net/map_thumbs_big/94.jpg?1543845869";
const mapImageDust2 = "https://cdn0.gamesports.net/map_thumbs_big/88.png?1525340267";
const mapImageCache = "https://cdn0.gamesports.net/map_thumbs_big/127.jpg?0";
const mapImageCobblestone = "https://cdn0.gamesports.net/map_thumbs_big/293.jpg?0";
const mapImageTrain = "https://cdn0.gamesports.net/map_thumbs_big/89.jpg?0";
const mapImageOverpass = "https://cdn0.gamesports.net/map_thumbs_big/295.jpg?0";
const mapImageVertigo = "https://cdn0.gamesports.net/map_thumbs_big/417.jpg?1554321447";
const mapImageNuke = "https://cdn0.gamesports.net/map_thumbs_big/91.jpg?1457434550";


export function insertDataTablesCss() : void {
    const datatablescss = document.createElement("link");
    datatablescss.setAttribute("rel", "stylesheet");
    datatablescss.setAttribute("type", "text/css");
    datatablescss.setAttribute("href", "https://cdn.datatables.net/v/dt/jq-3.3.1/dt-1.10.18/datatables.min.css");
    document.body.appendChild(datatablescss);
}

export function formatDate(date: string) : string {
    //Gets date in yyyy-mm-dd format
    //Returns date in dd.mm.yy format
    const year = date.substring(2, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    return day + "." + month + "." + year;
}

export function getMapImage(mapName: string) : string {
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
