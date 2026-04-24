import DatePicker from "react-datepicker";
import { forwardRef, useState, type FormEvent } from "react";
import { useCreateReading } from "../hooks/useDeviceData";

type ReadingFormProps = {
  deviceId: string;
  metricOptions: string[];
  unitOptions: string[];
  unitByMetricMap: Record<string, string[]>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLocal(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function parseDateTimeLocal(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  const date = new Date(year, month - 1, day, hour, minute);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date;
}

const DatePickerInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function DatePickerInput(props, ref) {
    const { className, ...restProps } = props;
    return (
      <input
        ref={ref}
        {...restProps}
        className={`min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      />
    );
  },
);

export function ReadingForm({
  deviceId,
  metricOptions,
  unitOptions,
  unitByMetricMap,
}: ReadingFormProps) {
  const [metric, setMetric] = useState("temperature");
  const [unit, setUnit] = useState("C");
  const [value, setValue] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");
  const createReading = useCreateReading(deviceId);
  const selectedTimestamp = parseDateTimeLocal(timestamp);

  const suggestedUnits = metric.trim() ? unitByMetricMap[metric.trim()] ?? [] : [];
  const availableUnits = suggestedUnits.length > 0 ? suggestedUnits : unitOptions;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericValue = Number(value);
    if (!metric.trim() || !unit.trim() || Number.isNaN(numericValue)) {
      setError("Metric, unit, and numeric value are required.");
      return;
    }
    setError("");
    await createReading.mutateAsync({
      metric: metric.trim(),
      unit: unit.trim(),
      value: numericValue,
      ...(timestamp ? { timestamp: new Date(timestamp).toISOString() } : {}),
    });
    setValue("");
    setTimestamp("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-800 bg-slate-900 p-4"
    >
      <h2 className="text-lg font-semibold text-slate-100">Add Reading</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex w-full flex-col gap-1 md:w-52">
          <label htmlFor="reading-metric" className="text-xs font-medium text-slate-300">
            Metric
          </label>
          <input
            id="reading-metric"
            value={metric}
            onChange={(event) => {
              const nextMetric = event.target.value;
              setMetric(nextMetric);
              const nextUnits = unitByMetricMap[nextMetric.trim()] ?? [];
              if (nextUnits.length === 1 && !unit.trim()) {
                setUnit(nextUnits[0]);
              }
            }}
            list="metric-options"
            placeholder="temperature"
            className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100"
            aria-label="Metric"
          />
        </div>
        <datalist id="metric-options">
          {metricOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <div className="flex w-full flex-col gap-1 md:w-36">
          <label htmlFor="reading-unit" className="text-xs font-medium text-slate-300">
            Unit
          </label>
          <input
            id="reading-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            list="unit-options"
            placeholder="C"
            className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100"
            aria-label="Unit"
          />
        </div>
        <datalist id="unit-options">
          {availableUnits.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <div className="flex w-full flex-col gap-1 md:w-36">
          <label htmlFor="reading-value" className="text-xs font-medium text-slate-300">
            Value
          </label>
          <input
            id="reading-value"
            type="number"
            step="any"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="25.1"
            className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100"
            aria-label="Value"
          />
        </div>

        <div className="flex w-full flex-col gap-1 md:w-60">
          <label htmlFor="reading-timestamp" className="text-xs font-medium text-slate-300">
            Timestamp (optional)
          </label>
          <DatePicker
            id="reading-timestamp"
            selected={selectedTimestamp}
            onChange={(date: Date | null) => setTimestamp(date ? formatDateTimeLocal(date) : "")}
            showTimeSelect
            timeIntervals={5}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Select date and time"
            customInput={<DatePickerInput aria-label="Timestamp" className="min-h-11 w-full" />}
            isClearable
          />
        </div>

        <button
          type="submit"
          disabled={createReading.isPending}
          className="min-h-11 w-full rounded-lg bg-indigo-500 px-4 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-32"
        >
          {createReading.isPending ? "Saving..." : "Save"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      {createReading.error ? (
        <p className="mt-2 text-sm text-red-300">Could not add reading.</p>
      ) : null}
    </form>
  );
}
