import { useState } from 'react';
import {
  Trophy,
  FileSpreadsheet,
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
import { RankingsView } from './components/rankings/RankingsView';

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'rankings' | 'waiver' | 'trades' | 'rosters'>('rankings');
  const { isConnectModalOpen, setIsConnectModalOpen } = useSleeper();
  const {
    dataset,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isRankingsDrawerOpen,
    setIsRankingsDrawerOpen,
    isUnmatchedModalOpen,
    setIsUnmatchedModalOpen
  } = useRankings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
              </div>
              <p className="text-xs text-slate-400 font-medium">Fantasy Football Decision Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LeagueSelector />

            <button
              type="button"
              onClick={() => setIsRankingsDrawerOpen(true)}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LeagueStatusCard />

        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${activeTab === 'rankings'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Consensus Rankings</span>
            {dataset && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {dataset.totalRows}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rosters')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${activeTab === 'rosters'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            League Rosters
          </button>
          {/* <button
            onClick={() => setActiveTab('waiver')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${activeTab === 'waiver'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            Waiver Wire Assistant
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${activeTab === 'trades'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            Trade Analyzer
          </button> */}
        </div>

        {activeTab === 'rankings' && (
          <RankingsView />
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
                View Rankings
              </button>
            </div>

            <RankingsView />
          </div>
        )}
      </main>

      <LeagueConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <RankingsPreviewTable
        isOpen={isRankingsDrawerOpen}
        onClose={() => setIsRankingsDrawerOpen(false)}
      />

      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <UnmatchedDrawer
        isOpen={isUnmatchedModalOpen}
        onClose={() => setIsUnmatchedModalOpen(false)}
      />

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
