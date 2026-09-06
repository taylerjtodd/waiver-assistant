import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownUp, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { useSleeper } from '../../context/SleeperContext';
import { TransactionPreviewModal } from './TransactionPreviewModal';

export const SelectedPlayersBar: React.FC = () => {
  const { 
    selectedPlayers, 
    clearSelection 
  } = useRankings();
  const { myRosterId, rosters } = useSleeper();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Group players by roster category
  const { myTeamPlayers, opponentPlayers, freeAgentPlayers, opposingRosterIds, opponentTeamName } = useMemo(() => {
    const myTeam = [];
    const opponent = [];
    const freeAgents = [];
    const oppIds = new Set<number>();

    for (const p of selectedPlayers) {
      const isMy = p.rosterStatus.isMyTeam || (myRosterId !== null && p.rosterStatus.rosterId === myRosterId);
      const isFA = p.rosterStatus.type === 'free_agent' || p.rosterStatus.rosterId === null;

      if (isMy) {
        myTeam.push(p);
      } else if (isFA) {
        freeAgents.push(p);
      } else {
        opponent.push(p);
        if (p.rosterStatus.rosterId !== null) {
          oppIds.add(p.rosterStatus.rosterId);
        }
      }
    }

    // Find team name of the opposing team if only 1 opposing team is selected
    let oppName = null;
    if (oppIds.size === 1) {
      const oppId = Array.from(oppIds)[0];
      const roster = rosters.find((r) => r.rosterId === oppId);
      oppName = roster?.teamName || opponent[0]?.rosterStatus.teamName || 'Opponent';
    }

    return {
      myTeamPlayers: myTeam,
      opponentPlayers: opponent,
      freeAgentPlayers: freeAgents,
      opposingRosterIds: oppIds,
      opponentTeamName: oppName,
    };
  }, [selectedPlayers, myRosterId, rosters]);

  // Validation logic
  const { isValid, reason, mode } = useMemo(() => {
    if (selectedPlayers.length === 0) {
      return { isValid: false, reason: '', mode: null };
    }

    if (opposingRosterIds.size > 1) {
      return {
        isValid: false,
        reason: 'Selections cannot span multiple opposing teams (limit to your team, one other team, and/or free agents).',
        mode: null,
      };
    }

    if (myRosterId === null && myTeamPlayers.length === 0) {
      return {
        isValid: false,
        reason: 'Select your team in league settings to preview transactions.',
        mode: null,
      };
    }

    if (myTeamPlayers.length === 0) {
      return {
        isValid: false,
        reason: 'Select at least 1 player from your team to preview a transaction.',
        mode: null,
      };
    }

    if (opponentPlayers.length === 0 && freeAgentPlayers.length === 0) {
      return {
        isValid: false,
        reason: 'Select Free Agents to preview a waiver move, or an opposing team to preview a trade.',
        mode: null,
      };
    }

    if (opponentPlayers.length > 0) {
      return {
        isValid: true,
        reason: null,
        mode: 'trade' as const,
      };
    }

    return {
      isValid: true,
      reason: null,
      mode: 'waiver' as const,
    };
  }, [selectedPlayers, opposingRosterIds, myRosterId, myTeamPlayers, opponentPlayers, freeAgentPlayers]);

  if (selectedPlayers.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-3 sm:p-4 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Info & Breakdown Badges */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {selectedPlayers.length}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 leading-tight">
                  {selectedPlayers.length} Selected
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                  {myTeamPlayers.length > 0 && (
                    <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      {myTeamPlayers.length} My Team
                    </span>
                  )}
                  {opponentPlayers.length > 0 && (
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[130px]">
                      {opponentPlayers.length} {opponentTeamName ? opponentTeamName : 'Opponent'}
                    </span>
                  )}
                  {freeAgentPlayers.length > 0 && (
                    <span className="text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                      {freeAgentPlayers.length} Free Agent{freeAgentPlayers.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Validation warning indicator if invalid */}
            {!isValid && reason && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-xl max-w-sm shrink-0">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="truncate">{reason}</span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all"
              title="Clear all selections"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              disabled={!isValid}
              onClick={() => setIsPreviewOpen(true)}
              title={!isValid ? (reason || 'Select valid players to preview') : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                !isValid
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                  : mode === 'trade'
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20 cursor-pointer'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer'
              }`}
            >
              {mode === 'trade' ? (
                <>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Preview Trade</span>
                </>
              ) : mode === 'waiver' ? (
                <>
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  <span>Preview Waiver</span>
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  <span>Compare / Preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Preview Modal */}
      <TransactionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        selectedPlayers={selectedPlayers}
        myRosterId={myRosterId}
        rosters={rosters}
        clearSelection={clearSelection}
      />
    </>
  );
};
