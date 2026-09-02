import { SleeperPlayer, ProcessedRoster } from '../sleeper/types';
import { 
  ParsedRankingItem, 
  MatchedRankingPlayer, 
  PlayerRosterStatus, 
  RankingsDataset 
} from './types';
import { 
  normalizePlayerName, 
  normalizeTeamAbbr, 
  normalizePosition, 
  getPlayerAliases, 
  TEAM_DEFENSE_MAP 
} from './nameNormalizer';

interface PlayerIndex {
  byNameAndPos: Map<string, SleeperPlayer>;
  byNameAndTeam: Map<string, SleeperPlayer>;
  byName: Map<string, SleeperPlayer[]>;
  defenses: Map<string, SleeperPlayer>;
}

/**
 * Builds fast lookup maps from the Sleeper player database
 */
export function buildSleeperPlayerIndex(players: Record<string, SleeperPlayer> | null): PlayerIndex {
  const byNameAndPos = new Map<string, SleeperPlayer>();
  const byNameAndTeam = new Map<string, SleeperPlayer>();
  const byName = new Map<string, SleeperPlayer[]>();
  const defenses = new Map<string, SleeperPlayer>();

  if (!players) {
    return { byNameAndPos, byNameAndTeam, byName, defenses };
  }

  for (const p of Object.values(players)) {
    if (!p) continue;
    
    // Check if player is a Team Defense
    const isDef = p.position === 'DEF' || (p.fantasy_positions && p.fantasy_positions.includes('DEF'));
    if (isDef) {
      if (p.player_id) defenses.set(p.player_id.toUpperCase(), p);
      if (p.team) defenses.set(p.team.toUpperCase(), p);
      if (p.last_name) defenses.set(normalizePlayerName(p.last_name), p);
      if (p.full_name) defenses.set(normalizePlayerName(p.full_name), p);
      continue;
    }

    const fullName = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim();
    if (!fullName) continue;

    const normName = normalizePlayerName(fullName);
    const pos = p.position ? p.position.toUpperCase() : '';
    const team = p.team ? normalizeTeamAbbr(p.team) : null;

    if (normName) {
      // Index by name + pos
      if (pos) {
        byNameAndPos.set(`${normName}_${pos}`, p);
      }

      // Index by name + team
      if (team) {
        byNameAndTeam.set(`${normName}_${team}`, p);
      }

      // Index by name list
      const list = byName.get(normName) || [];
      list.push(p);
      byName.set(normName, list);
    }
  }

  return { byNameAndPos, byNameAndTeam, byName, defenses };
}

/**
 * Resolves the Sleeper roster status for a given player ID
 */
export function resolvePlayerRosterStatus(
  playerId: string | null,
  rosters: ProcessedRoster[],
  myRosterId: number | null
): PlayerRosterStatus {
  if (!playerId || !rosters || rosters.length === 0) {
    return {
      type: 'free_agent',
      rosterId: null,
      teamName: null,
      ownerDisplayName: null,
      ownerUsername: null,
      avatarUrl: null,
      isMyTeam: false,
      isStarter: false,
      isReserve: false,
      isTaxi: false,
    };
  }

  for (const roster of rosters) {
    const isStarter = Boolean(roster.starters && roster.starters.includes(playerId));
    const isReserve = Boolean(roster.reserve && roster.reserve.includes(playerId));
    const isTaxi = Boolean(roster.taxi && roster.taxi.includes(playerId));
    const isRostered = Boolean(roster.players && roster.players.includes(playerId)) || isStarter || isReserve || isTaxi;

    if (isRostered) {
      let type: PlayerRosterStatus['type'] = 'rostered';
      if (isReserve) type = 'reserve';
      else if (isTaxi) type = 'taxi';

      const isMyTeam = (myRosterId !== null && roster.rosterId === myRosterId) || Boolean(roster.isMyTeam);

      return {
        type,
        rosterId: roster.rosterId,
        teamName: roster.teamName,
        ownerDisplayName: roster.ownerDisplayName,
        ownerUsername: roster.ownerUsername,
        avatarUrl: roster.avatarUrl,
        isMyTeam,
        isStarter,
        isReserve,
        isTaxi,
      };
    }
  }

  return {
    type: 'free_agent',
    rosterId: null,
    teamName: null,
    ownerDisplayName: null,
    ownerUsername: null,
    avatarUrl: null,
    isMyTeam: false,
    isStarter: false,
    isReserve: false,
    isTaxi: false,
  };
}

/**
 * Match a single parsed CSV item to a Sleeper player
 */
export function matchSinglePlayer(
  item: ParsedRankingItem,
  index: PlayerIndex
): { sleeperPlayer: SleeperPlayer | null; matchScore: number } {
  const normName = normalizePlayerName(item.playerName);
  const normTeam = normalizeTeamAbbr(item.team);
  const { pos: normPos } = normalizePosition(item.pos);

  // 1. Check if it's a Defense (DEF / DST)
  if (normPos === 'DEF' || normPos === 'DST') {
    // Try matching team abbreviation / defense map
    const defKey = normTeam || normName;
    const defInfo = TEAM_DEFENSE_MAP[defKey.toLowerCase()] || (normTeam && TEAM_DEFENSE_MAP[normTeam.toLowerCase()]);
    
    if (defInfo) {
      const defPlayer = index.defenses.get(defInfo.id);
      if (defPlayer) {
        return { sleeperPlayer: defPlayer, matchScore: 1.0 };
      }
      // Create synthetic defense SleeperPlayer if DB has no explicit DEF item
      return {
        sleeperPlayer: {
          player_id: defInfo.id,
          first_name: defInfo.team,
          last_name: 'DEF',
          full_name: defInfo.name,
          position: 'DEF',
          team: defInfo.team,
        },
        matchScore: 0.95,
      };
    }

    // Direct defense lookup by name
    const directDef = index.defenses.get(normName) || (normTeam && index.defenses.get(normTeam));
    if (directDef) {
      return { sleeperPlayer: directDef, matchScore: 1.0 };
    }
  }

  // 2. Exact match on normalized name + position
  const exactNameAndPos = index.byNameAndPos.get(`${normName}_${normPos}`);
  if (exactNameAndPos) {
    return { sleeperPlayer: exactNameAndPos, matchScore: 1.0 };
  }

  // 3. Check aliases and nicknames + position
  const aliases = getPlayerAliases(normName);
  for (const alias of aliases) {
    const aliasMatch = index.byNameAndPos.get(`${alias}_${normPos}`);
    if (aliasMatch) {
      return { sleeperPlayer: aliasMatch, matchScore: 0.95 };
    }
  }

  // 4. Exact match on normalized name + team
  if (normTeam) {
    const exactNameAndTeam = index.byNameAndTeam.get(`${normName}_${normTeam}`);
    if (exactNameAndTeam) {
      return { sleeperPlayer: exactNameAndTeam, matchScore: 0.9 };
    }
  }

  // 5. Lookup by normalized name only
  const candidates = index.byName.get(normName);
  if (candidates && candidates.length > 0) {
    // If team matches, prefer it
    if (normTeam) {
      const teamMatch = candidates.find((c) => normalizeTeamAbbr(c.team) === normTeam);
      if (teamMatch) return { sleeperPlayer: teamMatch, matchScore: 0.85 };
    }

    // If only one active player with that name, return it
    if (candidates.length === 1) {
      return { sleeperPlayer: candidates[0], matchScore: 0.8 };
    }

    // If multiple, try to find active one or highest search_rank
    const activeCandidates = candidates.filter((c) => c.status === 'Active' || c.team !== null);
    if (activeCandidates.length === 1) {
      return { sleeperPlayer: activeCandidates[0], matchScore: 0.75 };
    }
  }

  // 6. Check if player name happens to be a defense (e.g. "San Francisco 49ers" with pos missing)
  const defInfo = TEAM_DEFENSE_MAP[normName];
  if (defInfo) {
    const defPlayer = index.defenses.get(defInfo.id);
    if (defPlayer) return { sleeperPlayer: defPlayer, matchScore: 0.9 };
    return {
      sleeperPlayer: {
        player_id: defInfo.id,
        first_name: defInfo.team,
        last_name: 'DEF',
        full_name: defInfo.name,
        position: 'DEF',
        team: defInfo.team,
      },
      matchScore: 0.85,
    };
  }

  return { sleeperPlayer: null, matchScore: 0 };
}

/**
 * Match parsed CSV ranking items against Sleeper players and league rosters
 */
export function matchRankingsWithSleeper(
  items: ParsedRankingItem[],
  players: Record<string, SleeperPlayer> | null,
  rosters: ProcessedRoster[],
  myRosterId: number | null,
  filename: string = 'Rankings.csv'
): RankingsDataset {
  const index = buildSleeperPlayerIndex(players);
  const matchedPlayers: MatchedRankingPlayer[] = [];

  let matchedCount = 0;
  let unmatchedCount = 0;
  let freeAgentCount = 0;
  let rosteredCount = 0;

  items.forEach((item, idx) => {
    const { sleeperPlayer, matchScore } = matchSinglePlayer(item, index);
    const isMatched = Boolean(sleeperPlayer);

    if (isMatched) {
      matchedCount++;
    } else {
      unmatchedCount++;
    }

    const playerId = sleeperPlayer ? sleeperPlayer.player_id : `unmatched-${idx + 1}`;
    const rosterStatus = resolvePlayerRosterStatus(sleeperPlayer ? sleeperPlayer.player_id : null, rosters, myRosterId);

    if (rosterStatus.type === 'free_agent') {
      freeAgentCount++;
    } else {
      rosteredCount++;
    }

    const { pos: parsedPos, posRank: parsedPosRank } = normalizePosition(item.pos);
    const finalPos = sleeperPlayer?.position || parsedPos;
    const finalTeam = sleeperPlayer?.team || normalizeTeamAbbr(item.team) || null;

    matchedPlayers.push({
      id: playerId,
      rank: item.rank || idx + 1,
      playerName: sleeperPlayer ? sleeperPlayer.full_name : item.playerName,
      originalCsvName: item.playerName,
      pos: finalPos,
      posRank: parsedPosRank || item.posRank || null,
      team: finalTeam,
      tier: item.tier ?? null,
      bye: item.bye ?? null,
      isMatched,
      matchScore,
      sleeperPlayer,
      rosterStatus,
      rawCsvRow: item.raw,
    });
  });

  return {
    id: `dataset_${Date.now()}`,
    filename,
    uploadedAt: Date.now(),
    totalRows: items.length,
    matchedCount,
    unmatchedCount,
    freeAgentCount,
    rosteredCount,
    items: matchedPlayers,
  };
}
