import Papa from 'papaparse';
import { RawCsvRow, ParsedRankingItem, CsvParseResult } from './types';
import { normalizePosition } from './nameNormalizer';

// Column header aliases (case-insensitive)
const RANK_ALIASES = ['rk', 'rank', 'ranking', 'overall', 'pos rank', 'ecr', '#', 'no', 'num'];
const NAME_ALIASES = ['player name', 'player', 'name', 'athlete', 'player_name', 'full name', 'fullname'];
const POS_ALIASES = ['pos', 'position', 'pos.', 'fpos', 'positions'];
const TEAM_ALIASES = ['team', 'nfl team', 'tm', 'nfl_team', 'pro team', 'nfl'];
const BYE_ALIASES = ['bye', 'bye week', 'bye_week', 'byewk'];
const TIER_ALIASES = ['tier', 'tr', 'tier #', 'tier_num'];

/**
 * Finds the matching header key from row headers
 */
function findHeaderKey(headers: string[], aliases: string[]): string | undefined {
  const lowerAliases = aliases.map((a) => a.toLowerCase());
  
  // Exact match first
  for (const header of headers) {
    const clean = header.trim().toLowerCase();
    if (lowerAliases.includes(clean)) {
      return header;
    }
  }

  // Substring match second
  for (const header of headers) {
    const clean = header.trim().toLowerCase();
    for (const alias of lowerAliases) {
      if (clean.includes(alias) && clean.length < alias.length + 6) {
        return header;
      }
    }
  }

  return undefined;
}

/**
 * Parses raw CSV content or text string into validated ranking items
 */
export function parseRankingsCsv(csvText: string): CsvParseResult {
  const warnings: string[] = [];
  const items: ParsedRankingItem[] = [];

  if (!csvText || !csvText.trim()) {
    return {
      success: false,
      items: [],
      errors: ['CSV file is empty.'],
      warnings: [],
      detectedColumns: {},
    };
  }

  const parsed = Papa.parse<RawCsvRow>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.slice(0, 3).forEach((e) => {
      warnings.push(`Row ${e.row}: ${e.message}`);
    });
  }

  const headers = parsed.meta.fields || [];
  if (headers.length === 0) {
    return {
      success: false,
      items: [],
      errors: ['No valid CSV headers detected. Ensure your CSV has a header row.'],
      warnings,
      detectedColumns: {},
    };
  }

  // Detect column mappings
  const rankCol = findHeaderKey(headers, RANK_ALIASES);
  const nameCol = findHeaderKey(headers, NAME_ALIASES);
  const posCol = findHeaderKey(headers, POS_ALIASES);
  const teamCol = findHeaderKey(headers, TEAM_ALIASES);
  const byeCol = findHeaderKey(headers, BYE_ALIASES);
  const tierCol = findHeaderKey(headers, TIER_ALIASES);

  if (!nameCol) {
    return {
      success: false,
      items: [],
      errors: [
        `Could not detect a "Player Name" column. Available columns in your file: ${headers.join(', ')}. ` +
        `Expected headers like: "Player Name", "Player", or "Name".`
      ],
      warnings,
      detectedColumns: { rankCol, posCol, teamCol, byeCol, tierCol },
    };
  }

  const rows = parsed.data as RawCsvRow[];
  let fallbackRank = 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const rawName = row[nameCol];
    if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
      continue; // skip rows without a valid player name
    }

    const playerName = rawName.trim();

    // Parse Rank
    let rank = fallbackRank;
    if (rankCol && row[rankCol] !== undefined && row[rankCol] !== null) {
      const parsedRank = parseInt(String(row[rankCol]).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedRank) && parsedRank > 0) {
        rank = parsedRank;
      }
    }

    // Parse Pos & PosRank
    const rawPos = posCol && row[posCol] ? String(row[posCol]).trim() : 'FLEX';
    const { pos, posRank } = normalizePosition(rawPos);

    // Parse Team
    const rawTeam = teamCol && row[teamCol] ? String(row[teamCol]).trim() : null;

    // Parse Bye
    let bye: number | null = null;
    if (byeCol && row[byeCol] !== undefined && row[byeCol] !== null) {
      const parsedBye = parseInt(String(row[byeCol]).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedBye)) bye = parsedBye;
    }

    // Parse Tier
    let tier: number | null = null;
    if (tierCol && row[tierCol] !== undefined && row[tierCol] !== null) {
      const parsedTier = parseInt(String(row[tierCol]).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedTier)) tier = parsedTier;
    }

    items.push({
      rank,
      playerName,
      pos,
      posRank,
      team: rawTeam,
      bye,
      tier,
      raw: row,
    });

    fallbackRank++;
  }

  if (items.length === 0) {
    return {
      success: false,
      items: [],
      errors: ['No valid player rows found in the CSV file.'],
      warnings,
      detectedColumns: { rankCol, nameCol, posCol, teamCol, byeCol, tierCol },
    };
  }

  // Sort items by rank ascending
  items.sort((a, b) => a.rank - b.rank);

  return {
    success: true,
    items,
    errors: [],
    warnings,
    detectedColumns: { rankCol, nameCol, posCol, teamCol, byeCol, tierCol },
  };
}

/**
 * Parses a File object asynchronously
 */
export async function parseRankingsFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseRankingsCsv(text);
      resolve(result);
    };
    reader.onerror = () => {
      resolve({
        success: false,
        items: [],
        errors: [`Failed to read file: ${file.name}`],
        warnings: [],
        detectedColumns: {},
      });
    };
    reader.readAsText(file);
  });
}
