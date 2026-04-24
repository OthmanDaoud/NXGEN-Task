import { format } from "date-fns";
import { DeviceCard } from "../components/DeviceCard";
import { DeviceForm } from "../components/DeviceForm";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { KpiCard } from "../components/KpiCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useDevices } from "../hooks/useDevices";

export function DashboardPage() {
  const devicesQuery = useDevices();

  const totalDevices = devicesQuery.data?.length ?? 0;
  const newestDevice = devicesQuery.data?.[0];
  const latestAddedAt = newestDevice
    ? format(new Date(newestDevice.created_at), "yyyy-MM-dd HH:mm")
    : "No devices yet";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Device Overview</h1>

      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <KpiCard label="Total devices" value={String(totalDevices)} />
        <KpiCard label="Latest device added" value={latestAddedAt} />
      </div>

      <DeviceForm />

      {devicesQuery.isLoading ? <LoadingSpinner /> : null}
      {devicesQuery.error ? (
        <ErrorState message="Failed to load devices. Make sure backend is running." />
      ) : null}

      {!devicesQuery.isLoading && !devicesQuery.error && totalDevices === 0 ? (
        <EmptyState
          title="No devices registered"
          description="Add your first IoT device using the form above."
        />
      ) : null}

      {devicesQuery.data && devicesQuery.data.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {devicesQuery.data.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
