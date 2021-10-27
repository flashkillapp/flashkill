import { MessageName, receiveMessage } from '../../util/messages';

import { fetchFaceitInfo } from './fetchFaceitInfo';
import { fetchPlayerInfo } from './fetchPlayerInfo';
import { fetchDivisionsMatches } from './fetchDivisionMatches';

receiveMessage(
  MessageName.GetDivisionMatches,
  async (payload) => (
    fetchDivisionsMatches(payload.divisions, payload.teamShortName, payload.teamId)
  ),
);

receiveMessage(
  MessageName.GetPlayerInfo,
  async (payload) => fetchPlayerInfo(payload.steamId64),
);

receiveMessage(
  MessageName.GetFaceitInfos,
  async (payload) => (
    Promise.all(payload.steamIds64.map(fetchFaceitInfo))
  ),
);
