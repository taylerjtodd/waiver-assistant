import { useState } from 'react';
import { 
  Trophy, 
  Layers, 
  ArrowUpDown, 
  FileSpreadsheet, 
  CheckCircle2
} from 'lucide-react';
import { SleeperProvider, useSleeper } from './context/SleeperContext';
import { LeagueConnectModal } from './components/sleeper/LeagueConnectModal';
import { LeagueSelector } from './components/sleeper/LeagueSelector';
import { LeagueStatusCard } from './components/sleeper/LeagueStatusCard';
import { RostersViewer } from './components/sleeper/RostersViewer';

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'waiver' | 'trades' | 'rosters' | 'rankings'>('waiver');
  const { isConnectModalOpen, setIsConnectModalOpen, league } = useSleeper();

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
                  Phase 2 Live
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
              disabled
              title="Rankings CSV Ingestion arriving in Phase 3"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700/50 cursor-not-allowed opacity-75"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import CSV (Phase 3)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('waiver')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'waiver' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Waiver Assistant
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
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'rankings' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Consensus Rankings
          </button>
        </div>

        {/* Sleeper Connected League Banner & Status */}
        <LeagueStatusCard />

        {/* Active Tab Views */}
        {activeTab === 'rosters' ? (
          <RostersViewer />
        ) : (
          <>
            {/* If league connected, show RostersViewer preview in other tabs */}
            {league && <RostersViewer />}

            {/* Phase Checklist & Roadmap Card */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Implementation Progress
                </h2>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Phase 2 Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Phase 1: Setup & Build
                  </div>
                  <p className="text-xs text-slate-400">
                    React 19, TypeScript, Tailwind CSS, TanStack Table, PapaParse, and GitHub Actions CI/CD.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Phase 2: Sleeper API & State
                  </div>
                  <p className="text-xs text-slate-400">
                    Sleeper API client, IndexedDB NFL player caching, LocalStorage league switcher, and My Team selector.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/20 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-1.5">
                    <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    Phase 3-5: CSV & Filtering Engine
                  </div>
                  <p className="text-xs text-slate-400">
                    CSV matching, TanStack filtering table, drop candidate comparison, and trade analyzer.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Connect Modal */}
      <LeagueConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
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
      <MainDashboard />
    </SleeperProvider>
  );
}
