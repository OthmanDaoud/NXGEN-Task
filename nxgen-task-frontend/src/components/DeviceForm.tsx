import { useState, type FormEvent } from "react";
import { useCreateDevice } from "../hooks/useDevices";

export function DeviceForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const createDevice = useCreateDevice();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Device name is required.");
      return;
    }
    setError("");
    await createDevice.mutateAsync({ name: name.trim() });
    setName("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-800 bg-slate-900 p-4"
    >
      <h2 className="text-lg font-semibold text-slate-100">Register Device</h2>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="device-name" className="sr-only">
          Device Name
        </label>
        <input
          id="device-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Living Room Sensor"
          className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={createDevice.isPending}
          className="min-h-11 rounded-lg bg-indigo-500 px-4 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createDevice.isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      {createDevice.error ? (
        <p className="mt-2 text-sm text-red-300">Could not create device.</p>
      ) : null}
    </form>
  );
}
