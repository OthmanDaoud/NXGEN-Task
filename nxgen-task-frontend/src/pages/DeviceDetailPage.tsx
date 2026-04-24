import { subDays, subHours } from "date-fns";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { RangePicker, type Preset } from "../components/RangePicker";
import { ReadingForm } from "../components/ReadingForm";
import { ReadingsTable } from "../components/ReadingsTable";
import { TimeSeriesChart } from "../components/TimeSeriesChart";
import { useDeviceData } from "../hooks/useDeviceData";
import type { ListDataQuery } from "../types/data";

type Resolution = "auto" | "5m" | "15m" | "1h" | "1d";

export function DeviceDetailPage() {
  const { id = "" } = useParams();
  const [preset, setPreset] = useState<Preset>("24h");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [resolution, setResolution] = useState<Resolution>("auto");
  const [tableSelectedMetrics, setTableSelectedMetrics] = useState<string[]>(
    [],
  );
  const [tableMinValue, setTableMinValue] = useState("");
  const [tableMaxValue, setTableMaxValue] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);

  const query = useMemo<ListDataQuery>(() => {
    const now = new Date();
    if (preset === "1h")
      return { from: subHours(now, 1).toISOString(), limit: 100 };
    if (preset === "24h")
      return { from: subHours(now, 24).toISOString(), limit: 500 };
    if (preset === "7d")
      return { from: subDays(now, 7).toISOString(), limit: 1000 };
    return {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      limit: 1000,
    };
  }, [preset, from, to]);

  const dataQuery = useDeviceData(id, query);

  const formatStatValue = (value: number) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(value);

  function isAggregateMetric(metricName: string) {
    return /(avg|average|min|max)/i.test(metricName);
  }

  const filteredReadings = useMemo(() => {
    const source = dataQuery.data ?? [];
    return source.filter((item) => !isAggregateMetric(item.metric));
  }, [dataQuery.data]);

  const metricOptions = useMemo(() => {
    const source = filteredReadings;
    return [...new Set(source.map((item) => item.metric))];
  }, [filteredReadings]);

  const unitOptions = useMemo(() => {
    const source = filteredReadings;
    return [...new Set(source.map((item) => item.unit))];
  }, [filteredReadings]);

  const unitByMetricMap = useMemo<Record<string, string[]>>(() => {
    const source = filteredReadings;
    const map: Record<string, Set<string>> = {};
    for (const item of source) {
      if (!map[item.metric]) {
        map[item.metric] = new Set();
      }
      map[item.metric].add(item.unit);
    }
    return Object.fromEntries(
      Object.entries(map).map(([metricName, units]) => [
        metricName,
        [...units],
      ]),
    );
  }, [filteredReadings]);

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const chartMetricOptions = metricOptions;
  const activeTableMetrics = useMemo(
    () =>
      tableSelectedMetrics.filter((metricName) =>
        metricOptions.includes(metricName),
      ),
    [tableSelectedMetrics, metricOptions],
  );
  const parsedTableMinValue = useMemo(() => {
    if (tableMinValue.trim() === "") {
      return undefined;
    }
    const parsed = Number(tableMinValue);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [tableMinValue]);
  const parsedTableMaxValue = useMemo(() => {
    if (tableMaxValue.trim() === "") {
      return undefined;
    }
    const parsed = Number(tableMaxValue);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [tableMaxValue]);
  const tableFilteredReadings = useMemo(() => {
    return filteredReadings.filter((reading) => {
      if (
        activeTableMetrics.length > 0 &&
        !activeTableMetrics.includes(reading.metric)
      ) {
        return false;
      }
      if (
        parsedTableMinValue !== undefined &&
        reading.value < parsedTableMinValue
      ) {
        return false;
      }
      if (
        parsedTableMaxValue !== undefined &&
        reading.value > parsedTableMaxValue
      ) {
        return false;
      }
      return true;
    });
  }, [
    filteredReadings,
    activeTableMetrics,
    parsedTableMinValue,
    parsedTableMaxValue,
  ]);
  const totalTablePages = Math.max(
    1,
    Math.ceil(tableFilteredReadings.length / tablePageSize),
  );
  const currentTablePage = Math.min(tablePage, totalTablePages);
  const paginatedTableReadings = useMemo(() => {
    const startIndex = (currentTablePage - 1) * tablePageSize;
    return tableFilteredReadings.slice(startIndex, startIndex + tablePageSize);
  }, [currentTablePage, tableFilteredReadings, tablePageSize]);

  const statsByMetric = useMemo<
    Record<
      string,
      { min: number; max: number; avg: number; unit: string; count: number }
    >
  >(() => {
    const statsMap = new Map<
      string,
      { min: number; max: number; sum: number; count: number; unit: string }
    >();
    for (const reading of filteredReadings) {
      const current = statsMap.get(reading.metric);
      if (!current) {
        statsMap.set(reading.metric, {
          min: reading.value,
          max: reading.value,
          sum: reading.value,
          count: 1,
          unit: reading.unit,
        });
      } else {
        current.min = Math.min(current.min, reading.value);
        current.max = Math.max(current.max, reading.value);
        current.sum += reading.value;
        current.count += 1;
      }
    }
    return Object.fromEntries(
      [...statsMap.entries()].map(([metricName, stats]) => [
        metricName,
        {
          min: stats.min,
          max: stats.max,
          avg: stats.sum / stats.count,
          unit: stats.unit,
          count: stats.count,
        },
      ]),
    );
  }, [filteredReadings]);

  const visibleMetrics = useMemo(() => {
    const availableSet = new Set(chartMetricOptions);
    const next = selectedMetrics.filter((metricName) =>
      availableSet.has(metricName),
    );
    if (next.length === 0) {
      return chartMetricOptions.length > 0 ? [chartMetricOptions[0]] : [];
    }
    if (!compareMode) {
      return [next[0]];
    }
    return next;
  }, [chartMetricOptions, compareMode, selectedMetrics]);

  function toggleVisibleMetric(metricName: string) {
    setSelectedMetrics((current) => {
      if (!compareMode) {
        return [metricName];
      }
      if (!current.includes(metricName)) {
        return [...current, metricName];
      }
      if (current.length === 1) {
        return current;
      }
      return current.filter((item) => item !== metricName);
    });
  }

  function handleTableMetricsChange(nextMetrics: string[]) {
    setTableSelectedMetrics(nextMetrics);
    setTablePage(1);
  }

  function handleTableMinValueChange(nextValue: string) {
    setTableMinValue(nextValue);
    setTablePage(1);
  }

  function handleTableMaxValueChange(nextValue: string) {
    setTableMaxValue(nextValue);
    setTablePage(1);
  }

  function handleTablePageSizeChange(nextPageSize: number) {
    setTablePageSize(nextPageSize);
    setTablePage(1);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Device Details</h1>
        </div>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 px-4 text-sm text-slate-200 hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mt-3">
          <RangePicker
            preset={preset}
            from={from}
            to={to}
            onPresetChange={setPreset}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </div>
      </div>

      <ReadingForm
        deviceId={id}
        metricOptions={metricOptions}
        unitOptions={unitOptions}
        unitByMetricMap={unitByMetricMap}
      />

      {dataQuery.isLoading ? <LoadingSpinner /> : null}
      {dataQuery.error ? (
        <ErrorState message="Failed to load data for this device." />
      ) : null}

      {!dataQuery.isLoading &&
      !dataQuery.error &&
      filteredReadings.length === 0 ? (
        <EmptyState
          title="No readings yet"
          description="Use the Add Reading form to create the first data point."
        />
      ) : null}

      {filteredReadings.length > 0 ? (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex justify-between items-center gap-4 text-center">
       
              {" "}
              <div className="text-left w-full">
                <p className="text-lg font-medium text-slate-200">
                  Chart controls
                </p>
              </div>
              <div className="flex w-full flex-wrap justify-end items-end gap-3">
                {" "}
                <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={compareMode}
                    onChange={(event) => setCompareMode(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                  />
                  Compare metrics
                </label>
                <label className="flex min-w-36 flex-col gap-1 text-sm text-slate-300">
                  Resolution
                  <select
                    value={resolution}
                    onChange={(event) =>
                      setResolution(event.target.value as Resolution)
                    }
                    className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100"
                  >
                    <option value="auto">Auto</option>
                    <option value="5m">5 min</option>
                    <option value="15m">15 min</option>
                    <option value="1h">1 hour</option>
                    <option value="1d">1 day</option>
                  </select>
                </label>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-300">
              Show metrics
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {chartMetricOptions.map((metricName) => {
                const isActive = visibleMetrics.includes(metricName);
                const stats = statsByMetric[metricName];
                return (
                  <button
                    key={metricName}
                    type="button"
                    onClick={() => toggleVisibleMetric(metricName)}
                    aria-label={
                      stats
                        ? `${metricName}, minimum ${formatStatValue(stats.min)} ${stats.unit}, maximum ${formatStatValue(stats.max)} ${stats.unit}, average ${formatStatValue(stats.avg)} ${stats.unit}`
                        : metricName
                    }
                    className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <span className="block text-sm font-medium">
                      {metricName}
                    </span>
                    {stats ? (
                      <span className="mt-0.5 block text-xs text-slate-400">
                        min {formatStatValue(stats.min)} • max{" "}
                        {formatStatValue(stats.max)} • avg{" "}
                        {formatStatValue(stats.avg)} {stats.unit}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <TimeSeriesChart
            readings={filteredReadings}
            visibleMetrics={visibleMetrics}
            statsByMetric={statsByMetric}
            resolution={resolution}
          />

          <ReadingsTable
            readings={paginatedTableReadings}
            availableMetrics={metricOptions}
            selectedMetrics={activeTableMetrics}
            onSelectedMetricsChange={handleTableMetricsChange}
            minValue={tableMinValue}
            maxValue={tableMaxValue}
            onMinValueChange={handleTableMinValueChange}
            onMaxValueChange={handleTableMaxValueChange}
            page={currentTablePage}
            totalPages={totalTablePages}
            pageSize={tablePageSize}
            totalCount={tableFilteredReadings.length}
            onPageChange={setTablePage}
            onPageSizeChange={handleTablePageSizeChange}
          />
        </>
      ) : null}
    </section>
  );
}
