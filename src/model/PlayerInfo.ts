import { ID } from "@node-steam/id";
import { FaceitInfo } from "./FaceitInfo";

export interface PlayerInfo {
    steamId: ID;
    faceitInfo: FaceitInfo;
    steamName: string;
}
