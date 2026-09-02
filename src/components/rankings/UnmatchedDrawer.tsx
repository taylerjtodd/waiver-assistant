import React from 'react';
import { X, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { normalizePlayerName } from '../../lib/rankings/nameNormalizer';

interface UnmatchedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnmatchedDrawer: React.FC<UnmatchedDrawerProps> = ({ isOpen, onClose }) => {
  const { unmatchedPlayers, dataset } = useRankings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Unmatched Players Diagnostic</h2>
              <p className="text-xs text-slate-400">
                {unmatchedPlayers.length} out of {dataset?.totalRows || 0} entries in CSV could not be linked to Sleeper ID
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {unmatchedPlayers.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">100% Player Match Rate!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All players in your rankings file were successfully matched to active Sleeper player records and league rosters.
              </p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Why do unmatched players occur?</span>
                  <p className="text-slate-300 mt-1">
                    Unmatched entries are typically retired players, non-rostered rookies not yet in Sleeper, or unusual spelling variations. They will still appear in your rankings table but without live roster status sync.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">RK</th>
                      <th className="py-2.5 px-3">CSV Name</th>
                      <th className="py-2.5 px-3">POS</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3">Normalized Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {unmatchedPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-slate-400">#{player.rank}</td>
                        <td className="py-2 px-3 font-medium text-slate-200">{player.originalCsvName}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            {player.pos}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">{player.team || '—'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                          {normalizePlayerName(player.originalCsvName)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
