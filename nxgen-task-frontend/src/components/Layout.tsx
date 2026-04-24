import { Activity, RadioTower } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <RadioTower className="h-5 w-5 text-indigo-400" />
            IoT Dashboard
          </Link>
          <nav>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              <Activity className="mr-2 h-4 w-4" />
              Devices
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
