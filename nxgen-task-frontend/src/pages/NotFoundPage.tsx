import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-100">Page not found</h1>
      <p className="mt-2 text-slate-400">The route you entered does not exist.</p>
      <Link
        to="/"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-500 px-4 text-white hover:bg-indigo-400"
      >
        Go to dashboard
      </Link>
    </section>
  );
}
