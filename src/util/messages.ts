import { LineupTableItem } from '../components/LineupTables';
import { MatchTableItem } from '../components/MatchesTable';
import { MemberTableItem } from '../components/MemberTable';
import { Division, FaceitInfo, Player } from '../model';

export enum MessageName {
  GetFaceitInfos = 'getFaceitInfos',
  GetDivisionMatches = 'getDivisionMatches',
  GetPlayerInfos = 'getPlayerInfos',
  GetMatchLineups = 'getMatchLineups',
}

interface Message {
  payload: unknown;
  response: unknown;
}

interface Messages extends Partial<Record<MessageName, Message>> {
  [MessageName.GetDivisionMatches]: {
    payload: {
      teamShortName: string;
      divisions: Division[];
      teamId: number;
    };
    response: MatchTableItem[];
  };
  [MessageName.GetFaceitInfos]: {
    payload: {
      steamIds64: string[];
    };
    response: Array<FaceitInfo | null>;
  };
  [MessageName.GetPlayerInfos]: {
    payload: {
      players: Player[];
    };
    response: MemberTableItem[];
  };
  [MessageName.GetMatchLineups]: {
    payload: {
      matchId: number;
    };
    response: LineupTableItem[][] | null;
  };
}

type MessageTypes = keyof Messages;
type MessagePayload<T extends MessageTypes> = Messages[T]['payload']
type MessageResponse<T extends MessageTypes> = Messages[T]['response']
type MessageCallback<T extends MessageTypes> = (response: MessageResponse<T>) => void;

export const sendMessage = <T extends MessageTypes>(
  name: T,
  payload: MessagePayload<T>,
  callback: MessageCallback<T>,
): void => {
  chrome.runtime.sendMessage(
    { name, payload },
    callback,
  );
};

export const receiveMessage = <T extends MessageTypes>(
  name: T,
  responder: (payload: MessagePayload<T>) => Promise<MessageResponse<T>>,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: { name: T, payload: MessagePayload<T> }, _, callback: MessageCallback<T>): boolean => {
      if (request.name !== name) return false;

      responder(request.payload)
        .then(callback)
        .catch(console.log);

      return true;
    },
  );
};
