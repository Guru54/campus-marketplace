import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { getAvatarUrl } from "@/shared/utils/avatar";

const timeAgo = (date) => {
  if (!date) return "";
  // Ensure diff is never negative due to client-server time mismatch
  const diff = Math.max(0, Math.floor((Date.now() - new Date(date)) / 1000));
  
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// React.memo ka use taaki parent re-renders par header dubara render na ho
export const ChatHeader = React.memo(({ selectedOther, selectedListing, isTyping, onBack }) => (
  <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10 z-10">
    <button
      onClick={onBack}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white hover:bg-indigo-500/20 hover:border-indigo-500/40 transition cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft size={18} />
    </button>

    {selectedOther && (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          {getAvatarUrl(selectedOther) ? (
            <img src={getAvatarUrl(selectedOther)} alt="User Avatar" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {/* Optional chaining with fallback ensures no crashes */}
              {`${selectedOther.firstName?.charAt(0) ?? ""}${selectedOther.lastName?.charAt(0) ?? ""}`.toUpperCase()}
            </div>
          )}
          {selectedOther.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111]" />
          )}
        </div>
        
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {selectedOther.firstName} {selectedOther.lastName}
          </p>
          <p className="text-[11px] text-slate-400">
            {isTyping
              ? "typing…"
              : selectedOther.isOnline
                ? "Online"
                : selectedOther.lastSeen
                  ? `Last seen ${timeAgo(selectedOther.lastSeen)}`
                  : "Offline"}
          </p>
        </div>
      </div>
    )}

    {selectedListing?._id && (
      <Link
        to={`/listings/${selectedListing._id}`}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-700 dark:text-slate-300 text-xs hover:bg-white/10 transition shrink-0"
        title={selectedListing.title}
      >
        <Package size={12} />
        <span className="max-w-[140px] truncate">{selectedListing.title}</span>
      </Link>
    )}
  </header>
));

// DisplayName debugging ke liye helpful hota hai jab React.memo use karte hain
ChatHeader.displayName = "ChatHeader";