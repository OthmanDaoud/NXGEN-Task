export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
      Loading...
    </div>
  );
}
