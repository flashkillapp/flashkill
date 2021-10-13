import { TeamPageRequestTypes } from './background';
import {
  getTeamId, getTeamUrlName, getCurrentDivision, getPreviousDivisions,
} from './selectors';
import { notNull } from '../util/notNull';
import { Division, AjaxMatch } from '../model';

type DivisionMatchDetails = Array<[Division, Array<[string, AjaxMatch | null]>]>;

const printMatchDetails = (divisionMatchDetails: DivisionMatchDetails): void => (
  divisionMatchDetails.forEach(([division, matchTuples]) => {
    console.log(division.name);
    console.log(matchTuples.map(([, ajax]) => ajax));
  })
);

const requestMatchDetails = (divisionTuples: [Division, string[]][]): void => (
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: TeamPageRequestTypes.QueryMatchesDetails,
      divisionTuples,
    },
    printMatchDetails,
  )
);

export const addMatchTable = (): void => {
  // get team id
  const teamId = getTeamId();
  const teamUrlName = getTeamUrlName();

  if (teamId === null || teamUrlName === null) {
    console.log('Could not read team id or name');
    return;
  }

  // get all division links
  const divisions = [
    getCurrentDivision(),
    ...getPreviousDivisions(),
  ]
    .filter(notNull)
    .filter(({ name }) => !name.includes('Relegation'));

  // for each division get all match links
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: TeamPageRequestTypes.QueryDivisionMatches,
      divisions,
    },
    (divisionTuples: [Division, string[]][]) => (
      requestMatchDetails(
        divisionTuples.map(([division, links]) => ([
          division,
          links.filter((link) => link.includes(teamUrlName)),
        ])),
      )
    ),
  );

  // for each match, get details
  // display team matches
};
