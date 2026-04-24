import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Cpu } from "lucide-react";
import type { Device } from "../types/device";

type DeviceCardProps = {
  device: Device;
};

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Link
      to={`/devices/${device.id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-indigo-500/60 hover:bg-slate-800/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            {device.name}
          </h3>
        </div>
        <Cpu className="h-5 w-5 text-indigo-400" aria-hidden />
      </div>
      <p className="mt-4 text-sm text-slate-400">
        Added{" "}
        {formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}
      </p>
    </Link>
  );
}
