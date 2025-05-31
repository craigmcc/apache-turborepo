"use client";

/**
 * React Context to provide the currently selected User to the
 * application and save it in local storage.
 */

// External Modules ----------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";
//import { User } from "@repo/ramp-db/client";

// Internal Modules ----------------------------------------------------------

import { USER_KEY, UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

type SelectedUserContextType = {
  // Function to change the currently selected User (if any)
  changeSelectedUser: (selectedUser: UserPlus | null) => void;
  // Currently selected User
  selectedUser: UserPlus | null;
}

export const SelectedUserContext = createContext<SelectedUserContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeSelectedUser: (selectedUser) => {},
  selectedUser: null,
});

export function useSelectedUserContext() {
  const context = useContext(SelectedUserContext);
  if (!context) {
    throw new Error("useSelectedUserContext must be used within a SelectedUserContextProvider");
  }
  return context;
}

export const SelectedUserContextProvider = ({children}: {
  children: React.ReactNode,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserPlus | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedSelectedUser = localStorage.getItem(USER_KEY);
    setSelectedUser(storedSelectedUser ? JSON.parse(storedSelectedUser) : null);
  }, []);

  if (!isMounted) {
    return <>Loading selectedUser ...</>;
  }

  const changeSelectedUser = (selectedUser: UserPlus | null) => {
    setSelectedUser(selectedUser);
    if (selectedUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  return (
    <SelectedUserContext.Provider value={{ selectedUser, changeSelectedUser }}>
      {children}
    </SelectedUserContext.Provider>
  );

}
