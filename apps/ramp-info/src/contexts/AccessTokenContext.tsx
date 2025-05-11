"use client";

/**
 * React Context to provide the access token to the application
 * and save it in local storage.
 */

// External Modules ----------------------------------------------------------

import { createContext, useEffect, useState } from "react";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

type AccessTokenContextType = {
  // Function to change the currently selected access token (if any)
  changeAccessToken: (accessToken: string | null) => void;
  // Currently selected access token
  accessToken: string | null;
}

export const AccessTokenContext = createContext<AccessTokenContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeAccessToken: (accessToken) => {},
  accessToken: null,
});

const LOCAL_STORAGE_NAME = "RampAccessToken";

export const AccessTokenContextProvider = ({children}: {
  children: React.ReactNode,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedAccessToken = localStorage.getItem(LOCAL_STORAGE_NAME) || null;
    setAccessToken(storedAccessToken);
  }, []);

  if (!isMounted) {
    return <>Loading access token ...</>;
  }

  const changeAccessToken = (accessToken: string | null) => {
    setAccessToken(accessToken);
    if (accessToken) {
      localStorage.setItem(LOCAL_STORAGE_NAME, accessToken);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_NAME);
    }
  }

  return (
    <AccessTokenContext.Provider value={{changeAccessToken, accessToken}}>
      {children}
    </AccessTokenContext.Provider>
  );

}
