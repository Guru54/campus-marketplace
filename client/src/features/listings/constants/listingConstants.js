export const STATUS_BADGE = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  RESERVED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  SOLD: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  EXPIRED: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400",
};

export const CATEGORY_EMOJI = {
  BOOKS: "📚",
  ELECTRONICS: "💻",
  FURNITURE: "🪑",
  CYCLES: "🚲",
  SPORTS: "⚽",
  CLOTHING: "👗",
  NOTES: "📝",
  OTHERS: "📦",
};

export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
