import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Tag, MapPin, Clock, Heart, IndianRupee } from "lucide-react";

const CONDITION_LABEL = {
  NEW:      { text: "New",      color: "bg-green-100/80 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  LIKE_NEW: { text: "Like New", color: "bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  GOOD:     { text: "Good",     color: "bg-yellow-100/80 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
  FAIR:     { text: "Fair",     color: "bg-orange-100/80 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
};

const CATEGORY_LABEL = {
  BOOKS:       "📚 Books",
  ELECTRONICS: "💻 Electronics",
  FURNITURE:   "🪑 Furniture",
  CYCLES:      "🚲 Cycles",
  SPORTS:      "⚽ Sports",
  CLOTHING:    "👕 Clothing",
  NOTES:       "📝 Notes",
  OTHERS:      "📦 Others",
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Skeleton ───────────────────────────────────────────────
export const ListingCardSkeleton = () => (
  <div className="flex flex-col rounded-2xl overflow-hidden
    border border-slate-200 dark:border-white/10
    bg-white dark:bg-[#1a1a2e] shadow-sm">
    <div className="aspect-[4/3] relative overflow-hidden
      bg-slate-200 dark:bg-[#0f0f1a]">
      <div className="absolute inset-0 -translate-x-full
        animate-[shimmer_1.5s_infinite]
        bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
    <div className="p-4 flex flex-col gap-3">
      <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
      <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
      <div className="h-4 w-2/3 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
      <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse mt-1" />
      <div className="flex justify-between pt-3
        border-t border-slate-100 dark:border-white/10">
        <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
        <div className="h-3 w-12 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// ── Card ───────────────────────────────────────────────────
const ListingCard = ({ listing }) => {
  const [wished, setWished]       = useState(false);
  const [hovered, setHovered]     = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const intervalRef               = useRef(null);

  const images = listing.images?.length > 0 ? listing.images : [];
  const hasMultiple = images.length > 1;

  const cond  = CONDITION_LABEL[listing.condition]
    || { text: listing.condition, color: "" };
  const emoji = CATEGORY_LABEL[listing.category]?.split(" ")[0] || "📦";

  // ── Auto slideshow on hover ────────────────────────────
  useEffect(() => {
    if (hovered && hasMultiple) {
      intervalRef.current = setInterval(() => {
        setActiveImg((prev) => (prev + 1) % images.length);
      }, 1000); // har 1 second pe next image
    } else {
      clearInterval(intervalRef.current);
      setActiveImg(0); // hover hatao → reset
    }
    return () => clearInterval(intervalRef.current);
  }, [hovered, hasMultiple, images.length]);

  return (
    <Link
      to={`/listings/${listing._id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="
        group flex flex-col rounded-2xl overflow-hidden
        bg-white dark:bg-[#1a1a2e]
        border border-slate-200 dark:border-white/15
        shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10
        hover:-translate-y-1.5
        transition-all duration-300
      "
    >
      {/* ── Image Area ────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden
        bg-slate-100 dark:bg-[#0f0f1a]">

        {images.length > 0 ? (
          <>
            {/* All images stacked — only active visible */}
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${listing.title} ${idx + 1}`}
                loading="lazy"
                className={`
                  absolute inset-0 w-full h-full object-cover
                  transition-opacity duration-500
                  ${idx === activeImg ? "opacity-100" : "opacity-0"}
                  ${hovered ? "scale-105" : "scale-100"}
                  transition-all duration-500
                `}
              />
            ))}
          </>
        ) : (
          // No image state
          <div className="w-full h-full flex flex-col
            items-center justify-center gap-2
            bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <span className="text-5xl opacity-60">{emoji}</span>
            <span className="text-xs tracking-wide uppercase
              text-slate-400 dark:text-slate-500">
              No image
            </span>
          </div>
        )}

        {/* Cinematic gradient */}
        <div className="absolute inset-0
          bg-gradient-to-t from-black/50 via-black/10 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300" />

        {/* ── Image Dots — multiple images ──────────── */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2
            flex items-center gap-1.5
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`
                  block rounded-full transition-all duration-300
                  ${idx === activeImg
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50"
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* Image count badge — top right */}
        {hasMultiple && !hovered && (
          <span className="absolute bottom-2 right-2
            text-[10px] font-semibold px-2 py-0.5
            rounded-full bg-black/50 text-white
            backdrop-blur-sm">
            1 / {images.length}
          </span>
        )}

        {/* Condition badge */}
        <span className={`
          absolute top-3 left-3
          text-[11px] font-semibold px-2.5 py-1
          rounded-full backdrop-blur-md shadow-sm
          ${cond.color}
        `}>
          {cond.text}
        </span>

        {/* Negotiable badge */}
        {listing.isNegotiable && (
          <span className="absolute top-3 right-3
            text-[11px] font-semibold px-2.5 py-1
            rounded-full backdrop-blur-md shadow-sm
            bg-indigo-100/80 text-indigo-700
            dark:bg-indigo-500/20 dark:text-indigo-300">
            Negotiable
          </span>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setWished((p) => !p); }}
          className="absolute bottom-3 right-3
            opacity-0 group-hover:opacity-100
            scale-75 group-hover:scale-100
            transition-all duration-300"
        >
          <Heart
            size={22}
            className={`drop-shadow-md transition-colors duration-200
              ${wished
                ? "fill-red-500 text-red-500"
                : "text-white fill-white/20"
              }`}
          />
        </button>

      </div>

      {/* ── Info ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2 p-4 flex-1">

        <p className="text-xs font-medium tracking-wide uppercase
          text-indigo-500 dark:text-indigo-400
          flex items-center gap-1">
          <Tag size={10} />
          {CATEGORY_LABEL[listing.category] || listing.category}
        </p>

        <h3 className="text-[15px] font-semibold
          text-slate-900 dark:text-white
          line-clamp-2 leading-snug
          group-hover:text-indigo-600
          dark:group-hover:text-indigo-400
          transition-colors">
          {listing.title}
        </h3>

        <p className="text-lg font-bold mt-auto flex items-center gap-0.5">
          <IndianRupee size={15}
            className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-indigo-600 dark:text-indigo-400">
            {listing.price.toLocaleString("en-IN")}
          </span>
        </p>

        <div className="flex items-center justify-between
          mt-3 pt-3
          border-t border-slate-200/70 dark:border-white/10
          text-xs">
          <span className="text-slate-500 dark:text-slate-400
            flex items-center gap-1">
            <MapPin size={11} />
            {listing.college?.city || "Campus"}
          </span>
          <span className="text-slate-400 dark:text-slate-500
            flex items-center gap-1">
            <Clock size={11} />
            {timeAgo(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;