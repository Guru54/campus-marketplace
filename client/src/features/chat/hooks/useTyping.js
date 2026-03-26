import { useState, useRef, useCallback } from "react";

export const useTyping = (socket, selectedChatId) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  const handleTyping = useCallback(
    (content) => {
      if (!socket || !selectedChatId) return;
      socket.emit("typing", { chatId: selectedChatId });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit("stop_typing", { chatId: selectedChatId });
      }, 1500);
    },
    [socket, selectedChatId]
  );

  const stopTyping = useCallback(() => {
    if (socket && selectedChatId) {
      socket.emit("stop_typing", { chatId: selectedChatId });
    }
    clearTimeout(typingTimerRef.current);
  }, [socket, selectedChatId]);

  return { isTyping, setIsTyping, handleTyping, stopTyping, typingTimerRef };
};
