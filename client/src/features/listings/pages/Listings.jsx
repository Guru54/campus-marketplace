import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/features/listings/components/ListingCard";
import FilterDropdown from "@/shared/components/FilterDropdown";
import SearchDropdown from "@/shared/components/SearchDropdown";
import { useAuth } from "@/context/AuthContext";
import { useListingsQuery, useSuggestionsQuery } from "@/shared/hooks/useQuery";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { ListingFilterPanel, ActiveFiltersChips } from "@/features/listings/components/ListingFilters";
import { CardSkeleton } from "@/shared/components/skeletons";

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "oldest",     label: "Oldest First" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

const Listings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search:   searchParams.get("search")   || "",
    category: searchParams.get("category") || "",
    condition:searchParams.get("condition")|| "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort:     searchParams.get("sort")     || "newest",
    page:     Number(searchParams.get("page")) || 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input to reduce API calls (wait 300ms after user stops typing)
  const debouncedSearchInput = useDebounce(searchInput, 300);

  // React Query hooks
  const { data: listingsData, isLoading: listingsLoading } = useListingsQuery(filters);
  const { data: suggestionsData, isLoading: suggestLoading } = useSuggestionsQuery(debouncedSearchInput);

  const listings = listingsData?.data?.data?.listings || [];
  const pagination = listingsData?.data?.data?.pagination || {};
  const suggestions = suggestionsData?.data?.data?.suggestions || [];

  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const p = { ...prev, [key]: value };
      // Update URL
      const params = {};
      Object.entries(p).forEach(([k, v]) => { if (v) params[k] = v; });
      setSearchParams(params, { replace: true });
      if (key !== "page") p.page = 1;
      return p;
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", category: "", condition: "", minPrice: "", maxPrice: "", sort: "newest", page: 1 });
  };
 
  const activeFilterCount = [filters.category, filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketplace</h1>
            {!listingsLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {pagination.total} listing{pagination.total !== 1 ? "s" : ""} on your campus
              </p>
            )}
          </div>
          {user && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
            >
              <Plus size={16} />
              Post Listing
            </Link>
          )}
        </div>

        <div className="relative z-30 flex gap-3 mb-4">
          <div className="flex-1">
            <SearchDropdown
              value={searchInput}
              onChange={(val) => {
                setSearchInput(val);
                if (!val) updateFilter("search", "");
              }}
              onSelect={(item) => {
                setSearchInput(item.title);
                setSuggestions([]);
                updateFilter("search", item.title);
              }}
              onSubmit={(val) => updateFilter("search", val)}
              suggestions={suggestions}
              loading={suggestLoading}
              placeholder="Search listings…"
              renderItem={(item) => (
                <div className="flex items-center gap-3 w-full">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]} alt=""
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-100 dark:border-white/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-base">
                      {item.categoryEmoji || "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400">₹{item.price?.toLocaleString("en-IN")}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{item.category}</span>
                </div>
              )}
            />
          </div>

          <div className="w-[210px]">
            <FilterDropdown
              value={filters.sort}
              onChange={(val) => updateFilter("sort", val)}
              options={SORT_OPTIONS}
              placeholder="Sort"
              searchable={false}
              triggerClassName="rounded-xl py-2.5 bg-white dark:bg-white/5"
            />
          </div>

          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer ${
              showFilters || activeFilterCount > 0
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <ListingFilterPanel filters={filters} onUpdateFilter={updateFilter} onClearFilters={clearFilters} activeFilterCount={activeFilterCount} />
            </motion.div>
          )}
        </AnimatePresence>

        {!showFilters && <ActiveFiltersChips filters={filters} onUpdateFilter={updateFilter} />}

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <CardSkeleton count={12} />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No listings found</p>
            <p className="text-sm text-slate-400 mt-1">Try different filters or be the first to post!</p>
            {user && (
              <Link to="/create" className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={15} /> Post a Listing
              </Link>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </motion.div>
        )}

        {!listingsLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => updateFilter("page", filters.page - 1)}
              disabled={filters.page <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - filters.page) <= 1)
              .reduce((acc, p, idx, arr) => {
                const prev = arr[idx - 1];
                if (idx > 0 && p - prev > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span key={`dot-${i}`} className="px-2 text-slate-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => updateFilter("page", item)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      filters.page === item
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                )
              )
            }

            <button
              onClick={() => updateFilter("page", filters.page + 1)}
              disabled={filters.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Listings;
