import React from "react";
import { getAvatarUrl } from "@/shared/utils/avatar";

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  // Fallback agar date format galat ho
  if (isNaN(d.getTime())) return ""; 
  
  return d.toLocaleTimeString("en-IN", { 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: true 
  });
};

export const MessageBubble = React.memo(({ msg, isMine, statusIcon }) => {
  // Logic extracted out of JSX for cleaner rendering
  const showAvatar = !isMine;
  const avatarUrl = showAvatar ? getAvatarUrl(msg.sender) : null;
  const initials = showAvatar 
    ? `${msg.sender?.firstName?.[0] ?? ""}${msg.sender?.lastName?.[0] ?? ""}`.toUpperCase() 
    : "";

  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mb-0.5">
            {initials}
          </div>
        )
      )}

      <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? "bg-indigo-500 text-white rounded-br-sm"
              : "bg-white/10 text-slate-900 dark:text-white rounded-bl-sm border border-white/10"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
          {formatTime(msg.createdAt)}
          {isMine && statusIcon}
        </span>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";