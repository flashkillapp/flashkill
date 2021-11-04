interface FaceitGame {
    skill_level: number;
    faceit_elo: number;
}

interface FaceitGames {
    csgo: FaceitGame;
}

export interface FaceitInfo {
    nickname: string;
    games: FaceitGames;
}
