export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  avatar: string | null;
  total_rosters: number;
  roster_positions: string[];
  previous_league_id: string | null;
  sport: string;
  season_type: string;
  settings?: {
    num_teams?: number;
    playoff_teams?: number;
    playoff_week_start?: number;
    taxi_slots?: number;
    reserve_slots?: number;
    waiver_type?: number;
    waiver_budget?: number;
    type?: number; // 0: redraft, 1: keeper, 2: dynasty
    trade_deadline?: number;
    [key: string]: any;
  };
  scoring_settings?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface SleeperUser {
  user_id: string;
  username?: string | null;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
    avatar?: string;
    allow_pn?: string;
    [key: string]: any;
  };
  is_owner?: boolean;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  reserve: string[] | null;
  taxi: string[] | null;
  co_owners?: string[] | null;
  settings?: {
    wins?: number;
    losses?: number;
    ties?: number;
    fpts?: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    waiver_budget_used?: number;
    waiver_position?: number;
    total_moves?: number;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position: string;
  fantasy_positions?: string[];
  team: string | null;
  years_exp?: number;
  age?: number;
  status?: string; // "Active", "Injured Reserve", etc.
  injury_status?: string | null; // "Questionable", "Out", "IR", "Doubtful", "PUP", etc.
  injury_body_part?: string | null;
  injury_notes?: string | null;
  search_rank?: number;
  hashtag?: string;
  depth_chart_order?: number | null;
  depth_chart_position?: string | null;
  number?: number | null;
}

export interface ProcessedRoster {
  rosterId: number;
  ownerId: string | null;
  teamName: string;
  ownerDisplayName: string;
  ownerUsername: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  waiverBudgetRemaining?: number;
  waiverPosition?: number;
  players: string[];
  starters: string[];
  reserve: string[];
  taxi: string[];
  isMyTeam?: boolean;
}

export interface SavedLeague {
  leagueId: string;
  name: string;
  season: string;
  totalTeams: number;
  avatarUrl: string | null;
  myRosterId?: number | null;
  lastConnectedAt: number;
}

export interface PlayerCacheMetadata {
  updatedAt: number;
  playerCount: number;
  version: string;
}
