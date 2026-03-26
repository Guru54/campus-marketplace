import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Package } from "lucide-react";
import { getAvatarUrl } from "@/shared/utils/avatar";

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(date)) / 1000));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const InboxSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Extracted and Memoized Chat Item
const ChatItem = React.memo(({ chat, isActive, other, onSelectChat }) => {
  const otherAvatar = getAvatarUrl(other);
  const initials = `${other?.firstName?.[0] ?? ""}${other?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    // Changed to Link for better web accessibility and routing behavior
    <Link
      to={`/chats/${chat._id}`}
      onClick={() => onSelectChat(chat._id)}
      className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer block ${
        isActive
          ? "bg-indigo-500/10 border-indigo-500/40"
          : "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/40"
      }`}
    >
      <div className="relative shrink-0">
        {otherAvatar ? (
          <img src={otherAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {initials}
          </div>
        )}
        {other?.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {other?.firstName} {other?.lastName}
          </p>
          <span className="text-xs text-slate-400 shrink-0 ml-2">{timeAgo(chat.lastMessageAt)}</span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
            {chat.lastMessage || (
              <span className="italic text-slate-400">Re: {chat.listing?.title ?? "Listing"}</span>
            )}
          </p>
          {chat.unread > 0 && (
            <span className="shrink-0 ml-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {chat.unread}
            </span>
          )}
        </div>

        {chat.listing && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
            <Package size={10} />
            <span className="truncate">{chat.listing.title}</span>
          </div>
        )}
      </div>
    </Link>
  );
});
ChatItem.displayName = "ChatItem";

export const ChatInboxList = ({ chats, loading, selectedChatId, onSelectChat, onGoBack, getOtherParticipant }) => {
  return (
    <aside className={`${selectedChatId ? "hidden md:flex" : "flex"} w-full md:w-[340px] md:min-w-[340px] md:border-r md:border-white/10 flex-col min-h-0`}>
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white hover:bg-indigo-500/20 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
      </div>

      <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide p-3 space-y-2">
        {loading ? (
          <InboxSkeleton />
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
          chats.map((chat) => (
            <ChatItem 
              key={chat._id} 
              chat={chat} 
              isActive={selectedChatId === chat._id} 
              other={getOtherParticipant(chat)} 
              onSelectChat={onSelectChat} 
            />
          ))
        )}
      </div>
    </aside>
  );
};