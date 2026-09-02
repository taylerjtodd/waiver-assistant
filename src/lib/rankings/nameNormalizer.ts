/**
 * Name and string normalization utility for matching NFL players and defenses.
 */

// Suffixes to strip from player names
const SUFFIXES = [
  ' jr.', ' jr', ' sr.', ' sr', ' iii', ' ii', ' iv', ' v'
];

// Common nickname to canonical name mappings (and vice-versa)
const NICKNAME_MAP: Record<string, string> = {
  'gabriel davis': 'gabe davis',
  'gabe davis': 'gabriel davis',
  'mitchell trubisky': 'mitch trubisky',
  'mitch trubisky': 'mitchell trubisky',
  'joshua palmer': 'josh palmer',
  'josh palmer': 'joshua palmer',
  'chigoziem okonkwo': 'chig okonkwo',
  'chig okonkwo': 'chigoziem okonkwo',
  'marquise brown': 'hollywood brown',
  'hollywood brown': 'marquise brown',
  'cameron akers': 'cam akers',
  'cam akers': 'cameron akers',
  'kenneth walker': 'ken walker',
  'ken walker': 'kenneth walker',
  'nathaniel dell': 'tank dell',
  'tank dell': 'nathaniel dell',
  'scott miller': 'scotty miller',
  'scotty miller': 'scott miller',
  'phillip walker': 'pj walker',
  'pj walker': 'phillip walker',
  'jeffery wilson': 'jeff wilson',
  'jeff wilson': 'jeffery wilson',
  'robbie anderson': 'chosen anderson',
  'chosen anderson': 'robbie anderson',
  'tyler conklin': 'ty conklin',
  'ty conklin': 'tyler conklin',
  'alexander mattison': 'alex mattison',
  'alex mattison': 'alexander mattison',
  'rayquan smith': 'ray smith',
  'deandre hopkins': 'dhup',
};

// Team Defense mappings: Full names, team nicknames, and alternate abbreviations to standard Sleeper team DEF ID
export const TEAM_DEFENSE_MAP: Record<string, { id: string; name: string; team: string }> = {
  '49ers': { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },
  'san francisco': { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },
  'san francisco 49ers': { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },
  'sf': { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },
  'sfo': { id: 'SF', name: 'San Francisco 49ers', team: 'SF' },

  'patriots': { id: 'NE', name: 'New England Patriots', team: 'NE' },
  'new england': { id: 'NE', name: 'New England Patriots', team: 'NE' },
  'new england patriots': { id: 'NE', name: 'New England Patriots', team: 'NE' },
  'ne': { id: 'NE', name: 'New England Patriots', team: 'NE' },
  'nep': { id: 'NE', name: 'New England Patriots', team: 'NE' },

  'cowboys': { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL' },
  'dallas': { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL' },
  'dallas cowboys': { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL' },
  'dal': { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL' },

  'chiefs': { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },
  'kansas city': { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },
  'kansas city chiefs': { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },
  'kc': { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },
  'kcc': { id: 'KC', name: 'Kansas City Chiefs', team: 'KC' },

  'ravens': { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL' },
  'baltimore': { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL' },
  'baltimore ravens': { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL' },
  'bal': { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL' },

  'bills': { id: 'BUF', name: 'Buffalo Bills', team: 'BUF' },
  'buffalo': { id: 'BUF', name: 'Buffalo Bills', team: 'BUF' },
  'buffalo bills': { id: 'BUF', name: 'Buffalo Bills', team: 'BUF' },
  'buf': { id: 'BUF', name: 'Buffalo Bills', team: 'BUF' },

  'packers': { id: 'GB', name: 'Green Bay Packers', team: 'GB' },
  'green bay': { id: 'GB', name: 'Green Bay Packers', team: 'GB' },
  'green bay packers': { id: 'GB', name: 'Green Bay Packers', team: 'GB' },
  'gb': { id: 'GB', name: 'Green Bay Packers', team: 'GB' },
  'gnb': { id: 'GB', name: 'Green Bay Packers', team: 'GB' },

  'steelers': { id: 'PIT', name: 'Pittsburgh Steelers', team: 'PIT' },
  'pittsburgh': { id: 'PIT', name: 'Pittsburgh Steelers', team: 'PIT' },
  'pittsburgh steelers': { id: 'PIT', name: 'Pittsburgh Steelers', team: 'PIT' },
  'pit': { id: 'PIT', name: 'Pittsburgh Steelers', team: 'PIT' },

  'eagles': { id: 'PHI', name: 'Philadelphia Eagles', team: 'PHI' },
  'philadelphia': { id: 'PHI', name: 'Philadelphia Eagles', team: 'PHI' },
  'philadelphia eagles': { id: 'PHI', name: 'Philadelphia Eagles', team: 'PHI' },
  'phi': { id: 'PHI', name: 'Philadelphia Eagles', team: 'PHI' },

  'jets': { id: 'NYJ', name: 'New York Jets', team: 'NYJ' },
  'ny jets': { id: 'NYJ', name: 'New York Jets', team: 'NYJ' },
  'new york jets': { id: 'NYJ', name: 'New York Jets', team: 'NYJ' },
  'nyj': { id: 'NYJ', name: 'New York Jets', team: 'NYJ' },

  'giants': { id: 'NYG', name: 'New York Giants', team: 'NYG' },
  'ny giants': { id: 'NYG', name: 'New York Giants', team: 'NYG' },
  'new york giants': { id: 'NYG', name: 'New York Giants', team: 'NYG' },
  'nyg': { id: 'NYG', name: 'New York Giants', team: 'NYG' },

  'rams': { id: 'LAR', name: 'Los Angeles Rams', team: 'LAR' },
  'la rams': { id: 'LAR', name: 'Los Angeles Rams', team: 'LAR' },
  'los angeles rams': { id: 'LAR', name: 'Los Angeles Rams', team: 'LAR' },
  'lar': { id: 'LAR', name: 'Los Angeles Rams', team: 'LAR' },
  'la': { id: 'LAR', name: 'Los Angeles Rams', team: 'LAR' },

  'chargers': { id: 'LAC', name: 'Los Angeles Chargers', team: 'LAC' },
  'la chargers': { id: 'LAC', name: 'Los Angeles Chargers', team: 'LAC' },
  'los angeles chargers': { id: 'LAC', name: 'Los Angeles Chargers', team: 'LAC' },
  'lac': { id: 'LAC', name: 'Los Angeles Chargers', team: 'LAC' },

  'commanders': { id: 'WAS', name: 'Washington Commanders', team: 'WAS' },
  'washington': { id: 'WAS', name: 'Washington Commanders', team: 'WAS' },
  'washington commanders': { id: 'WAS', name: 'Washington Commanders', team: 'WAS' },
  'was': { id: 'WAS', name: 'Washington Commanders', team: 'WAS' },
  'wsh': { id: 'WAS', name: 'Washington Commanders', team: 'WAS' },

  'browns': { id: 'CLE', name: 'Cleveland Browns', team: 'CLE' },
  'cleveland': { id: 'CLE', name: 'Cleveland Browns', team: 'CLE' },
  'cleveland browns': { id: 'CLE', name: 'Cleveland Browns', team: 'CLE' },
  'cle': { id: 'CLE', name: 'Cleveland Browns', team: 'CLE' },

  'bengals': { id: 'CIN', name: 'Cincinnati Bengals', team: 'CIN' },
  'cincinnati': { id: 'CIN', name: 'Cincinnati Bengals', team: 'CIN' },
  'cincinnati bengals': { id: 'CIN', name: 'Cincinnati Bengals', team: 'CIN' },
  'cin': { id: 'CIN', name: 'Cincinnati Bengals', team: 'CIN' },

  'texans': { id: 'HOU', name: 'Houston Texans', team: 'HOU' },
  'houston': { id: 'HOU', name: 'Houston Texans', team: 'HOU' },
  'houston texans': { id: 'HOU', name: 'Houston Texans', team: 'HOU' },
  'hou': { id: 'HOU', name: 'Houston Texans', team: 'HOU' },

  'colts': { id: 'IND', name: 'Indianapolis Colts', team: 'IND' },
  'indianapolis': { id: 'IND', name: 'Indianapolis Colts', team: 'IND' },
  'indianapolis colts': { id: 'IND', name: 'Indianapolis Colts', team: 'IND' },
  'ind': { id: 'IND', name: 'Indianapolis Colts', team: 'IND' },

  'jaguars': { id: 'JAX', name: 'Jacksonville Jaguars', team: 'JAX' },
  'jacksonville': { id: 'JAX', name: 'Jacksonville Jaguars', team: 'JAX' },
  'jacksonville jaguars': { id: 'JAX', name: 'Jacksonville Jaguars', team: 'JAX' },
  'jax': { id: 'JAX', name: 'Jacksonville Jaguars', team: 'JAX' },
  'jac': { id: 'JAX', name: 'Jacksonville Jaguars', team: 'JAX' },

  'titans': { id: 'TEN', name: 'Tennessee Titans', team: 'TEN' },
  'tennessee': { id: 'TEN', name: 'Tennessee Titans', team: 'TEN' },
  'tennessee titans': { id: 'TEN', name: 'Tennessee Titans', team: 'TEN' },
  'ten': { id: 'TEN', name: 'Tennessee Titans', team: 'TEN' },

  'broncos': { id: 'DEN', name: 'Denver Broncos', team: 'DEN' },
  'denver': { id: 'DEN', name: 'Denver Broncos', team: 'DEN' },
  'denver broncos': { id: 'DEN', name: 'Denver Broncos', team: 'DEN' },
  'den': { id: 'DEN', name: 'Denver Broncos', team: 'DEN' },

  'raiders': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },
  'las vegas': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },
  'las vegas raiders': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },
  'lv': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },
  'lvr': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },
  'oak': { id: 'LV', name: 'Las Vegas Raiders', team: 'LV' },

  'bears': { id: 'CHI', name: 'Chicago Bears', team: 'CHI' },
  'chicago': { id: 'CHI', name: 'Chicago Bears', team: 'CHI' },
  'chicago bears': { id: 'CHI', name: 'Chicago Bears', team: 'CHI' },
  'chi': { id: 'CHI', name: 'Chicago Bears', team: 'CHI' },

  'lions': { id: 'DET', name: 'Detroit Lions', team: 'DET' },
  'detroit': { id: 'DET', name: 'Detroit Lions', team: 'DET' },
  'detroit lions': { id: 'DET', name: 'Detroit Lions', team: 'DET' },
  'det': { id: 'DET', name: 'Detroit Lions', team: 'DET' },

  'vikings': { id: 'MIN', name: 'Minnesota Vikings', team: 'MIN' },
  'minnesota': { id: 'MIN', name: 'Minnesota Vikings', team: 'MIN' },
  'minnesota vikings': { id: 'MIN', name: 'Minnesota Vikings', team: 'MIN' },
  'min': { id: 'MIN', name: 'Minnesota Vikings', team: 'MIN' },

  'falcons': { id: 'ATL', name: 'Atlanta Falcons', team: 'ATL' },
  'atlanta': { id: 'ATL', name: 'Atlanta Falcons', team: 'ATL' },
  'atlanta falcons': { id: 'ATL', name: 'Atlanta Falcons', team: 'ATL' },
  'atl': { id: 'ATL', name: 'Atlanta Falcons', team: 'ATL' },

  'panthers': { id: 'CAR', name: 'Carolina Panthers', team: 'CAR' },
  'carolina': { id: 'CAR', name: 'Carolina Panthers', team: 'CAR' },
  'carolina panthers': { id: 'CAR', name: 'Carolina Panthers', team: 'CAR' },
  'car': { id: 'CAR', name: 'Carolina Panthers', team: 'CAR' },

  'saints': { id: 'NO', name: 'New Orleans Saints', team: 'NO' },
  'new orleans': { id: 'NO', name: 'New Orleans Saints', team: 'NO' },
  'new orleans saints': { id: 'NO', name: 'New Orleans Saints', team: 'NO' },
  'no': { id: 'NO', name: 'New Orleans Saints', team: 'NO' },
  'nos': { id: 'NO', name: 'New Orleans Saints', team: 'NO' },

  'buccaneers': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },
  'tampa bay': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },
  'tampa bay buccaneers': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },
  'bucs': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },
  'tb': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },
  'tbb': { id: 'TB', name: 'Tampa Bay Buccaneers', team: 'TB' },

  'cardinals': { id: 'ARI', name: 'Arizona Cardinals', team: 'ARI' },
  'arizona': { id: 'ARI', name: 'Arizona Cardinals', team: 'ARI' },
  'arizona cardinals': { id: 'ARI', name: 'Arizona Cardinals', team: 'ARI' },
  'ari': { id: 'ARI', name: 'Arizona Cardinals', team: 'ARI' },
  'arz': { id: 'ARI', name: 'Arizona Cardinals', team: 'ARI' },

  'seahawks': { id: 'SEA', name: 'Seattle Seahawks', team: 'SEA' },
  'seattle': { id: 'SEA', name: 'Seattle Seahawks', team: 'SEA' },
  'seattle seahawks': { id: 'SEA', name: 'Seattle Seahawks', team: 'SEA' },
  'sea': { id: 'SEA', name: 'Seattle Seahawks', team: 'SEA' },

  'dolphins': { id: 'MIA', name: 'Miami Dolphins', team: 'MIA' },
  'miami': { id: 'MIA', name: 'Miami Dolphins', team: 'MIA' },
  'miami dolphins': { id: 'MIA', name: 'Miami Dolphins', team: 'MIA' },
  'mia': { id: 'MIA', name: 'Miami Dolphins', team: 'MIA' },
};

// Team abbreviation normalizer map (e.g. JAC -> JAX, WSH -> WAS, etc.)
export const TEAM_ABBR_MAP: Record<string, string> = {
  'JAC': 'JAX',
  'WSH': 'WAS',
  'OAK': 'LV',
  'LVR': 'LV',
  'LAR': 'LAR',
  'LAC': 'LAC',
  'SFO': 'SF',
  'NEP': 'NE',
  'KCC': 'KC',
  'GNB': 'GB',
  'NOS': 'NO',
  'TBB': 'TB',
  'ARZ': 'ARI',
};

/**
 * Standardize NFL team abbreviations
 */
export function normalizeTeamAbbr(team: string | null | undefined): string | null {
  if (!team) return null;
  const upper = team.trim().toUpperCase();
  if (upper === 'FA' || upper === 'FREE AGENT' || upper === 'NONE' || upper === 'N/A') {
    return null;
  }
  return TEAM_ABBR_MAP[upper] || upper;
}

/**
 * Standardize player position (e.g. "WR12" -> "WR", "DST" -> "DEF")
 */
export function normalizePosition(pos: string | null | undefined): { pos: string; posRank: number | null } {
  if (!pos) return { pos: 'FLEX', posRank: null };
  
  const clean = pos.trim().toUpperCase();
  
  // Handle formats like "RB1", "WR12", "QB3", "TE10", "DST4", "K2"
  const match = clean.match(/^([A-Z/]+)\s*(\d+)$/);
  if (match) {
    let position = match[1];
    if (position === 'DST' || position === 'D/ST') position = 'DEF';
    const rank = parseInt(match[2], 10);
    return { pos: position, posRank: isNaN(rank) ? null : rank };
  }

  let position = clean;
  if (position === 'DST' || position === 'D/ST') position = 'DEF';
  return { pos: position, posRank: null };
}

/**
 * Normalize a player name for fuzzy / canonical matching:
 * - strips punctuation, periods, apostrophes, hyphens
 * - strips accents / diacritics
 * - strips suffixes (Jr, Sr, III, II, etc.)
 * - removes extra spaces
 */
export function normalizePlayerName(name: string): string {
  if (!name) return '';

  let normalized = name.toLowerCase().trim();

  // Strip accents / diacritics (e.g. "St. Brown" or accented characters)
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Strip common suffixes
  for (const suffix of SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length).trim();
    }
  }

  // Replace punctuation (periods, apostrophes, commas, hyphens, quotes) with space or empty
  // e.g. "A.J. Brown" -> "aj brown", "Ja'Marr Chase" -> "jamarr chase", "De'Von" -> "devon"
  normalized = normalized
    .replace(/[.']/g, '') // remove periods and apostrophes directly (e.g. A.J. -> aj, Ja'Marr -> jamarr)
    .replace(/[^a-z0-9\s]/g, ' ') // replace hyphens or other symbols with space
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Get known nickname / alias variant for player names
 */
export function getPlayerAliases(normalizedName: string): string[] {
  const aliases: string[] = [normalizedName];

  if (NICKNAME_MAP[normalizedName]) {
    aliases.push(NICKNAME_MAP[normalizedName]);
  }

  return aliases;
}
