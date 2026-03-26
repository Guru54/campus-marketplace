/**
 * Reusable Skeleton Loaders
 * Loading placeholders for consistent UX
 */

// ── Card Skeleton ──────────────────────────────────────
export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-white/10 mb-3" />
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3 mb-2" />
        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
      </div>
    ))}
  </div>
);

// ── Profile Skeleton ───────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="animate-pulse max-w-xl mx-auto space-y-4 pt-10">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
      </div>
    </div>
    <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
  </div>
);

// ── List Skeleton ──────────────────────────────────────
export const ListSkeleton = ({ count = 5 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ── Image Gallery Skeleton ────────────────────────────
export const GallerySkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-white/10" />
    <div className="flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-16 h-16 rounded-lg bg-slate-200 dark:bg-white/10" />
      ))}
    </div>
  </div>
);

// ── Text Skeleton ──────────────────────────────────────
export const TextSkeleton = ({ lines = 3, fullWidth = false }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-slate-200 dark:bg-white/10 rounded ${fullWidth ? "w-full" : i === lines - 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </div>
);

// ── Listing Detail Skeleton ────────────────────────────
export const ListingDetailSkeleton = () => (
  <div className="animate-pulse max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
    <GallerySkeleton />
    <div className="space-y-4 py-4">
      <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
      <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-10 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
      <TextSkeleton lines={4} fullWidth />
      <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-xl" />
    </div>
  </div>
);

// ── Chat Skeleton ──────────────────────────────────────
export const ChatSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
      </div>
    ))}
  </div>
);

// ── Form Skeleton ──────────────────────────────────────
export const FormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i}>
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/4 mb-2" />
        <div className="h-10 bg-slate-200 dark:bg-white/10 rounded" />
      </div>
    ))}
    <div className="h-10 bg-slate-200 dark:bg-white/10 rounded" />
  </div>
);
