import { MessageNames, receiveMessage } from '../../util/messages';

import { fetchFaceitInfo } from './fetchFaceitInfo';
import { fetchPlayerInfo } from './fetchPlayerInfo';
import { fetchDivisionsMatches } from './fetchDivisionMatches';

receiveMessage(
  MessageNames.GetDivisionMatches,
  async (payload) => (
    fetchDivisionsMatches(payload.divisions, payload.teamShortName, payload.teamId)
  ),
);

receiveMessage(
  MessageNames.GetPlayerInfo,
  async (payload) => fetchPlayerInfo(payload.steamId64),
);

receiveMessage(
  MessageNames.GetFaceitInfos,
  async (payload) => (
    Promise.all(payload.steamIds64.map(fetchFaceitInfo))
  ),
);
