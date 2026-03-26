import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, GraduationCap } from "lucide-react";

const CollegeDropdown = ({ colleges = [], value, onChange, name }) => {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const dropdownRef           = useRef(null);

  // ── Selected College ──────────────────────────────────
  const selected = colleges.find((c) => c._id === value);

  // ── Filter by search ──────────────────────────────────
  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  // ── Close on outside click ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select handler ────────────────────────────────────
  const handleSelect = (college) => {
    onChange({ target: { name, value: college._id } });
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative w-full">

      {/* ── Trigger Button ────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-full flex items-center justify-between
          px-4 py-2.5 rounded-lg text-sm
          border border-slate-200 dark:border-white/15
          bg-slate-50 dark:bg-white/5
          text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          transition cursor-pointer
        "
      >
        <div className="flex items-center gap-2 truncate">
          <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className={selected ? "" : "text-slate-400 dark:text-slate-500"}>
            {selected ? `${selected.name} — ${selected.city}` : "Select your college…"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200
            ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown Panel ────────────────────────────── */}
      {open && (
        <div className="
          absolute z-50 w-full mt-2
          rounded-xl border
          border-slate-200 dark:border-white/10
          bg-white dark:bg-slate-900
          shadow-xl dark:shadow-black/40
          
        ">

          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg
              bg-slate-50 dark:bg-white/5
              border border-slate-200 dark:border-white/10"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college…"
                autoFocus
                className="
                  w-full bg-transparent text-sm
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400
                  focus:outline-none
                "
              />
            </div>
          </div>

          {/* Options List */}
          <ul
  className="max-h-52 overflow-y-auto py-1 overscroll-contain touch-pan-y   [&::-webkit-scrollbar]:hidden 
  /* Hide scrollbar for IE, Edge and Firefox */
  [-ms-overflow-style:none] [scrollbar-width:none]"
  onWheel={(e) => e.stopPropagation()}
  onTouchMove={(e) => e.stopPropagation()}
>
            {filtered.length === 0 ? (

              // Empty state
              <li className="px-4 py-6 text-center text-sm text-slate-400">
                No college found
              </li>

            ) : filtered.map((c) => (
              <li
                key={c._id}
                onClick={() => handleSelect(c)}
                className={`
                  flex items-center gap-3
                  px-4 py-2.5 text-sm cursor-pointer
                  transition-colors
                  ${value === c._id
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }
                `}
              >
                {/* Selected check */}
                <span className={`
                  w-1.5 h-1.5 rounded-full shrink-0
                  ${value === c._id
                    ? "bg-indigo-500"
                    : "bg-transparent"
                  }
                `}/>
                <span className="truncate">
                  {c.name}
                  <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                    — {c.city}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Footer — count */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10
            text-xs text-slate-400 dark:text-slate-500"
          >
            {filtered.length} college{filtered.length !== 1 ? "s" : ""} available
          </div>

        </div>
      )}
    </div>
  );
};

export default CollegeDropdown;