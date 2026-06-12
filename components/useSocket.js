"use client";

import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export function useSocket(user, handlers = {}) {
  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (process.env.NEXT_PUBLIC_ENABLE_SOCKET !== "true") return null;
    return io();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("join:user", user.id);
    socket.emit(user.role === "driver" ? "join:drivers" : "join:passengers");
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
  }, [socket, handlers]);

  return socket;
}
