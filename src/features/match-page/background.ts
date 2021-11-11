import { MessageName, receiveMessage } from '../../util/messages';
import { fetchLineupTableItems } from './fetchLineupTableItems';

receiveMessage(
  MessageName.GetMatchLineups,
  async (payload) => fetchLineupTableItems(payload.matchId),
);
