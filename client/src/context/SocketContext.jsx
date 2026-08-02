import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef  = useRef(null);
  const socketLoaderRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const connectSocket = async () => {
      if (!socketLoaderRef.current) {
        socketLoaderRef.current = import("socket.io-client");
      }

      const { io } = await socketLoaderRef.current;
      if (cancelled) return;

      // Connect (auth via httpOnly cookie — sent automatically)
      const socketUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_APP_BASE_URL ||
        "http://localhost:5000";
      const socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socket.on("user_online", ({ userId }) =>
        setOnlineUsers((s) => new Set([...s, userId])),
      );
      socket.on("user_offline", ({ userId }) =>
        setOnlineUsers((s) => {
          const n = new Set(s);
          n.delete(userId);
          return n;
        }),
      );
    };

    connectSocket();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [user?._id]);

  // Always provide the latest socket instance via a getter
  const contextValue = {
    get socket() { return socketRef.current; },
    connected,
    onlineUsers
  };
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
