import { SleeperPlayer } from '../sleeper/types';

export interface RawCsvRow {
  [key: string]: string | number | undefined;
}

export interface ParsedRankingItem {
  rank: number;
  playerName: string;
  pos: string;
  posRank: number | null;
  team: string | null;
  bye?: number | null;
  tier?: number | null;
  raw: RawCsvRow;
}

export type RosterStatusType = 'free_agent' | 'rostered' | 'reserve' | 'taxi' | 'unassigned';

export interface PlayerRosterStatus {
  type: RosterStatusType;
  rosterId: number | null;
  teamName: string | null;
  ownerDisplayName: string | null;
  ownerUsername: string | null;
  avatarUrl: string | null;
  isMyTeam: boolean;
  isStarter: boolean;
  isReserve: boolean;
  isTaxi: boolean;
}

export interface MatchedRankingPlayer {
  id: string; // Sleeper player_id or fallback "unmatched-<index>"
  rank: number;
  playerName: string;
  originalCsvName: string;
  pos: string;
  posRank: number | null;
  team: string | null;
  tier?: number | null;
  bye?: number | null;
  isMatched: boolean;
  matchScore?: number; // 1.0 for exact, 0.9 for alias, etc.
  sleeperPlayer: SleeperPlayer | null;
  rosterStatus: PlayerRosterStatus;
  rawCsvRow: RawCsvRow;
}

export interface RankingsDataset {
  id: string;
  filename: string;
  uploadedAt: number;
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  freeAgentCount: number;
  rosteredCount: number;
  items: MatchedRankingPlayer[];
}

export interface CsvParseResult {
  success: boolean;
  items: ParsedRankingItem[];
  errors: string[];
  warnings: string[];
  detectedColumns: {
    rankCol?: string;
    nameCol?: string;
    posCol?: string;
    teamCol?: string;
    byeCol?: string;
    tierCol?: string;
  };
}
