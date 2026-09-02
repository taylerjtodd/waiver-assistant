import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface PaginationControlsProps<TData> {
  table: Table<TData>;
  totalFilteredRows: number;
}

export function PaginationControls<TData>({
  table,
  totalFilteredRows,
}: PaginationControlsProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  const startRow = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
      {/* Left: Row count & page size */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="text-slate-200 font-semibold">{startRow}–{endRow}</span> of{' '}
          <span className="text-slate-200 font-semibold">{totalFilteredRows}</span> players
        </span>

        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <span className="text-slate-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {[25, 50, 100, 250, 1000].map((size) => (
              <option key={size} value={size}>
                {size === 1000 ? 'All' : size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 mr-2">
          Page <span className="font-semibold text-slate-200">{pageCount === 0 ? 0 : pageIndex + 1}</span> of{' '}
          <span className="font-semibold text-slate-200">{pageCount}</span>
        </span>

        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="First Page"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title="Next Page"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          title="Last Page"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
