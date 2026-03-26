import { motion } from "framer-motion";
import { X } from "lucide-react";
import FilterDropdown from "@/shared/components/FilterDropdown";

const CATEGORIES = ["BOOKS", "ELECTRONICS", "FURNITURE", "CYCLES", "SPORTS", "CLOTHING", "NOTES", "OTHERS"];
const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const CONDITION_LABEL = { NEW: "New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair" };
const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({ value: category, label: category }));
const CONDITION_OPTIONS = CONDITIONS.map((condition) => ({
  value: condition,
  label: CONDITION_LABEL[condition] || condition,
}));

export const ListingFilterPanel = ({ filters, onUpdateFilter, onClearFilters, activeFilterCount }) => (
  <div className="relative z-20">
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
        <FilterDropdown
          value={filters.category}
          onChange={(val) => onUpdateFilter("category", val)}
          options={CATEGORY_OPTIONS}
          placeholder="All Categories"
          searchable
        />
      </div>

      <div className="z-10">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Condition</label>
        <FilterDropdown
          value={filters.condition}
          onChange={(val) => onUpdateFilter("condition", val)}
          options={CONDITION_OPTIONS}
          placeholder="Any Condition"
          searchable={false}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Min Price (₹)</label>
        <input
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(e) => onUpdateFilter("minPrice", e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Max Price (₹)</label>
        <input
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(e) => onUpdateFilter("maxPrice", e.target.value)}
          placeholder="Any"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
    </div>

    {activeFilterCount > 0 && (
      <button
        onClick={onClearFilters}
        className="mb-4 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition"
      >
        <X size={13} /> Clear all filters
      </button>
    )}
  </div>
);

export const ActiveFiltersChips = ({ filters, onUpdateFilter }) => {
  const CONDITION_LABEL = { NEW: "New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair" };
  const hasActiveFilters = [filters.category, filters.condition, filters.minPrice, filters.maxPrice].some(Boolean);

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.category && (
        <span
          onClick={() => onUpdateFilter("category", "")}
          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition"
        >
          {filters.category} <X size={10} />
        </span>
      )}
      {filters.condition && (
        <span
          onClick={() => onUpdateFilter("condition", "")}
          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition"
        >
          {CONDITION_LABEL[filters.condition]} <X size={10} />
        </span>
      )}
      {filters.minPrice && (
        <span
          onClick={() => onUpdateFilter("minPrice", "")}
          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition"
        >
          Min ₹{filters.minPrice} <X size={10} />
        </span>
      )}
      {filters.maxPrice && (
        <span
          onClick={() => onUpdateFilter("maxPrice", "")}
          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition"
        >
          Max ₹{filters.maxPrice} <X size={10} />
        </span>
      )}
    </div>
  );
};
