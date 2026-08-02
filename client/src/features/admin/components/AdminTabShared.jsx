import { ChevronLeft, ChevronRight } from "lucide-react";

export const PageControls = ({ page, totalPages, onChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-lg" />
    ))}
  </div>
);
