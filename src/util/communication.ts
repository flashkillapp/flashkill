import { Division, DivisionMatches, FaceitInfo, PlayerInfo } from '../model';

export enum MessageNames {
  QueryPlayerInfo = 'queryPlayerInfo',
  QueryFaceitInfos = 'queryFaceitInfos',
  QueryDivisionsMatches = 'queryDivisionsMatches',
  QueryOther = 'queryOther',
}

interface Message {
  payload: unknown;
  response: unknown;
}

interface Messages extends Record<MessageNames, Message> {
  [MessageNames.QueryDivisionsMatches]: {
    payload: {
      teamShortName: string;
      divisions: Division[];
    };
    response: DivisionMatches[];
  };
  [MessageNames.QueryFaceitInfos]: {
    payload: {
      steamIds64: string[];
    };
    response: Array<FaceitInfo | null>;
  };
  [MessageNames.QueryPlayerInfo]: {
    payload: {
      steamId64: string;
    };
    response: PlayerInfo | null;
  };
}

type MessageTypes = keyof Messages;
type MessagePayload<T extends MessageTypes> = Messages[T]['payload']
type MessageResponse<T extends MessageTypes> = Messages[T]['response']


export const sendMessage = <T extends MessageTypes>(
  name: T,
  payload: MessagePayload<T>,
  callback: (response: MessageResponse<T>) => void,
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
    (request: { name: T, payload: MessageResponse<T> }, _, callback): boolean => {
      if (request.name !== name) return false;

      responder(request.payload)
        .then(callback)
        .catch(console.log);

      return true;
    },
  );
};
