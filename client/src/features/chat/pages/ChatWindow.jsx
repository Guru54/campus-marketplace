import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Package } from "lucide-react";
import { nanoid } from "nanoid";
import { chatAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────
const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// ── Bubble ────────────────────────────────────────────────
const Bubble = React.memo(({ msg, isMine }) => (
  <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
    {/* Avatar for other person */}
    {!isMine && (
      getAvatarUrl(msg.sender) ? (
        <img src={getAvatarUrl(msg.sender)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mb-0.5">
          {`${msg.sender?.firstName?.[0] ?? ""}${msg.sender?.lastName?.[0] ?? ""}`.toUpperCase()}
        </div>
      )
    )}

    <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
      <div
        className={`px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isMine
            ? "bg-indigo-500 text-white rounded-br-sm"
            : "bg-white dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-white/10"
        }`}
      >
        {msg.content}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">
        {formatTime(msg.createdAt)}
        {isMine && msg.isRead && <span className="ml-1 text-indigo-400">✓✓</span>}
      </span>
    </div>
  </div>
));

// ── Main Page ─────────────────────────────────────────────
const ChatWindow = () => {
  const { chatId } = useParams();
  const { user }   = useAuth();
  const socket = useSocket().socket;

  const [chatMeta,  setChatMeta]  = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [hasMore,   setHasMore]   = useState(false);
  const [page,      setPage]      = useState(1);
  const [draft,     setDraft]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false); // other person is typing

  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);
  const typingTimerRef  = useRef(null);
  const loadingMore     = useRef(false);
  const scrollContainerRef = useRef(null);
  const isPrependingRef = useRef(false); // suppress scroll-to-bottom on prepend

  // ── Load messages ─────────────────────────────────────
  const loadMessages = useCallback(async (pg = 1, prepend = false, container = null) => {
    try {
      let prevHeight = 0;
      if (prepend && container) {
        prevHeight = container.scrollHeight;
      }
      const { data } = await chatAPI.getChatMessages(chatId, pg, 30);
      const { chat, messages: msgs, pagination } = data.data;
      if (pg === 1) setChatMeta(chat);
      setMessages((prev) => prepend ? [...msgs, ...prev] : msgs);
      setHasMore(pagination.hasPrev);
      if (prepend && container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - prevHeight;
        }, 0);
      }
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
      loadingMore.current = false;
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  // ── Scroll to bottom on new messages (first load + own sends) ──
  useEffect(() => {
    if (!loading && !isPrependingRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    isPrependingRef.current = false;
  }, [loading, messages.length]);

  // ── Socket ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_chat", { chatId });
    socket.emit("mark_read", { chatId });
    const onNewMessage = (msg) => {
      setMessages((prev) => {
        const existing = prev.find(m => m._id === msg._id || (msg.clientId && m.clientId === msg.clientId));
        if (existing) {
          if (msg.clientId && existing.clientId === msg.clientId) {
            return prev.map(m => m.clientId === msg.clientId ? msg : m);
          }
          return prev; // true duplicate by _id, skip
        }
        return [...prev, msg];
      });
      if (msg.sender?._id !== user._id) {
        socket.emit("mark_read", { chatId });
      }
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const onTyping      = ({ userId }) => { if (userId !== user._id) setIsTyping(true);  };
    const onStopTyping  = ({ userId }) => { if (userId !== user._id) setIsTyping(false); };
    const onMessagesRead = () => {
      setMessages((prev) => prev.map((m) => m.sender?._id === user._id ? { ...m, isRead: true } : m));
    };
    socket.on("new_message",    onNewMessage);
    socket.on("typing",         onTyping);
    socket.on("stop_typing",    onStopTyping);
    socket.on("messages_read",  onMessagesRead);
    return () => {
      clearTimeout(typingTimerRef.current);
      socket.emit("leave_chat", { chatId });
      socket.off("new_message",   onNewMessage);
      socket.off("typing",        onTyping);
      socket.off("stop_typing",   onStopTyping);
      socket.off("messages_read", onMessagesRead);
    };
  }, [socket, chatId, user._id]);

  // ── Send ──────────────────────────────────────────────
  const sendMessage = () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    const clientId = nanoid();
    const tempMessage = {
      _id: clientId,
      clientId,
      content,
      sender: user,
      createdAt: new Date(),
      isRead: false
    };
    setMessages((prev) => [...prev, tempMessage]);
    if (socket?.connected) {
      socket.emit("send_message", { chatId, content, clientId });
    } else {
      chatAPI.sendMessage(chatId, content)
        .then(({ data }) => {
          setMessages((prev) => {
            const realMsg = data.data.message;
            const existing = prev.find(m => m.clientId && m.clientId === clientId);
            if (existing) {
              return prev.map(m => m.clientId === clientId ? realMsg : m);
            }
            return [...prev, realMsg];
          });
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        })
        .catch(() => { toast.error("Failed to send"); setDraft(content); });
    }
    if (socket) socket.emit("stop_typing", { chatId });
    clearTimeout(typingTimerRef.current);
  };

  // Debounced typing event
  const handleTyping = useCallback((e) => {
    setDraft(e.target.value);
    if (!socket) return;
    if (!typingTimerRef.current) {
      socket.emit("typing", { chatId });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId });
      typingTimerRef.current = null;
    }, 1200);
  }, [socket, chatId]);

  // Handle Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load more on scroll to top, fix scroll jump
  const handleScroll = (e) => {
    if (e.target.scrollTop < 40 && hasMore && !loadingMore.current) {
      loadingMore.current = true;
      isPrependingRef.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, true, e.target);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [draft]);

  // ── Derived ───────────────────────────────────────────
  const other = chatMeta?.participants?.find((p) => p._id !== user._id) ?? chatMeta?.participants?.[0];

  return (
    <main className="flex flex-col h-screen pt-16 bg-slate-50 dark:bg-[#0d0d0d]">
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading conversation…
        </div>
      ) : (
        <>
          {/* ── Header ──────────────────────────────────────── */}
          <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 z-10">
            <Link
              to="/chats"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition"
            >
              <ArrowLeft size={18} />
            </Link>

            {/* Other user */}
            {other && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  {getAvatarUrl(other) ? (
                    <img src={getAvatarUrl(other)} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {`${other.firstName?.[0] ?? ""}${other.lastName?.[0] ?? ""}`.toUpperCase()}
                    </div>
                  )}
                  {other.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {other.firstName} {other.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isTyping ? "typing…" : other.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            )}

            {/* Listing snippet */}
            {chatMeta?.listing && (
              <Link
                to={`/listings/${chatMeta.listing._id}`}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition shrink-0"
              >
                <Package size={12} />
                <span className="max-w-[140px] truncate">{chatMeta.listing.title}</span>
                {chatMeta.listing.price != null && (
                  <span className="text-indigo-500 font-semibold">
                    {chatMeta.listing.price === 0 ? "Free" : `₹${chatMeta.listing.price.toLocaleString("en-IN")}`}
                  </span>
                )}
              </Link>
            )}
          </header>

          {/* ── Messages ───────────────────────────────────── */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          >
            {hasMore && (
              <div className="text-center text-xs text-slate-400 py-2">Scroll up to load older messages</div>
            )}

            {messages.map((msg, idx) => {
              const isMine       = msg.sender?._id === user._id;
              const showDate     = idx === 0 || !isSameDay(messages[idx - 1].createdAt, msg.createdAt);
              return (
                <div key={msg.clientId || msg._id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                      <span className="text-[11px] text-slate-400 shrink-0">{formatDate(msg.createdAt)}</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    </div>
                  )}
                  <Bubble msg={msg} isMine={isMine} />
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                {getAvatarUrl(other) ? (
                  <img src={getAvatarUrl(other)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {`${other?.firstName?.[0] ?? ""}`.toUpperCase()}
                  </div>
                )}
                <div className="bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <p className="text-3xl mb-3">👋</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No messages yet. Say hello!</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input ──────────────────────────────────────── */}
          <div className="shrink-0 flex items-end gap-3 px-4 py-3 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition max-h-32 overflow-y-auto"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default ChatWindow;
