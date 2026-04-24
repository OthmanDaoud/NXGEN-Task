import { format } from "date-fns";
import type { Reading } from "../types/data";

type ReadingsTableProps = {
  readings: Reading[];
  availableMetrics: string[];
  selectedMetrics: string[];
  onSelectedMetricsChange: (next: string[]) => void;
  minValue: string;
  maxValue: string;
  onMinValueChange: (next: string) => void;
  onMaxValueChange: (next: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
};

export function ReadingsTable({
  readings,
  availableMetrics,
  selectedMetrics,
  onSelectedMetricsChange,
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
  page,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: ReadingsTableProps) {
  function toggleMetric(metricName: string) {
    if (selectedMetrics.includes(metricName)) {
      onSelectedMetricsChange(selectedMetrics.filter((current) => current !== metricName));
      return;
    }
    onSelectedMetricsChange([...selectedMetrics, metricName]);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="space-y-4 border-b border-slate-800 px-4 py-3">
        <p className="text-sm font-medium text-slate-200">Recent raw readings</p>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Filter by metric</p>
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((metricName) => {
                const isActive = selectedMetrics.includes(metricName);
                return (
                  <button
                    key={metricName}
                    type="button"
                    onClick={() => toggleMetric(metricName)}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {metricName}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Value greater than or equal
              <input
                type="number"
                inputMode="decimal"
                value={minValue}
                onChange={(event) => onMinValueChange(event.target.value)}
                placeholder="No minimum"
                className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Value lower than or equal
              <input
                type="number"
                inputMode="decimal"
                value={maxValue}
                onChange={(event) => onMaxValueChange(event.target.value)}
                placeholder="No maximum"
                className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Metric</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {readings.length === 0 ? (
              <tr className="border-t border-slate-800 bg-slate-950/40">
                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  No readings match current filters.
                </td>
              </tr>
            ) : (
              readings.map((reading) => (
                <tr key={reading.id} className="border-t border-slate-800 bg-slate-950/40">
                  <td className="px-3 py-2 text-slate-300">
                    {format(new Date(reading.timestamp), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="px-3 py-2 text-slate-200">{reading.metric}</td>
                  <td className="px-3 py-2 font-mono text-slate-100">{reading.value}</td>
                  <td className="px-3 py-2 text-slate-300">{reading.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-3">
        <p className="text-sm text-slate-300">
          Showing {readings.length} of {totalCount} readings
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-2 text-slate-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="min-h-11 rounded-lg border border-slate-700 px-3 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="min-w-24 text-center text-sm text-slate-300">
            Page {page} / {totalPages}
          </p>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="min-h-11 rounded-lg border border-slate-700 px-3 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
