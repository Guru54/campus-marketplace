import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const FilterDropdown = ({
  value = "",
  onChange,
  options = [],
  placeholder = "Select...",
  searchable = true,
  triggerClassName = "",
  panelClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => (o.label || "").toLowerCase().includes(q));
  }, [options, search, searchable]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val) => {
    onChange?.(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative w-full z-40">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer ${triggerClassName}`}
      >
        <span className={selected ? "truncate" : "truncate text-slate-400 dark:text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-[120] mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl dark:shadow-black/40 overflow-hidden ${panelClassName}`}
        >
          {searchable && (
            <div className="p-2  border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">No results found</li>
            ) : (
              filtered.map((o) => {
                const active = String(value) === String(o.value);
                return (
                  <li
                    key={String(o.value)}
                    onClick={() => handleSelect(o.value)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {o.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;