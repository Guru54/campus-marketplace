import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Check, CheckCheck, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { nanoid } from "nanoid";
import { chatAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { useChats, useMessages } from "@/features/chat/hooks/useChats";
import { useTyping } from "@/features/chat/hooks/useTyping";
import { ChatInboxList } from "@/features/chat/components/ChatInboxList";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { MessageList } from "@/features/chat/components/MessageList";
import { ChatInput } from "@/features/chat/components/ChatInput";

// Message status icon component
const MessageStatus = ({ isRead, isDelivered, isOwn, isSending, isFailed, onRetry }) => {
  if (!isOwn) return null;
  if (isFailed) {
    return (
      <button onClick={onRetry} title="Retry" className="ml-1 text-red-500 hover:text-red-700">
        <RotateCcw size={16} />
      </button>
    );
  }
  if (isSending) {
    return <span className="text-xs text-slate-400 ml-1">…</span>; // sending spinner or dots
  }
  if (isRead) {
    return <CheckCheck size={16} className="inline ml-1 text-blue-500" title="Read" />;
  }
  if (isDelivered) {
    return <CheckCheck size={16} className="inline ml-1 text-slate-400" title="Delivered" />;
  }
  return <Check size={16} className="inline ml-1 text-slate-400" title="Sent" />;
};

const Chats = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket().socket;

  const { chats, setChats, loadingChats, loadChats } = useChats();
  const { chatMeta, setChatMeta, messages, setMessages, loadingMessages, hasMore, setHasMore, page, setPage, loadMessages } = useMessages();
  const { isTyping, setIsTyping, handleTyping: handleTypingInput, stopTyping } = useTyping(socket, chatId);

  const [draft, setDraft] = useState("");
  const [sendingIds, setSendingIds] = useState([]);
  const [deliveredIds, setDeliveredIds] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [failedIds, setFailedIds] = useState([]);
  const [otherPresence, setOtherPresence] = useState({ isOnline: false, lastSeen: null });

  const bottomRef = useRef(null);
  const loadingMore = useRef(false);
  const selectedChatId = chatId || null;

  const getOtherParticipant = useCallback(
    (chat) => chat?.participants?.find((p) => p._id !== user._id) ?? chat?.participants?.[0],
    [user._id]
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!selectedChatId) {
      setChatMeta(null);
      setMessages([]);
      setHasMore(false);
      setPage(1);
      setSendingIds([]);
      setDeliveredIds([]);
      setReadIds([]);
      setFailedIds([]);
      return;
    }
    loadMessages(selectedChatId, 1);
    setSendingIds([]);
    setDeliveredIds([]);
    setReadIds([]);
    setFailedIds([]);
  }, [selectedChatId, loadMessages]);

  useEffect(() => {
    if (!loadingMessages && selectedChatId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loadingMessages, messages.length, selectedChatId]);

  // Socket listeners for chat events
  useEffect(() => {
    if (!socket || !selectedChatId) return;
    socket.emit("join_chat", { chatId: selectedChatId });
    socket.emit("mark_read", { chatId: selectedChatId });

    const onNewMessage = (msg) => {
      if (msg.chatId !== selectedChatId && msg.chat?._id !== selectedChatId) return;
      setMessages((prev) => {
        // Replace optimistic message if clientId matches, else skip duplicate, else append
        if (msg.clientId) {
          const existing = prev.find(m => m.clientId && m.clientId === msg.clientId);
          if (existing) {
            return prev.map(m => (m.clientId && m.clientId === msg.clientId) ? msg : m);
          }
        }
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setSendingIds((ids) => ids.filter((id) => id !== msg._id && id !== msg.clientId));
      if (msg.sender?._id !== user._id) {
        socket.emit("mark_read", { chatId: selectedChatId });
      }
      setDeliveredIds((ids) => [...new Set([...ids, msg._id])]);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      loadChats();
    };

    const onMessagesRead = ({ messageIds }) => {
      if (Array.isArray(messageIds)) {
        setReadIds((ids) => [...new Set([...ids, ...messageIds])]);
      }
      setMessages((prev) => prev.map((m) => (messageIds?.includes(m._id) ? { ...m, isRead: true } : m)));
    };

    const onTyping = ({ userId, typingChatId }) => {
      if (typingChatId === selectedChatId && userId !== user._id) setIsTyping(true);
    };

    const onStopTyping = ({ userId, typingChatId }) => {
      if (typingChatId === selectedChatId && userId !== user._id) setIsTyping(false);
    };

    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onMessagesRead);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    return () => {
      socket.emit("leave_chat", { chatId: selectedChatId });
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onMessagesRead);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
    };
  }, [socket, selectedChatId, user._id, loadChats, setIsTyping]);

  // Socket listeners for online presence
  useEffect(() => {
    if (!socket || !selectedChatId) return;
    const selectedOther = getOtherParticipant(chatMeta) || getOtherParticipant(chats.find((chat) => chat._id === selectedChatId));
    if (!selectedOther?._id) return;
    const handleOnline = ({ userId }) => {
      if (userId === selectedOther._id) setOtherPresence((p) => ({ ...p, isOnline: true }));
    };
    const handleOffline = ({ userId, lastSeen }) => {
      if (userId === selectedOther._id) setOtherPresence((p) => ({ ...p, isOnline: false, lastSeen }));
    };
    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);
    return () => {
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
    };
  }, [socket, chatMeta, chats, selectedChatId, getOtherParticipant]);

  // Sync presence state when selectedOther changes
  useEffect(() => {
    const selectedOther = getOtherParticipant(chatMeta) || getOtherParticipant(chats.find((chat) => chat._id === selectedChatId));
    setOtherPresence({ isOnline: selectedOther?.isOnline, lastSeen: selectedOther?.lastSeen });
  }, [chatMeta, chats, selectedChatId, getOtherParticipant]);

  const sendMessage = useCallback((retryMsg) => {
    let content, tempId, clientId;
    if (retryMsg) {
      content = retryMsg.content;
      tempId = retryMsg._id;
      clientId = retryMsg.clientId || tempId;
      setFailedIds((ids) => ids.filter((id) => id !== tempId));
    } else {
      content = draft.trim();
      if (!content || !selectedChatId) return;
      setDraft("");
      clientId = nanoid();
      tempId = clientId;
      const tempMessage = {
        _id: tempId,
        clientId,
        chatId: selectedChatId,
        content,
        sender: user,
        createdAt: new Date(),
        isRead: false
      };
      setMessages((prev) => [...prev, tempMessage]);
      setSendingIds((ids) => [...ids, tempId]);
    }
    if (socket?.connected) {
      socket.emit("send_message", { chatId: selectedChatId, content, clientId }, (ack) => {
        if (ack?.error) {
          setFailedIds((ids) => [...ids, tempId]);
          setSendingIds((ids) => ids.filter((id) => id !== tempId));
        }
      });
    } else {
      chatAPI.sendMessage(selectedChatId, content)
        .then(({ data }) => {
          const serverMsg = data.data.message;
          setMessages((prev) => prev.map(m => m.clientId === clientId ? serverMsg : m));
          setSendingIds((ids) => ids.filter((id) => id !== tempId));
        })
        .catch(() => {
          setFailedIds((ids) => [...ids, tempId]);
          setSendingIds((ids) => ids.filter((id) => id !== tempId));
        });
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    stopTyping();
  }, [draft, selectedChatId, user, socket, stopTyping]);

  const handleScroll = (e) => {
    if (!selectedChatId) return;
    if (e.target.scrollTop < 40 && hasMore && !loadingMore.current) {
      loadingMore.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      // Ensure loadMessages returns a Promise
      Promise.resolve(loadMessages(selectedChatId, nextPage, true)).finally(() => {
        loadingMore.current = false;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDraftChange = useCallback((e) => {
    setDraft(e.target.value);
    handleTypingInput(e.target.value);
  }, [handleTypingInput]);

  const goBackFromInbox = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/listings");
  };

  const selectedChat = chats.find((chat) => chat._id === selectedChatId);
  const selectedOther = getOtherParticipant(chatMeta) || getOtherParticipant(selectedChat);
  const selectedListing = chatMeta?.listing || selectedChat?.listing;

  // Memoize renderStatus to avoid new function reference on every render
  const renderStatus = useCallback((msg) => (
    <MessageStatus
      isOwn={msg.sender?._id === user._id}
      isSending={sendingIds.includes(msg._id)}
      isDelivered={deliveredIds.includes(msg._id) || msg.isRead || msg.isDelivered}
      isRead={readIds.includes(msg._id) || msg.isRead}
      isFailed={failedIds.includes(msg._id)}
      onRetry={() => sendMessage(msg)}
    />
  ), [user._id, sendingIds, deliveredIds, readIds, failedIds, sendMessage]);

  // Memoized navigation handlers (hooks must not be in JSX)
  const handleSelectChat = useCallback(
    (id) => navigate(`/chats/${id}`),
    [navigate]
  );

  const handleBack = useCallback(
    () => navigate("/chats"),
    [navigate]
  );

  return (
    <main className="h-screen pt-20 overflow-hidden overscroll-none bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <div className="h-full min-h-0 max-w-6xl mx-auto px-0 md:px-4 pb-0 md:pb-4">
        <div className="h-full min-h-0 overflow-hidden md:rounded-2xl md:border md:border-white/10 md:bg-white/5 md:backdrop-blur-xl md:shadow-lg md:shadow-indigo-500/10 flex">
          <ChatInboxList
            chats={chats}
            loading={loadingChats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onGoBack={goBackFromInbox}
            getOtherParticipant={getOtherParticipant}
          />
          <section className={`${selectedChatId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 min-h-0 overflow-hidden`}>
            {!selectedChatId ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <MessageCircle size={36} className="text-slate-400 mb-3" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select a chat</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose a conversation to start messaging.</p>
              </div>
            ) : loadingMessages ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading conversation…</div>
            ) : (
              <>
                <ChatHeader
                  selectedOther={{ ...selectedOther, ...otherPresence }}
                  selectedListing={selectedListing}
                  isTyping={isTyping}
                  onBack={handleBack}
                />
                <MessageList
                  messages={messages}
                  userId={user._id}
                  hasMore={hasMore}
                  isTyping={isTyping}
                  selectedOther={selectedOther}
                  onScroll={handleScroll}
                  bottomRef={bottomRef}
                  renderStatus={renderStatus}
                />
                <ChatInput draft={draft} sending={false} onDraftChange={handleDraftChange} onKeyDown={handleKeyDown} onSendMessage={sendMessage} />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Chats;
