import DatePicker from "react-datepicker";
import { forwardRef } from "react";
import type { InputHTMLAttributes, KeyboardEvent } from "react";

type Preset = "1h" | "24h" | "7d" | "custom";

type RangePickerProps = {
  preset: Preset;
  from: string;
  to: string;
  onPresetChange: (value: Preset) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

type DateTimeFieldProps = {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: string) => void;
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

const DatePickerInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function DatePickerInput(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    );
  },
);

function DateTimeField({ id, label, value, disabled, minDate, maxDate, onChange }: DateTimeFieldProps) {
  const selectedDate = parseDateTimeLocal(value);
  const handleNowShortcut = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key.toLowerCase() !== "t") return;
    event.preventDefault();
    onChange(formatDateTimeLocal(new Date()));
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={(date: Date | null) => onChange(date ? formatDateTimeLocal(date) : "")}
        showTimeSelect
        timeIntervals={5}
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="dd/mm/yyyy hh:mm"
        minDate={minDate}
        maxDate={maxDate}
        onKeyDown={handleNowShortcut}
        customInput={<DatePickerInput />}
        disabled={disabled}
        isClearable
      />
      <p className="text-xs text-slate-400">
        Press t for set current time.
      </p>
    </div>
  );
}

export function RangePicker({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: RangePickerProps) {
  const isCustom = preset === "custom";
  const fromDate = parseDateTimeLocal(from) ?? undefined;
  const toDate = parseDateTimeLocal(to) ?? undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="range-preset" className="text-sm font-medium text-slate-300">
          Time range
        </label>
        <select
          id="range-preset"
          value={preset}
          onChange={(event) => onPresetChange(event.target.value as Preset)}
          className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100"
        >
          <option value="1h">Last 1 hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <DateTimeField
        id="range-from"
        label="From"
        value={from}
        onChange={onFromChange}
        maxDate={toDate}
        disabled={!isCustom}
      />
      <DateTimeField
        id="range-to"
        label="To"
        value={to}
        onChange={onToChange}
        minDate={fromDate}
        disabled={!isCustom}
      />
    </div>
  );
}

export type { Preset };
