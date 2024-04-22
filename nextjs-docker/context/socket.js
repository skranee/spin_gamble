import { createContext } from "react";
import socketio from "socket.io-client";

export const socketContext = createContext(null);
export function SocketContextProvider({ children }) {
  return (
    <socketContext.Provider
      value={socketio.connect("http://159.223.9.182", { transports: ["websocket"] })}
    >
      {children}
    </socketContext.Provider>
  );
}
