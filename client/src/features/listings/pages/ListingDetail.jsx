import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Tag, Eye, MapPin, ChevronLeft, ChevronRight,
  MessageCircle, Share2, CheckCircle, AlertCircle, User,
} from "lucide-react";
import { listingAPI, chatAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import toast from "react-hot-toast";

const CONDITION_LABEL = {
  NEW:      { text: "New",       color: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  LIKE_NEW: { text: "Like New",  color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  GOOD:     { text: "Good",      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  FAIR:     { text: "Fair",      color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
};

const CATEGORY_LABEL = {
  BOOKS: "📚 Books", ELECTRONICS: "💻 Electronics", FURNITURE: "🪑 Furniture",
  CYCLES: "🚲 Cycles", SPORTS: "⚽ Sports", CLOTHING: "👕 Clothing",
  NOTES: "📝 Notes", OTHERS: "📦 Others",
};

const STATUS_BADGE = {
  ACTIVE:   { text: "Available",  color: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  RESERVED: { text: "Reserved",   color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  SOLD:     { text: "Sold",       color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  EXPIRED:  { text: "Expired",    color: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400" },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Image Gallery ──────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
  const [active, setActive] = useState(0);

  const prev = () => setActive((p) => (p - 1 + images.length) % images.length);
  const next = () => setActive((p) => (p + 1) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-6xl">
        📦
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${title} - ${active + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white dark:hover:bg-black/70">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white dark:hover:bg-black/70">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-1.5 h-1.5 rounded-full transition ${i === active ? "bg-indigo-500 w-4" : "bg-white/60"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === active ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100"
              }`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
    <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-white/10" />
    <div className="space-y-4 py-4">
      <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
      <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-10 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
      <div className="h-24 bg-slate-200 dark:bg-white/10 rounded" />
      <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-xl" />
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────
const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [chatLoading, setChatLoading]   = useState(false);
  const [notFound, setNotFound]         = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await listingAPI.getById(id);
        setListing(data.data.listing);
      } catch (err) {
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleMessageSeller = async () => {
    if (!user) {
      toast.error("Please login to message the seller");
      navigate("/login");
      return;
    }
    setChatLoading(true);
    try {
      const { data } = await chatAPI.startChat({
        listingId: listing._id,
        sellerId: listing.seller._id,
      });
      const chatId = data.data.chat._id;
      navigate(`/chats/${chatId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start chat");
    } finally {
      setChatLoading(false);
    }
  };

  // ── Not found ────────────────────────────────────────────
  if (notFound) return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Listing not found</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">It may have been removed or sold.</p>
      <Link to="/listings" className="mt-6 text-indigo-500 hover:underline text-sm">← Back to Marketplace</Link>
    </main>
  );

  const cond   = listing ? CONDITION_LABEL[listing.condition] : null;
  const status = listing ? STATUS_BADGE[listing.status]       : null;
  const isSold = listing?.status === "SOLD" || listing?.status === "EXPIRED";
  const isOwner = user && listing && String(user._id) === String(listing.seller?._id);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-6 cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? <Skeleton /> : listing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {/* ── Left: Images ─────────────────────────── */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* ── Right: Info ──────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Status + Category */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status?.color}`}>
                  {status?.text || listing.status}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Tag size={10} />
                  {CATEGORY_LABEL[listing.category] || listing.category}
                </span>
                {listing.isNegotiable && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    Negotiable
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{listing.price.toLocaleString("en-IN")}
                </span>
                {listing.price === 0 && (
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Free!</span>
                )}
              </div>

              {/* Condition */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Condition:</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cond?.color}`}>
                  {cond?.text}
                </span>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {listing.college?.city}, {listing.college?.state}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {listing.views} view{listing.views !== 1 ? "s" : ""}
                </span>
                <span>Posted {timeAgo(listing.createdAt)}</span>
              </div>

              {/* Seller */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="relative shrink-0">
                  {getAvatarUrl(listing.seller) ? (
                    <img src={getAvatarUrl(listing.seller)} alt=""
                      className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                      <User size={18} className="text-indigo-500" />
                    </div>
                  )}
                  {listing.seller?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {listing.seller?.firstName} {listing.seller?.lastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {listing.seller?.isOnline ? (
                      <span className="text-green-500">Online now</span>
                    ) : (
                      listing.seller?.lastSeen
                        ? `Last seen ${timeAgo(listing.seller.lastSeen)}`
                        : "Offline"
                    )}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-auto">
                {isOwner ? (
                  <Link to={`/my-listings`}
                    className="flex-1 flex items-center justify-center gap-2 border border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-semibold py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition">
                    Manage Listing
                  </Link>
                ) : (
                  <button
                    onClick={handleMessageSeller}
                    disabled={chatLoading || isSold}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-500/25 cursor-pointer"
                  >
                    {chatLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isSold ? (
                      <><AlertCircle size={16} /> {listing.status === "SOLD" ? "Sold" : "Unavailable"}</>
                    ) : (
                      <><MessageCircle size={16} /> Message Seller</>
                    )}
                  </button>
                )}

                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition text-sm font-medium cursor-pointer">
                  <Share2 size={16} />
                </button>
              </div>

              {/* Trust badge */}
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <CheckCircle size={11} className="text-green-500" />
                Verified student · {listing.college?.name}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default ListingDetail;
