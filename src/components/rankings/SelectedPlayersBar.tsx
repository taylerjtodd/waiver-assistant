import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Trash2
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { getPositionBadgeClass } from './RankingsPreviewTable';

export const SelectedPlayersBar: React.FC = () => {
  const { 
    selectedPlayers, 
    togglePlayerSelection, 
    clearSelection 
  } = useRankings();

  const [copied, setCopied] = useState(false);

  if (selectedPlayers.length === 0) return null;

  // Group by position for badge count
  const posCounts = selectedPlayers.reduce((acc, p) => {
    const pos = p.pos.toUpperCase();
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Export selected to CSV
  const handleExportCsv = () => {
    const headers = ['Rank', 'Player Name', 'Position', 'Pos Rank', 'NFL Team', 'Bye', 'Roster Status', 'Owner/Team'];
    const rows = selectedPlayers.map((p) => [
      p.rank,
      `"${p.playerName}"`,
      p.pos,
      p.posRank || '',
      p.team || '',
      p.bye || '',
      p.rosterStatus.type === 'free_agent' ? 'Free Agent' : 'Rostered',
      `"${p.rosterStatus.teamName || 'Available'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selected_players_${selectedPlayers.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy summary to clipboard
  const handleCopyToClipboard = async () => {
    const text = selectedPlayers
      .map((p) => {
        const status = p.rosterStatus.type === 'free_agent' 
          ? 'Free Agent' 
          : `Rostered (${p.rosterStatus.teamName || 'Rostered'})`;
        return `#${p.rank} ${p.playerName} (${p.pos}${p.posRank ? p.posRank : ''} - ${p.team || 'FA'}) - ${status}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Info & Chips */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {selectedPlayers.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 leading-tight">
                {selectedPlayers.length} Selected
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                {Object.entries(posCounts).map(([pos, count]) => (
                  <span key={pos} className="font-mono">
                    {count} {pos}{' '}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Player Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm sm:max-w-md py-0.5 pl-2 border-l border-slate-800">
            {selectedPlayers.map((player) => (
              <span
                key={player.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 shrink-0 font-medium"
              >
                <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${getPositionBadgeClass(player.pos)}`}>
                  {player.pos}
                </span>
                <span className="truncate max-w-[110px]">{player.playerName}</span>
                <button
                  type="button"
                  onClick={() => togglePlayerSelection(player.id)}
                  className="text-slate-400 hover:text-rose-400 ml-0.5 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            title="Copy selected player summary"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy List</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            title="Export selected players to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all"
            title="Clear all selections"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
