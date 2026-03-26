import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit2, Trash2, Eye } from "lucide-react";
import { STATUS_BADGE, CATEGORY_EMOJI, timeAgo } from "@/features/listings/constants/listingConstants";

export const MyListingCard = ({ listing, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
  >
    <Link to={`/listings/${listing._id}`} className="block aspect-video relative overflow-hidden bg-slate-100 dark:bg-white/5">
      {listing.images?.[0] ? (
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl">
          {CATEGORY_EMOJI[listing.category] || "📦"}
        </div>
      )}
      <span className={`absolute top-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[listing.status || 'ACTIVE']}`}>
        {(listing.status || 'ACTIVE').charAt(0) + (listing.status || 'ACTIVE').slice(1).toLowerCase()}
      </span>
    </Link>

    <div className="p-4">
      <Link to={`/listings/${listing._id}`} className="block">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-500 transition">
          {listing.title}
        </h3>
      </Link>

      <div className="flex items-center justify-between mt-1.5">
        <p className="text-base font-bold text-indigo-500">
          {listing.price === 0 ? "Free" : `₹${listing.price.toLocaleString("en-IN")}`}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Eye size={12} />
          <span>{listing.views ?? 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
        <span>{CATEGORY_EMOJI[listing.category]} {listing.category.charAt(0) + listing.category.slice(1).toLowerCase()}</span>
        <span>·</span>
        <span>{timeAgo(listing.createdAt)}</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(listing)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition cursor-pointer"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(listing)}
          disabled={listing.status === "EXPIRED"}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  </motion.div>
);
