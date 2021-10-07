import { FaceitInfo } from './FaceitInfo';

export interface PlayerInfo {
    steamId: string;
    steamId64: string;
    faceitInfo: FaceitInfo | null;
    steamName: string | null;
}
