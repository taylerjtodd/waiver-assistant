import { useState } from 'react';
import { 
  Trophy, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SleeperProvider, useSleeper } from './context/SleeperContext';
import { RankingsProvider, useRankings } from './context/RankingsContext';
import { LeagueConnectModal } from './components/sleeper/LeagueConnectModal';
import { LeagueSelector } from './components/sleeper/LeagueSelector';
import { LeagueStatusCard } from './components/sleeper/LeagueStatusCard';
import { RostersViewer } from './components/sleeper/RostersViewer';
import { CsvUploadModal } from './components/rankings/CsvUploadModal';
import { UnmatchedDrawer } from './components/rankings/UnmatchedDrawer';
import { RankingsPreviewTable } from './components/rankings/RankingsPreviewTable';

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'rankings' | 'waiver' | 'trades' | 'rosters'>('rankings');
  const { isConnectModalOpen, setIsConnectModalOpen } = useSleeper();
  const { 
    dataset, 
    isUploadModalOpen, 
    setIsUploadModalOpen, 
    isUnmatchedModalOpen, 
    setIsUnmatchedModalOpen 
  } = useRankings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Trophy className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Waiver Assistant
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Phase 4 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Fantasy Football Decision Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sleeper League Switcher / Connect Button */}
            <LeagueSelector />

            {/* Import Rankings Trigger */}
            <button 
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {dataset ? 'Manage CSV' : 'Import CSV'}
              </span>
              <span className="sm:hidden">CSV</span>
              {dataset && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'rankings' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Consensus Rankings & Ingestion</span>
            {dataset && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {dataset.totalRows}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('rosters')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'rosters' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            League Rosters
          </button>
          <button 
            onClick={() => setActiveTab('waiver')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'waiver' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Waiver Wire Assistant
          </button>
          <button 
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'trades' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Trade Analyzer
          </button>
        </div>

        {/* Sleeper Connected League Banner & Status */}
        <LeagueStatusCard />

        {/* Active Tab Views */}
        {activeTab === 'rankings' && (
          <RankingsPreviewTable />
        )}

        {activeTab === 'rosters' && (
          <RostersViewer />
        )}

        {(activeTab === 'waiver' || activeTab === 'trades') && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {activeTab === 'waiver' ? 'Waiver Assistant Decision View' : 'Multi-Player Trade Analyzer'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeTab === 'waiver' 
                      ? 'Identify drop candidates and compare free agent upgrades (Coming in Phase 5)' 
                      : 'Side-by-side roster trade evaluator (Coming in Phase 5)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('rankings')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                View Rankings Ingestion
              </button>
            </div>

            {/* Show Rankings Table Preview */}
            <RankingsPreviewTable />
          </div>
        )}

        {/* Phase Checklist & Roadmap Card */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Implementation Progress
            </h2>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Phase 4 Complete
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Phase 1: Setup & Build
              </div>
              <p className="text-xs text-slate-400">
                React 19, TypeScript, Tailwind CSS, TanStack Table, PapaParse, and GitHub Actions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Phase 2: Sleeper API & State
              </div>
              <p className="text-xs text-slate-400">
                Sleeper API client, IndexedDB NFL player caching, LocalStorage league switcher, and My Team.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Phase 3: CSV & Matching Engine
              </div>
              <p className="text-xs text-slate-400">
                Drag-and-drop CSV upload, fuzzy name normalization, and Sleeper database matching.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Phase 4: TanStack Table & Filters
              </div>
              <p className="text-xs text-slate-400">
                TanStack Table v8, multi-field search, multi-team filter, rank slider, multi-select & export.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Connect Modal */}
      <LeagueConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Unmatched Diagnostic Modal */}
      <UnmatchedDrawer
        isOpen={isUnmatchedModalOpen}
        onClose={() => setIsUnmatchedModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Waiver Assistant • Sleeper Fantasy Football Integration Engine</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SleeperProvider>
      <RankingsProvider>
        <MainDashboard />
      </RankingsProvider>
    </SleeperProvider>
  );
}
