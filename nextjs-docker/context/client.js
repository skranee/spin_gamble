import { createContext, useState } from "react";

export const clientContext = createContext(null);
export function ClientContextProvider({ children }) {

  return (
    <clientContext.Provider value={{ 
        socket: null,
    }}>
      {children}
    </clientContext.Provider>
  );
}
