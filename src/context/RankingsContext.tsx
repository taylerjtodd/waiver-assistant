import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ParsedRankingItem, 
  RankingsDataset, 
  MatchedRankingPlayer,
  CsvParseResult 
} from '../lib/rankings/types';
import { parseRankingsCsv, parseRankingsFile } from '../lib/rankings/csvParser';
import { matchRankingsWithSleeper } from '../lib/rankings/matcher';
import { getSampleRankingItems, downloadSampleCsvTemplate } from '../lib/rankings/sampleData';
import { getStoredRankings, saveStoredRankings, clearStoredRankings } from '../lib/storage/rankingsStorage';
import { useSleeper } from './SleeperContext';

interface RankingsContextType {
  rawItems: ParsedRankingItem[];
  dataset: RankingsDataset | null;
  filename: string | null;
  isLoading: boolean;
  parseErrors: string[];
  parseWarnings: string[];
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isUnmatchedModalOpen: boolean;
  setIsUnmatchedModalOpen: (open: boolean) => void;
  uploadCsvText: (csvText: string, filename?: string) => Promise<boolean>;
  uploadCsvFile: (file: File) => Promise<boolean>;
  loadSampleRankings: () => void;
  clearRankings: () => void;
  downloadTemplate: () => void;
  unmatchedPlayers: MatchedRankingPlayer[];
}

const RankingsContext = createContext<RankingsContextType | null>(null);

export const RankingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { players, rosters, myRosterId } = useSleeper();

  const [rawItems, setRawItems] = useState<ParsedRankingItem[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isUnmatchedModalOpen, setIsUnmatchedModalOpen] = useState<boolean>(false);

  // Restore stored rankings on mount
  useEffect(() => {
    const stored = getStoredRankings();
    if (stored && stored.items && stored.items.length > 0) {
      setRawItems(stored.items);
      setFilename(stored.filename);
    }
  }, []);

  // Compute matched dataset whenever rawItems, players, rosters, or myRosterId changes
  const dataset = useMemo<RankingsDataset | null>(() => {
    if (rawItems.length === 0) return null;
    return matchRankingsWithSleeper(
      rawItems,
      players,
      rosters,
      myRosterId,
      filename || 'Rankings.csv'
    );
  }, [rawItems, players, rosters, myRosterId, filename]);

  const unmatchedPlayers = useMemo<MatchedRankingPlayer[]>(() => {
    if (!dataset) return [];
    return dataset.items.filter((p) => !p.isMatched);
  }, [dataset]);

  // Upload raw CSV text
  const uploadCsvText = useCallback(async (csvText: string, customFilename?: string): Promise<boolean> => {
    setIsLoading(true);
    setParseErrors([]);
    setParseWarnings([]);

    try {
      const result: CsvParseResult = parseRankingsCsv(csvText);

      if (!result.success || result.items.length === 0) {
        setParseErrors(result.errors.length > 0 ? result.errors : ['Failed to parse CSV file.']);
        setParseWarnings(result.warnings);
        return false;
      }

      const activeName = customFilename || 'Rankings.csv';
      setRawItems(result.items);
      setFilename(activeName);
      setParseWarnings(result.warnings);
      saveStoredRankings(activeName, result.items);
      return true;
    } catch (err: any) {
      setParseErrors([err.message || 'An unexpected error occurred while processing the CSV.']);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload File object
  const uploadCsvFile = useCallback(async (file: File): Promise<boolean> => {
    setIsLoading(true);
    setParseErrors([]);
    setParseWarnings([]);

    try {
      const result = await parseRankingsFile(file);

      if (!result.success || result.items.length === 0) {
        setParseErrors(result.errors.length > 0 ? result.errors : ['Failed to parse CSV file.']);
        setParseWarnings(result.warnings);
        return false;
      }

      setRawItems(result.items);
      setFilename(file.name);
      setParseWarnings(result.warnings);
      saveStoredRankings(file.name, result.items);
      return true;
    } catch (err: any) {
      setParseErrors([err.message || 'An unexpected error occurred while reading the file.']);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load sample dataset
  const loadSampleRankings = useCallback(() => {
    setIsLoading(true);
    setParseErrors([]);
    setParseWarnings([]);
    try {
      const sampleItems = getSampleRankingItems();
      const sampleName = 'Sample_Consensus_Top120.csv';
      setRawItems(sampleItems);
      setFilename(sampleName);
      saveStoredRankings(sampleName, sampleItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear rankings
  const clearRankings = useCallback(() => {
    setRawItems([]);
    setFilename(null);
    setParseErrors([]);
    setParseWarnings([]);
    clearStoredRankings();
  }, []);

  // Download sample CSV template
  const downloadTemplate = useCallback(() => {
    downloadSampleCsvTemplate();
  }, []);

  const value = useMemo<RankingsContextType>(() => ({
    rawItems,
    dataset,
    filename,
    isLoading,
    parseErrors,
    parseWarnings,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isUnmatchedModalOpen,
    setIsUnmatchedModalOpen,
    uploadCsvText,
    uploadCsvFile,
    loadSampleRankings,
    clearRankings,
    downloadTemplate,
    unmatchedPlayers,
  }), [
    rawItems,
    dataset,
    filename,
    isLoading,
    parseErrors,
    parseWarnings,
    isUploadModalOpen,
    isUnmatchedModalOpen,
    uploadCsvText,
    uploadCsvFile,
    loadSampleRankings,
    clearRankings,
    downloadTemplate,
    unmatchedPlayers,
  ]);

  return (
    <RankingsContext.Provider value={value}>
      {children}
    </RankingsContext.Provider>
  );
};

export function useRankings(): RankingsContextType {
  const context = useContext(RankingsContext);
  if (!context) {
    throw new Error('useRankings must be used within a RankingsProvider');
  }
  return context;
}
