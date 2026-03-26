import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

const SearchDropdown = ({
  value,
  onChange,
  onSelect,
  onSubmit,         // called on Enter key
  suggestions = [],
  loading = false,
  placeholder = "Search...",
  renderItem,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef    = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Open when there's input
  useEffect(() => {
    setOpen(value.trim().length >= 2);
  }, [value, suggestions]);

  const handleSelect = (item) => {
    onSelect(item);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      setOpen(false);
      onSubmit?.(value.trim());
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Input ─────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (value.trim().length >= 2) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl
            border border-slate-200 dark:border-white/15
            bg-white dark:bg-white/5
            text-slate-900 dark:text-white
            placeholder:text-slate-400 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            transition"
        />

        {/* Right icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Dropdown ──────────────────────────────────── */}
      {open && (
        <div className="absolute z-50 w-full mt-2
          rounded-xl border border-slate-200 dark:border-white/10
          bg-white dark:bg-slate-900
          shadow-xl dark:shadow-black/40
          overflow-hidden">

          {loading ? (
            <div className="flex items-center gap-3 px-4 py-4 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </div>

          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No results for &ldquo;{value}&rdquo;
            </div>

          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {suggestions.map((item, idx) => (
                <li
                  key={item._id || idx}
                  onMouseDown={() => handleSelect(item)}
                  className="flex items-center gap-3 px-4 py-2.5
                    cursor-pointer transition-colors text-sm
                    text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {renderItem ? renderItem(item) : (
                    <span>{item.label || item.title || item.name}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          {!loading && suggestions.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10
              text-xs text-slate-400 dark:text-slate-500">
              {suggestions.length} result{suggestions.length !== 1 ? "s" : ""}
              {" "}· Press Enter to search all
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
