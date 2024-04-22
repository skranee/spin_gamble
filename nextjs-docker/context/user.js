import { createContext, useState } from "react";

export const userContext = createContext(null);
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <userContext.Provider
      value={{ user, setUser, isLoggedIn, setLoggedIn, credentials: null }}
    >
      {children}
    </userContext.Provider>
  );
}
