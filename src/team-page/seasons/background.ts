
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "apiMatches") {
            getApiMatches(request.teamId).then(matches => {
                sendResponse(matches);
            })
            return true;
        }
    }
);

async function getApiMatches(teamId: number) {
    return fetch(`https://flashkill.smatify.com/api/team/${teamId}`).then(res => {
        return res.json();
    });
}
