
export enum SeasonRequestType {
    QueryApiMatches = "queryApiMatches",
}

export interface ApiMatchesRequest {
    contentScriptQuery: typeof SeasonRequestType.QueryApiMatches;
    teamId: number;
}

type SeasonRequest = ApiMatchesRequest;

chrome.runtime.onMessage.addListener(
    function (request: SeasonRequest, sender, sendResponse) : boolean {
        switch (request.contentScriptQuery) {
            case SeasonRequestType.QueryApiMatches: {
                getApiMatches(request.teamId).then(matches => {
                    sendResponse(matches);
                })
                return true;
            }
            
            default:
                return false;
        }
    }
);

async function getApiMatches(teamId: number) {
    return fetch(`https://flashkill.smatify.com/api/team/${teamId}`).then(res => {
        return res.json();
    });
}
