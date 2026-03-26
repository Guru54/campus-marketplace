import React from "react";
import { MessageBubble } from "./MessageBubble";
import { getAvatarUrl } from "@/shared/utils/avatar";

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  
  // Safe fallback agar invalid date aa jaye
  if (isNaN(d.getTime())) return "";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Extracted out safely to prevent runtime crashes on null values
const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
};

// React.memo lagaya hai taaki parent re-render hone par ye list dubara render na ho (jab tak props na badlein)
export const MessageList = React.memo(({
  messages,
  userId,
  hasMore,
  isTyping,
  selectedOther,
  onScroll,
  bottomRef,
  renderStatus,
}) => {
  return (
    <div data-lenis-prevent onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-4 py-4 space-y-3">
      {hasMore && <div className="text-center text-xs text-slate-400 py-2">Scroll up to load older messages</div>}

      {messages.map((msg, idx) => {
        const isMine = msg.sender?._id === userId;
        const showDate = idx === 0 || !isSameDay(messages[idx - 1].createdAt, msg.createdAt);

        return (
          // key mein `msg._id` ke sath `clientId` lagana zaroori hai optimistic UI (temp messages) ke liye
          <div key={msg._id || msg.clientId || idx}>
            {showDate && (
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                <span className="text-[11px] text-slate-400 shrink-0">{formatDate(msg.createdAt)}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              </div>
            )}
            <MessageBubble msg={msg} isMine={isMine} statusIcon={renderStatus ? renderStatus(msg) : null} />
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            {/* Optional chaining safely added for initials */}
            {`${selectedOther?.firstName?.[0] ?? ""}`.toUpperCase()}
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <p className="text-3xl mb-3">👋</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No messages yet. Say hello!</p>
        </div>
      )}

      {/* Auto-scroll ke liye bottom reference */}
      <div ref={bottomRef} />
    </div>
  );
});

MessageList.displayName = "MessageList";