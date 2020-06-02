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
console.log("loaded");
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryMapInfosPerSeason") {
            getMapInfosPerSeason(request.seasons, request.teamId).then(mapInfos => {
                sendResponse(mapInfos);
            }).catch(console.log);
            return true;  // Will respond asynchronously.
        }
    }
);

async function getMapInfosPerSeason(seasons, teamId) {
    return Promise.all(seasons.filter(season => season.matches.length > 0).map(async season => {
        const matchMapVotes = await getMatchMapVotes(season.matches, teamId);
        makeRequestedTeamTeam1(matchMapVotes, teamId);
        return {
            seasonName: season.name,
            mapInfos: calcMapInfos(matchMapVotes.filter(matchMapVote => matchMapVote.mapVoteTeam1 != null && matchMapVote.mapVoteTeam2 != null))
        }
    }));
}

function makeRequestedTeamTeam1(matchMapVotes, teamId) {
    matchMapVotes.filter(matchMapVote => matchMapVote.mapVoteTeam1.teamId != teamId).forEach(matchMapVote => {
        const tempMapVoteTeam1 = matchMapVote.mapVoteTeam1;
        matchMapVote.mapVoteTeam1 = matchMapVote.mapVoteTeam2;
        matchMapVote.mapVoteTeam2 = tempMapVoteTeam1;
    });
}

function calcMapInfos(matchMapVotes) {
    const mapResultsOfAllMatches = matchMapVotes.flatMap(matchMapVote => matchMapVote.match.maps);
    //TODO: spaeter wieder einbauen
    // return getAllMapsThatGotPickedOrBanned(matches).map(mapOfInterest => {
    return ALL_MAPS.map(mapOfInterest => {
        const mapResultsWithThisMap = mapResultsOfAllMatches.filter(mapResult => mapResult.map == mapOfInterest);
        const countMapPlayed = mapResultsWithThisMap.length;
        const countWins = mapResultsWithThisMap.filter(mapResult => parseInt(mapResult.score1) > parseInt(mapResult.score2)).length;
        const countLosses = mapResultsWithThisMap.filter(mapResult => parseInt(mapResult.score1) < parseInt(mapResult.score2)).length;
        const countPicked = matchMapVotes.filter(match => match.mapVoteTeam1.pick == mapOfInterest).length;
        const countPickable = matchMapVotes.filter(match =>
            match.mapVoteTeam2.firstBan != mapOfInterest
            && match.mapVoteTeam2.secondBan != mapOfInterest
            && match.mapVoteTeam1.firstBan != mapOfInterest
            && match.mapVoteTeam1.secondBan != mapOfInterest).length;
        const countFirstBan = matchMapVotes.filter(match => match.mapVoteTeam1.firstBan == mapOfInterest).length;
        const countSecondBan = matchMapVotes.filter(match => match.mapVoteTeam1.secondBan == mapOfInterest).length;
        const countFirstBanable = matchMapVotes.filter(match => mapWasFirstBanable(match, mapOfInterest)).length;
        const countSecondBanable = matchMapVotes.filter(match => mapWasSecondBanable(match, mapOfInterest)).length;
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