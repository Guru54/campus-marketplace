import { useState, useCallback } from "react";
import { chatAPI } from "@/shared/services/api";
import toast from "react-hot-toast";

export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const { data } = await chatAPI.getInbox();
      setChats(data.data.chats ?? []);
    } catch {
      toast.error("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  return { chats, setChats, loadingChats, loadChats };
};

export const useMessages = () => {
  const [chatMeta, setChatMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadMessages = useCallback(async (id, pg = 1, prepend = false) => {
    if (!id) return;
    setLoadingMessages(true);
    try {
      const { data } = await chatAPI.getChatMessages(id, pg);
      const { chat, messages: msgs, pagination } = data.data;

      if (pg === 1) setChatMeta(chat);
      setMessages((prev) => (prepend ? [...msgs, ...prev] : msgs));
      setHasMore(pagination.hasPrev);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  return {
    chatMeta,
    setChatMeta,
    messages,
    setMessages,
    loadingMessages,
    setLoadingMessages,
    hasMore,
    setHasMore,
    page,
    setPage,
    loadMessages,
  };
};
