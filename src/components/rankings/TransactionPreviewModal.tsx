import React, { useMemo } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  ArrowDownUp, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  UserMinus, 
  UserPlus, 
  CheckCircle2, 
  Layers,
  Trash2
} from 'lucide-react';
import { MatchedRankingPlayer } from '../../lib/rankings/types';
import { ProcessedRoster } from '../../lib/sleeper/types';
import { getPositionBadgeClass } from './RankingsPreviewTable';

interface TransactionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayers: MatchedRankingPlayer[];
  myRosterId: number | null;
  rosters: ProcessedRoster[];
  clearSelection: () => void;
}

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  isOpen,
  onClose,
  selectedPlayers,
  myRosterId,
  rosters,
  clearSelection
}) => {
  // Categorize selected players
  const { myTeamPlayers, opponentPlayers, freeAgentPlayers, opponentRoster, myRoster } = useMemo(() => {
    const myTeam: MatchedRankingPlayer[] = [];
    const opponent: MatchedRankingPlayer[] = [];
    const freeAgents: MatchedRankingPlayer[] = [];

    selectedPlayers.forEach((p) => {
      const isMy = p.rosterStatus.isMyTeam || (myRosterId !== null && p.rosterStatus.rosterId === myRosterId);
      const isFA = p.rosterStatus.type === 'free_agent' || p.rosterStatus.rosterId === null;

      if (isMy) {
        myTeam.push(p);
      } else if (isFA) {
        freeAgents.push(p);
      } else {
        opponent.push(p);
      }
    });

    const oppRosterId = opponent[0]?.rosterStatus.rosterId;
    const oppRoster = rosters.find((r) => r.rosterId === oppRosterId) || null;
    const myR = rosters.find((r) => r.rosterId === myRosterId) || rosters.find((r) => r.isMyTeam) || null;

    return {
      myTeamPlayers: myTeam,
      opponentPlayers: opponent,
      freeAgentPlayers: freeAgents,
      opponentRoster: oppRoster,
      myRoster: myR
    };
  }, [selectedPlayers, myRosterId, rosters]);

  const isTrade = opponentPlayers.length > 0;
  const isWaiver = !isTrade && myTeamPlayers.length > 0 && freeAgentPlayers.length > 0;

  // Trade metrics
  const tradeStats = useMemo(() => {
    if (!isTrade) return null;

    const sentRanks = myTeamPlayers.map((p) => p.rank);
    const recvRanks = opponentPlayers.map((p) => p.rank);

    const avgSent = sentRanks.length > 0 
      ? sentRanks.reduce((a, b) => a + b, 0) / sentRanks.length 
      : 0;
    const avgRecv = recvRanks.length > 0 
      ? recvRanks.reduce((a, b) => a + b, 0) / recvRanks.length 
      : 0;

    const bestSent = sentRanks.length > 0 ? Math.min(...sentRanks) : 0;
    const bestRecv = recvRanks.length > 0 ? Math.min(...recvRanks) : 0;
    const topAssetPlayer = [...myTeamPlayers, ...opponentPlayers].reduce((best, cur) => 
      !best || cur.rank < best.rank ? cur : best
    , null as MatchedRankingPlayer | null);

    // In fantasy rankings: lower rank number = higher value
    const avgRankGain = Math.round(avgSent - avgRecv);

    return {
      avgSent: avgSent.toFixed(1),
      avgRecv: avgRecv.toFixed(1),
      bestSent,
      bestRecv,
      topAssetPlayer,
      avgRankGain,
      sentCount: myTeamPlayers.length,
      recvCount: opponentPlayers.length,
    };
  }, [isTrade, myTeamPlayers, opponentPlayers]);

  // Waiver metrics & pairwise matching
  const waiverStats = useMemo(() => {
    if (!isWaiver) return null;

    const dropRanks = myTeamPlayers.map((p) => p.rank);
    const addRanks = freeAgentPlayers.map((p) => p.rank);

    const avgDrop = dropRanks.length > 0 
      ? dropRanks.reduce((a, b) => a + b, 0) / dropRanks.length 
      : 0;
    const avgAdd = addRanks.length > 0 
      ? addRanks.reduce((a, b) => a + b, 0) / addRanks.length 
      : 0;

    // Positive = upgraded (e.g. drop rank 100, add rank 40 => 100 - 40 = +60 upgrade)
    const netRankUpgrade = Math.round(avgDrop - avgAdd);

    // Pairwise pairings: sort drops descending (worst first) and adds ascending (best first)
    const sortedDrops = [...myTeamPlayers].sort((a, b) => b.rank - a.rank);
    const sortedAdds = [...freeAgentPlayers].sort((a, b) => a.rank - b.rank);
    const maxPairs = Math.max(sortedDrops.length, sortedAdds.length);

    const pairs = [];
    for (let i = 0; i < maxPairs; i++) {
      const drop = sortedDrops[i] || null;
      const add = sortedAdds[i] || null;
      const delta = drop && add ? drop.rank - add.rank : null;
      pairs.push({ drop, add, delta });
    }

    return {
      avgDrop: avgDrop.toFixed(1),
      avgAdd: avgAdd.toFixed(1),
      netRankUpgrade,
      pairs,
      dropCount: myTeamPlayers.length,
      addCount: freeAgentPlayers.length,
    };
  }, [isWaiver, myTeamPlayers, freeAgentPlayers]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isTrade 
                ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' 
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}>
              {isTrade ? <ArrowLeftRight className="w-5 h-5" /> : <ArrowDownUp className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  {isTrade ? 'Trade Transaction Preview' : 'Waiver Transaction Preview'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isTrade 
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isTrade ? `${tradeStats?.sentCount}-for-${tradeStats?.recvCount} Trade` : `${waiverStats?.dropCount} Drop / ${waiverStats?.addCount} Add`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTrade ? (
                  <span>
                    Simulated deal between <strong className="text-slate-200">{myRoster?.teamName || 'Your Team'}</strong> and <strong className="text-slate-200">{opponentRoster?.teamName || opponentPlayers[0]?.rosterStatus.teamName || 'Opponent'}</strong>
                  </span>
                ) : (
                  <span>
                    Comparing drop candidates from <strong className="text-slate-200">{myRoster?.teamName || 'Your Team'}</strong> against waiver targets
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearSelection();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
              title="Clear selections and close"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ===================== TRADE VIEW ===================== */}
          {isTrade && tradeStats && (
            <>
              {/* Trade Analysis Value Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 shadow-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Avg Rank Sent
                    </span>
                    <span className="text-base sm:text-lg font-bold text-rose-300 font-mono">
                      #{tradeStats.avgSent}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Avg Rank Recv
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono">
                      #{tradeStats.avgRecv}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Avg Rank Delta
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      {tradeStats.avgRankGain >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                            +{tradeStats.avgRankGain}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-base sm:text-lg font-bold text-rose-400 font-mono">
                            {tradeStats.avgRankGain}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Top Asset In Deal
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200 truncate block">
                      {tradeStats.topAssetPlayer?.playerName} (#{tradeStats.topAssetPlayer?.rank})
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Trade Columns (with optional 3rd Free Agent column) */}
              <div className={`grid grid-cols-1 ${freeAgentPlayers.length > 0 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {/* Column 1: You Send */}
                <div className="rounded-2xl border border-rose-500/20 bg-slate-950/40 p-4 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                        <UserMinus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                          You Send
                        </h3>
                        <p className="text-xs text-slate-400 truncate max-w-[170px]">
                          {myRoster?.teamName || 'Your Roster'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {myTeamPlayers.length} {myTeamPlayers.length === 1 ? 'Player' : 'Players'}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {myTeamPlayers.map((player) => (
                      <PlayerTradeCard key={player.id} player={player} type="send" />
                    ))}
                  </div>
                </div>

                {/* Column 2: You Receive */}
                <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/40 p-4 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          You Receive
                        </h3>
                        <p className="text-xs text-slate-400 truncate max-w-[170px]">
                          {opponentRoster?.teamName || opponentPlayers[0]?.rosterStatus.teamName || 'Opposing Roster'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {opponentPlayers.length} {opponentPlayers.length === 1 ? 'Player' : 'Players'}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {opponentPlayers.map((player) => (
                      <PlayerTradeCard key={player.id} player={player} type="receive" />
                    ))}
                  </div>
                </div>

                {/* Column 3: Accompanying Free Agent Targets (if selected) */}
                {freeAgentPlayers.length > 0 && (
                  <div className="rounded-2xl border border-sky-500/20 bg-slate-950/40 p-4 space-y-3 flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                            Free Agent Targets
                          </h3>
                          <p className="text-xs text-slate-400">
                            Waiver adds to pair with trade
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {freeAgentPlayers.length} Available
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {freeAgentPlayers.map((player) => (
                        <PlayerTradeCard key={player.id} player={player} type="free_agent" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===================== WAIVER VIEW ===================== */}
          {isWaiver && waiverStats && (
            <>
              {/* Waiver Value Assessment Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      waiverStats.netRankUpgrade > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : waiverStats.netRankUpgrade === 0
                        ? 'bg-slate-700/20 text-slate-300 border-slate-700/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {waiverStats.netRankUpgrade >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Consensus Value Verdict
                      </span>
                      <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        {waiverStats.netRankUpgrade > 0 ? (
                          <>
                            <span className="text-emerald-400">Value Upgrade (+{waiverStats.netRankUpgrade} Ranks)</span>
                            <span className="text-xs font-normal text-slate-400">Target is higher ranked</span>
                          </>
                        ) : waiverStats.netRankUpgrade === 0 ? (
                          <>
                            <span className="text-slate-300">Even Rank Exchange</span>
                          </>
                        ) : (
                          <>
                            <span className="text-rose-400">Value Downgrade ({waiverStats.netRankUpgrade} Ranks)</span>
                            <span className="text-xs font-normal text-slate-400">Drop candidate is higher ranked</span>
                          </>
                        )}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase block">Drop Avg</span>
                      <span className="text-sm font-bold text-rose-300 font-mono">#{waiverStats.avgDrop}</span>
                    </div>
                    <span className="text-slate-500 text-sm">➔</span>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase block">Add Avg</span>
                      <span className="text-sm font-bold text-emerald-300 font-mono">#{waiverStats.avgAdd}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Pairwise / Side-by-Side Comparison */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Transaction Comparison Breakdown</span>
                </h3>

                <div className="space-y-3">
                  {waiverStats.pairs.map((pair, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                    >
                      {/* Left: Drop Candidate */}
                      <div className="flex-1">
                        {pair.drop ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                              <UserMinus className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100 truncate">
                                  {pair.drop.playerName}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getPositionBadgeClass(pair.drop.pos)}`}>
                                  {pair.drop.pos}{pair.drop.posRank ? pair.drop.posRank : ''}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{pair.drop.team || 'FA'}</span>
                                <span>•</span>
                                <span className="font-mono text-rose-300 font-semibold">Rank #{pair.drop.rank}</span>
                                <span>•</span>
                                <span className="text-slate-400 truncate max-w-[120px]">
                                  {pair.drop.rosterStatus.teamName || 'Your Team'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                            Empty Roster Spot / No direct drop paired
                          </div>
                        )}
                      </div>

                      {/* Middle: Delta Indicator */}
                      <div className="flex items-center justify-center shrink-0 px-2">
                        {pair.delta !== null ? (
                          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                            pair.delta > 0
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : pair.delta === 0
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}>
                            {pair.delta > 0 ? (
                              <>
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>+{pair.delta} Ranks</span>
                              </>
                            ) : pair.delta === 0 ? (
                              <span>Even</span>
                            ) : (
                              <>
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>{pair.delta} Ranks</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">➔</span>
                        )}
                      </div>

                      {/* Right: Free Agent Add */}
                      <div className="flex-1">
                        {pair.add ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100 truncate">
                                  {pair.add.playerName}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getPositionBadgeClass(pair.add.pos)}`}>
                                  {pair.add.pos}{pair.add.posRank ? pair.add.posRank : ''}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{pair.add.team || 'FA'}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-300 font-semibold">Rank #{pair.add.rank}</span>
                                <span>•</span>
                                <span className="text-emerald-400/90 font-medium">Free Agent</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                            No add paired
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Consensus rank values are derived from your imported rankings data.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              Done Previewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlayerTradeCardProps {
  player: MatchedRankingPlayer;
  type: 'send' | 'receive' | 'free_agent';
}

const PlayerTradeCard: React.FC<PlayerTradeCardProps> = ({ player, type }) => {
  return (
    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
          type === 'send'
            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            : type === 'receive'
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
        }`}>
          #{player.rank}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 truncate">
              {player.playerName}
            </span>
            <span className={`px-1 py-0.2 rounded text-[10px] font-bold border ${getPositionBadgeClass(player.pos)}`}>
              {player.pos}{player.posRank ? player.posRank : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <span>{player.team || 'FA'}</span>
            {player.bye && (
              <>
                <span>•</span>
                <span>Bye {player.bye}</span>
              </>
            )}
            {player.tier && (
              <>
                <span>•</span>
                <span>Tier {player.tier}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
          type === 'send'
            ? 'bg-rose-500/10 text-rose-300'
            : type === 'receive'
            ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-sky-500/10 text-sky-300'
        }`}>
          {type === 'send' ? 'Out' : type === 'receive' ? 'In' : 'FA'}
        </span>
      </div>
    </div>
  );
};
