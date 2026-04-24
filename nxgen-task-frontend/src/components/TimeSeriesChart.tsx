import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import type { Reading } from "../types/data";

type TimeSeriesChartProps = {
  readings: Reading[];
  visibleMetrics: string[];
  statsByMetric: Record<string, { min: number; max: number; avg: number; unit: string; count: number }>;
  resolution: "auto" | "5m" | "15m" | "1h" | "1d";
};

const lineColors = [
  "#818cf8",
  "#38bdf8",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#f87171",
  "#22d3ee",
  "#a78bfa",
];

export function TimeSeriesChart({
  readings,
  visibleMetrics,
  statsByMetric,
  resolution,
}: TimeSeriesChartProps) {
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const firstTimestamp = sortedReadings[0] ? new Date(sortedReadings[0].timestamp).getTime() : 0;
  const lastTimestamp = sortedReadings[sortedReadings.length - 1]
    ? new Date(sortedReadings[sortedReadings.length - 1].timestamp).getTime()
    : 0;
  const rangeMs = Math.max(0, lastTimestamp - firstTimestamp);

  function resolveBucketMs() {
    if (resolution === "5m") return 5 * 60 * 1000;
    if (resolution === "15m") return 15 * 60 * 1000;
    if (resolution === "1h") return 60 * 60 * 1000;
    if (resolution === "1d") return 24 * 60 * 60 * 1000;
    if (rangeMs > 30 * 24 * 60 * 60 * 1000) return 24 * 60 * 60 * 1000;
    if (rangeMs > 7 * 24 * 60 * 60 * 1000) return 60 * 60 * 1000;
    if (rangeMs > 24 * 60 * 60 * 1000) return 15 * 60 * 1000;
    return 5 * 60 * 1000;
  }

  const bucketMs = resolveBucketMs();

  const pointsByTimestamp = new Map<string, { bucketTs: number; timestamp: string; [metric: string]: number | string }>();

  const aggregatesByBucketMetric = new Map<string, { sum: number; count: number }>();
  for (const reading of sortedReadings) {
    const ts = new Date(reading.timestamp).getTime();
    const bucketTs = Math.floor(ts / bucketMs) * bucketMs;
    const key = String(bucketTs);
    const aggregateKey = `${key}::${reading.metric}`;
    const aggregate = aggregatesByBucketMetric.get(aggregateKey);
    if (!aggregate) {
      aggregatesByBucketMetric.set(aggregateKey, { sum: reading.value, count: 1 });
    } else {
      aggregate.sum += reading.value;
      aggregate.count += 1;
    }
    if (!pointsByTimestamp.has(key)) {
      pointsByTimestamp.set(key, {
        bucketTs,
        timestamp: new Date(bucketTs).toISOString(),
      });
    }
  }

  for (const [aggregateKey, aggregate] of aggregatesByBucketMetric.entries()) {
    const [bucketKey, metric] = aggregateKey.split("::");
    const point = pointsByTimestamp.get(bucketKey);
    if (point) {
      point[metric] = aggregate.sum / aggregate.count;
    }
  }

  let chartData = [...pointsByTimestamp.values()]
    .sort((a, b) => Number(a.bucketTs) - Number(b.bucketTs))
    .map((point) => ({
      ...point,
      dateLabel: format(new Date(point.timestamp), bucketMs >= 24 * 60 * 60 * 1000 ? "MM-dd" : "MM-dd HH:mm"),
    }));

  const maxPoints = 400;
  if (chartData.length > maxPoints) {
    const step = Math.ceil(chartData.length / maxPoints);
    chartData = chartData.filter((_, index) => index % step === 0);
  }

  const denseMode = chartData.length > 120;

  return (
    <div className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="dateLabel" minTickGap={denseMode ? 42 : 30} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} width={52} />
          <Legend />
          <Tooltip
            formatter={(value, name) => [Number(value ?? 0).toFixed(2), String(name)]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          {visibleMetrics.map((metric, index) => {
            const color = lineColors[index % lineColors.length];
            const stats = statsByMetric[metric];
            const lineName = stats
              ? `${metric} (${stats.unit})`
              : metric;
            return (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={lineName}
                stroke={color}
                strokeWidth={2}
                dot={denseMode ? false : { r: 2, fill: color }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
