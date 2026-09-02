import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ShieldAlert,
  UserX,
  Plus,
  Check,
} from 'lucide-react';
import { MatchedRankingPlayer } from '../../lib/rankings/types';
import { useRankings } from '../../context/RankingsContext';
import { PaginationControls } from './PaginationControls';
import { getPositionBadgeClass } from './RankingsPreviewTable';

interface RankingsTableProps {
  data: MatchedRankingPlayer[];
}

export const RankingsTable: React.FC<RankingsTableProps> = ({
  data,
}) => {
  const { 
    selectedPlayerIds, 
    togglePlayerSelection, 
    selectPlayers, 
    deselectPlayers,
    setIsUnmatchedModalOpen 
  } = useRankings();

  // Sorting and Pagination states for TanStack Table
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rank', desc: false }
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  // Table columns definition
  const columns = useMemo<ColumnDef<MatchedRankingPlayer>[]>(() => [
    // 1. Select Checkbox
    {
      id: 'select',
      header: ({ table }) => {
        const currentPageRows = table.getRowModel().rows;
        const pagePlayerIds = currentPageRows.map((r) => r.original.id);
        const allSelected = pagePlayerIds.length > 0 && pagePlayerIds.every((id) => selectedPlayerIds.includes(id));
        const someSelected = pagePlayerIds.some((id) => selectedPlayerIds.includes(id));

        return (
          <div className="flex items-center justify-center px-1">
            <input
              type="checkbox"
              ref={(input) => {
                if (input) {
                  input.indeterminate = !allSelected && someSelected;
                }
              }}
              checked={allSelected}
              onChange={() => {
                if (allSelected) {
                  deselectPlayers(pagePlayerIds);
                } else {
                  selectPlayers(pagePlayerIds);
                }
              }}
              title={allSelected ? 'Deselect page' : 'Select all on page'}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const isSelected = selectedPlayerIds.includes(row.original.id);
        return (
          <div className="flex items-center justify-center px-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => togglePlayerSelection(row.original.id)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        );
      },
      enableSorting: false,
      size: 40,
    },

    // 2. Rank
    {
      accessorKey: 'rank',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Rank</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-slate-100 text-sm">
              #{item.rank}
            </span>
            {item.tier && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                T{item.tier}
              </span>
            )}
          </div>
        );
      },
      size: 85,
    },

    // 3. Player Name & Info
    {
      accessorKey: 'playerName',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Player</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        const hasAlias = item.originalCsvName && item.originalCsvName !== item.playerName;

        return (
          <div className="flex items-center gap-2.5">
            <div>
              <div className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                <span>{item.playerName}</span>
                {item.sleeperPlayer?.injury_status && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase border ${
                    item.sleeperPlayer.injury_status === 'Questionable' 
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                  }`}>
                    {item.sleeperPlayer.injury_status}
                  </span>
                )}
              </div>
              {hasAlias && (
                <p className="text-[11px] text-slate-500 truncate max-w-xs">
                  CSV: {item.originalCsvName}
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    // 4. Position & Positional Rank
    {
      accessorKey: 'pos',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>POS</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs border ${getPositionBadgeClass(item.pos)}`}>
            {item.pos}{item.posRank ? item.posRank : ''}
          </span>
        );
      },
      size: 90,
    },

    // 5. NFL Team
    {
      accessorKey: 'team',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Team</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const team = row.original.team;
        return (
          <span className="font-mono font-medium text-slate-300 text-xs">
            {team || '—'}
          </span>
        );
      },
      size: 80,
    },

    // 6. Bye Week
    {
      accessorKey: 'bye',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Bye</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const bye = row.original.bye;
        return (
          <span className="font-mono text-slate-400 text-xs">
            {bye ? `W${bye}` : '—'}
          </span>
        );
      },
      size: 70,
    },

    // 7. Sleeper Roster Status
    {
      id: 'rosterStatus',
      accessorFn: (row) => {
        if (row.rosterStatus.type === 'free_agent') return '0_free_agent';
        if (row.rosterStatus.isMyTeam) return '1_my_team';
        return `2_${row.rosterStatus.teamName || 'rostered'}`;
      },
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Sleeper Status</span>
            {isSorted === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
            {isSorted === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
          </button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        const isFA = item.rosterStatus.type === 'free_agent';
        const isMyTeam = item.rosterStatus.isMyTeam;

        if (isFA) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free Agent
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {item.rosterStatus.avatarUrl ? (
              <img
                src={item.rosterStatus.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full ring-1 ring-slate-700 object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                {item.rosterStatus.teamName?.[0] || 'T'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-200 text-xs truncate max-w-[130px]">
                  {item.rosterStatus.teamName}
                </span>
                {isMyTeam && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
                    MY TEAM
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                {item.rosterStatus.isStarter ? (
                  <span className="text-amber-400 font-semibold">Starter</span>
                ) : item.rosterStatus.isReserve ? (
                  <span className="text-rose-400 font-semibold">IR/Reserve</span>
                ) : item.rosterStatus.isTaxi ? (
                  <span className="text-purple-400 font-semibold">Taxi</span>
                ) : (
                  <span className="text-slate-400">Bench</span>
                )}
                {item.rosterStatus.ownerDisplayName && (
                  <span className="truncate max-w-[100px] text-slate-500">
                    • {item.rosterStatus.ownerDisplayName}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    // 8. Match Diagnostic Status
    {
      accessorKey: 'isMatched',
      header: () => (
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] text-center block">
          Match
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-center">
            {item.isMatched ? (
              <span title="Linked to Sleeper NFL Database" className="inline-flex text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsUnmatchedModalOpen(true)}
                title="Unmatched with Sleeper player database. Click to inspect."
                className="inline-flex text-amber-400 hover:text-amber-300 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      size: 60,
    },

    // 9. Quick Action Column
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const isSelected = selectedPlayerIds.includes(row.original.id);
        return (
          <div className="flex justify-end pr-2">
            <button
              type="button"
              onClick={() => togglePlayerSelection(row.original.id)}
              className={`p-1 rounded-lg border text-xs transition-all ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-700'
              }`}
              title={isSelected ? 'Remove from selection' : 'Select player'}
            >
              {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      },
      size: 50,
    },
  ], [selectedPlayerIds, selectPlayers, deselectPlayers, togglePlayerSelection, setIsUnmatchedModalOpen]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-xl backdrop-blur-md flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="py-3.5 px-3 first:pl-4 last:pr-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                  <UserX className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="font-bold text-slate-200 text-base">No matching players found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search query, position filter, roster status, or rank range.
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedPlayerIds.includes(row.original.id);
                const isMyTeam = row.original.rosterStatus.isMyTeam;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/40'
                        : isMyTeam
                        ? 'bg-emerald-950/10 hover:bg-slate-800/50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-3 px-3 first:pl-4 last:pr-4"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TanStack Table Pagination Controls */}
      <PaginationControls
        table={table}
        totalFilteredRows={data.length}
      />
    </div>
  );
};
