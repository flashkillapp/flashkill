import { MessageName, receiveMessage } from '../../util/messages';
import { fetchLineupPlayers } from './fetchLineupTableItems';

receiveMessage(
  MessageName.GetMatchLineups,
  async (payload) => fetchLineupPlayers(payload.matchId),
);
