export interface Player {
    id: number;
    name: string;
    role: string;
    steamId64?: string;
    status?: string;
}

export interface LineupPlayer {
    id: number;
    name: string;
    steamId64: string;
}
