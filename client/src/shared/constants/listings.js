/**
 * Listing Constants
 * Centralized enum labels and status definitions
 */

export const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

export const CONDITION_LABEL = {
  NEW: { text: "New", color: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  LIKE_NEW: { text: "Like New", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  GOOD: { text: "Good", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  FAIR: { text: "Fair", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
};

export const CATEGORY_LABEL = {
  BOOKS: "📚 Books",
  ELECTRONICS: "💻 Electronics",
  FURNITURE: "🪑 Furniture",
  CYCLES: "🚲 Cycles",
  SPORTS: "⚽ Sports",
  CLOTHING: "👕 Clothing",
  NOTES: "📝 Notes",
  OTHERS: "📦 Others",
};

export const STATUS_BADGE = {
  ACTIVE: { text: "Available", color: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  RESERVED: { text: "Reserved", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  SOLD: { text: "Sold", color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  EXPIRED: { text: "Expired", color: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400" },
};

export const STATUS_OPTIONS = ["ACTIVE", "RESERVED", "SOLD", "EXPIRED"];

export const CATEGORIES = Object.keys(CATEGORY_LABEL);

export const CONDITIONS = CONDITION_OPTIONS.map(c => c.value);
