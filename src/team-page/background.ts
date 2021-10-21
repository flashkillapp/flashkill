import { MessageNames, receiveMessage } from '../util/messages';

import { fetchFaceitInfo } from './fetchFaceitInfo';
import { fetchDivisionsMatches } from './fetchDivisionMatches';
import { fetchPlayerInfo } from './fetchPlayerInfo';

receiveMessage(
  MessageNames.GetDivisionMatches,
  async (payload) => (
    fetchDivisionsMatches(payload.divisions, payload.teamShortName, payload.teamId)
  ),
);

receiveMessage(
  MessageNames.GetPlayerInfos,
  async (payload) => Promise.all(
    payload.players.map((player) => fetchPlayerInfo(player)),
  ),
);

receiveMessage(
  MessageNames.GetFaceitInfos,
  async (payload) => (
    Promise.all(payload.steamIds64.map(fetchFaceitInfo))
  ),
);
