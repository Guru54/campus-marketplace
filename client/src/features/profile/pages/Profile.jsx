import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, MessageCircle, Package } from "lucide-react";
import { listingAPI, userAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import toast from "react-hot-toast";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 86400) return "today";
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return `${Math.floor(diff / (86400 * 365))}y ago`;
};

const Skeleton = () => (
  <div className="animate-pulse max-w-xl mx-auto space-y-4 pt-10">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
      </div>
    </div>
    <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
  </div>
);

const Profile = () => {
  const { id }   = useParams();
  const { user } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = user && user._id === id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getUserPublicProfile(id);
        setProfile(data.data.user);

        // Also fetch that user's active listings
        const listRes = await listingAPI.getAll({ seller: id, limit: 6 }).catch(() => null);
        if (listRes) setListings(listRes.data.data.listings ?? []);
      } catch (err) {
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const avatarUrl = getAvatarUrl(profile);

  if (loading) return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <Skeleton />
    </main>
  );

  if (notFound) return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
      <p className="text-5xl mb-4">👤</p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User not found</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">This profile doesn't exist or is not at your college.</p>
      <Link to="/listings" className="mt-6 text-indigo-500 hover:underline text-sm">← Back to Marketplace</Link>
    </main>
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {initials}
                </div>
              )}
              {profile.isOnline && (
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h1>

              {profile.isOnline ? (
                <p className="text-xs text-green-500 font-medium mt-0.5">Online now</p>
              ) : profile.lastSeen ? (
                <p className="text-xs text-slate-400 mt-0.5">
                  Last seen {timeAgo(profile.lastSeen)}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-500 dark:text-slate-400">
                {profile.college && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {profile.college.name}, {profile.college.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Joined {timeAgo(profile.createdAt)}
                </span>
              </div>

              {/* Actions */}
              {!isOwnProfile && user && (
                <Link
                  to={`/listings`}
                  state={{ sellerId: id }}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition"
                >
                  <Package size={14} /> View Listings
                </Link>
              )}

              {isOwnProfile && (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Badge: verified student */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Verified student · {profile.college?.name ?? "College"}
        </div>
      </div>
    </main>
  );
};

export default Profile;
