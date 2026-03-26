import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Package } from "lucide-react";
import { chatAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const timeAgo = (date) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};


const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);


// ── Memoized ChatItem ─────────────────────────────
// (Moved outside ChatInbox to avoid hook order bugs)
const ChatItem = React.memo(function ChatItem({ chat, other, now }) {
  const avatarUrl = getAvatarUrl(other);
  const initials = `${other?.firstName?.[0] ?? ""}${other?.lastName?.[0] ?? ""}`.toUpperCase();
  const timeString = useMemo(() => timeAgo(chat.lastMessageAt), [chat.lastMessageAt, now]);
  return (
    <Link
      to={`/chats/${chat._id}`}
      className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition group block"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {initials}
          </div>
        )}
        {other?.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {other?.firstName} {other?.lastName}
          </p>
          <span className="text-xs text-slate-400 shrink-0 ml-2">
            {timeString}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
            {chat.lastMessage || (
              <span className="italic text-slate-400">
                Re: {chat.listing?.title ?? "Listing"}
              </span>
            )}
          </p>
          {chat.unread > 0 && (
            <span className="shrink-0 ml-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {chat.unread > 99 ? "99+" : chat.unread}
            </span>
          )}
        </div>

        {/* Listing snippet */}
        {chat.listing && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
            <Package size={10} />
            <span className="truncate">{chat.listing.title}</span>
            {chat.listing.price != null && (
              <span className="shrink-0">
                · {chat.listing.price === 0 ? "Free" : `₹${chat.listing.price.toLocaleString("en-IN")}`}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
});
ChatItem.displayName = "ChatItem";

const ChatInbox = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now()); // for periodic re-render
  const refetchTimeout = useRef(null);

  // Periodic re-render for timeAgo
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    chatAPI.getInbox()
      .then(({ data }) => { if (!cancelled) setChats(data.data.chats); })
      .catch(() => { if (!cancelled) toast.error("Failed to load chats"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Real-time inbox update (debounced)
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = () => {
      clearTimeout(refetchTimeout.current);
      refetchTimeout.current = setTimeout(() => {
        chatAPI.getInbox().then(({ data }) => setChats(data.data.chats));
      }, 300);
    };
    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onNewMessage);
    // Listen for inbox_update for real-time inbox refresh
    socket.on("inbox_update", onNewMessage);
    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onNewMessage);
      socket.off("inbox_update", onNewMessage);
      clearTimeout(refetchTimeout.current);
    };
  }, [socket]);

  // Safe + memoized getOtherParticipant
  const getOtherParticipant = useCallback(
    (chat) => chat?.participants?.find((p) => p._id !== user?._id) ?? chat?.participants?.[0],
    [user?._id]
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-slate-50 dark:bg-[#0d0d0d]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Messages</h1>

        {loading ? (
          <Skeleton />
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No messages yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs">
              Start a conversation by messaging sellers on their listings.
            </p>
            <Link to="/listings" className="mt-5 text-indigo-500 hover:underline text-sm">
              Browse Listings →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                other={getOtherParticipant(chat)}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ChatInbox;
