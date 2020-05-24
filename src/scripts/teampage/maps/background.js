const ALL_MAPS = [
    "de_inferno",
    "de_mirage",
    "de_dust2",
    "de_cache",
    "de_cbble",
    "de_train",
    "de_overpass",
    "de_vertigo",
    "de_nuke"
]

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryMapInfosPerSeason") {
            getMapInfosPerSeason(request.seasons, request.teamName, request.teamShorthand).then(mapInfos => {
                sendResponse(mapInfos);
            }).catch(console.log);
            return true;  // Will respond asynchronously.
        }
    }
);

async function getMapInfosPerSeason(seasons, teamName, teamShorthand) {
    return Promise.all(seasons.map(async season => {
        const matches = await getMatches(season.seasonInformation, teamName, teamShorthand);
        return {
            seasonName: season.seasonName,
            mapInfos: calcMapInfos(matches.filter(match => match.mapVoteTeam1 != null && match.mapVoteTeam2 != null))
        }
    }));
}

function calcMapInfos(matches) {
    const matchesThatGotPlayed = matches.filter(match => match.mapResults.length > 0);
    const mapResultsOfAllMatches = matchesThatGotPlayed.flatMap(match => match.mapResults);
    //TODO: spaeter wieder einbauen
    // return getAllMapsThatGotPickedOrBanned(matches).map(mapOfInterest => {
        return ALL_MAPS.map(mapOfInterest => {
        const mapResultsWithThisMap = mapResultsOfAllMatches.filter(mapResult => mapResult.map == mapOfInterest);
        const countMapPlayed = mapResultsWithThisMap.length;
        const countWins = mapResultsWithThisMap.filter(mapResult => parseInt(mapResult.scoreTeam1) > parseInt(mapResult.scoreTeam2)).length;
        const countLosses = mapResultsWithThisMap.filter(mapResult => parseInt(mapResult.scoreTeam1) < parseInt(mapResult.scoreTeam2)).length;
        const countPicked = matchesThatGotPlayed.filter(match => match.mapVoteTeam1.pick == mapOfInterest).length;
        const countPickable = matchesThatGotPlayed.filter(match =>
            match.mapVoteTeam2.firstBan != mapOfInterest
            && match.mapVoteTeam2.secondBan != mapOfInterest
            && match.mapVoteTeam1.firstBan != mapOfInterest
            && match.mapVoteTeam1.secondBan != mapOfInterest).length;
        const countFirstBan = matchesThatGotPlayed.filter(match => match.mapVoteTeam1.firstBan == mapOfInterest).length;
        const countSecondBan = matchesThatGotPlayed.filter(match => match.mapVoteTeam1.secondBan == mapOfInterest).length;
        const countFirstBanable = matchesThatGotPlayed.filter(match => mapWasFirstBanable(match, mapOfInterest)).length;
        const countSecondBanable = matchesThatGotPlayed.filter(match => mapWasSecondBanable(match, mapOfInterest)).length;
        return {
            map: mapOfInterest,
            countMapPlayed,
            countWins,
            countLosses,
            countPicked,
            countPickable,
            countFirstBan,
            countSecondBan,
            countFirstBanable,
            countSecondBanable
        }
    });
}

// function getAllMapsThatGotPickedOrBanned(matches) {
//     const pickedOrBannedMap = matches.flatMap(match => {
//         return [
//             match.mapVoteTeam1.pick,
//             match.mapVoteTeam1.firstBan,
//             match.mapVoteTeam1.secondBan
//         ]
//     });
//     return [...new Set(pickedOrBannedMap)];
// }

function mapWasFirstBanable(match, map) {
    if (match.mapVoteTeam2.firstBan == map && match.mapVoteTeam2.didFirstBan) {
        return false;
    }
    return true;
}

function mapWasSecondBanable(match, map) {
    if (match.mapVoteTeam1.firstBan == map || match.mapVoteTeam2.firstBan == map) {
        return false;
    }
    if (match.mapVoteTeam2.secondBan == map && match.mapVoteTeam2.didTwoBansFirst) {
        return false;
    }
    return true;
}