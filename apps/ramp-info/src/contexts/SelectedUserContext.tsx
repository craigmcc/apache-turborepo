"use client";

/**
 * React Context to provide the currently selected User to the application
 * and save it in local storage.
 */

// External Modules ----------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";

// Internal Modules ----------------------------------------------------------

import { User } from "@/types/Models";

// Public Objects ------------------------------------------------------------

type SelectedUserContextType = {
  // Function to change the currently selected access token (if any)
  changeSelectedUser: (selectedUser: User | null) => void;
  // Currently selected access token
  selectedUser: User | null;
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

const LOCAL_STORAGE_NAME = "RampSelectedUser";

export const SelectedUserContextProvider = ({children}: {
  children: React.ReactNode,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedSelectedUser = localStorage.getItem(LOCAL_STORAGE_NAME);
    setSelectedUser(storedSelectedUser ? JSON.parse(storedSelectedUser) : null);
  }, []);

  if (!isMounted) {
    return <>Loading selected User ...</>;
  }

  const changeSelectedUser = (selectedUser: User | null) => {
    setSelectedUser(selectedUser);
    if (selectedUser) {
      localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_NAME);
    }
  }

  return (
    <SelectedUserContext.Provider value={{changeSelectedUser, selectedUser}}>
      {children}
    </SelectedUserContext.Provider>
  );

}
