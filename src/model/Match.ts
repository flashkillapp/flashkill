
interface StatusStu {
    status: number;
    key: string;
    msg: string;
}

interface AjaxPlayer {
    id: number;
    name: string;
    link: string;
    picture: string;
    ready: number;
    standin: number;
    gameaccounts: string[];
    status_stu: StatusStu;
}

type AjaxLineup = AjaxPlayer[];

export enum AjaxMap {
  DeAncient = 0,
  DeDust2 = 88,
  DeInferno = 90,
  DeMirage = 94,
  DeNuke = 91,
  DeOverpass = 295,
  DeVertigo = 417,
}

export interface DraftMap {
    id: AjaxMap;
    title: string;
    picture: string;
}

interface DraftSequence {
    seq: number[][];
    cnt: number;
    req: number;
}

interface DbStats {
    qrys_read: number;
    qrys_write: number;
    totaltime: number;
}

export interface AjaxMatch {
    match_id: number;
    status: string;
    time: number;
    score_1: number;
    score_2: number;
    user_relation: unknown;
    scheduling_mode: string;
    scheduling_replytime: number;
    match_lineup_mode: string;
    lineups: AjaxLineup[];
    lineups_readyup_enabled: number;
    lineup_submit_time: number;
    lineup_readyup_time: number;
    lineup_readyup_time_start: number;
    lineups_ready_1: boolean;
    lineups_ready_2: boolean;
    draft_mode: string;
    draft_type: string;
    draft_status: number;
    draft_active: boolean;
    draft_maps: DraftMap[];
    draft_sequence: DraftSequence;
    draft_mapvoting_bans: AjaxMap[];
    draft_mapvoting_picks: AjaxMap[];
    draft_opp1: string;
    draft_opp2: string;
    hosting_mode: string;
    hosting_platform: string;
    hosting_status: number;
    hosting_game: number;
    hosting_time_start: number;
    hosting_access_watch: boolean;
    reporting: string;
    reporting_time_start: number;
    overview: string[];
    show: string[];
    db_stats: DbStats;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
}

export interface MapScore {
  score1: number;
  score2: number;
}

export interface Match {
  matchId: number;
  time: number;
  team1: Team;
  team2: Team;
  score1: number;
  score2: number;
  scores: MapScore[];
  draftMapvotingBans: AjaxMap[];
  draftMapvotingPicks: AjaxMap[];
  draftMaps: DraftMap[];
  draftOpp1: string;
  draftOpp2: string;
}
