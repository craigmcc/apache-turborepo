"use client";

/**
 * React Context to provide the currently selected Card to the
 * application and save it in local storage.
 */

// External Modules ----------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";
//import { Card } from "@repo/ramp-db/client";

// Internal Modules ----------------------------------------------------------

import { CARD_KEY, CardPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

type SelectedCardContextType = {
  // Function to change the currently selected Card (if any)
  changeSelectedCard: (selectedCard: CardPlus | null) => void;
  // Currently selected Card
  selectedCard: CardPlus | null;
}

export const SelectedCardContext = createContext<SelectedCardContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeSelectedCard: (selectedCard) => {},
  selectedCard: null,
});

export function useSelectedCardContext() {
  const context = useContext(SelectedCardContext);
  if (!context) {
    throw new Error("useSelectedCardContext must be used within a SelectedCardContextProvider");
  }
  return context;
}

export const SelectedCardContextProvider = ({children}: {
  children: React.ReactNode,
}) => {
  const [selectedCard, setSelectedCard] = useState<CardPlus | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedSelectedCard = localStorage.getItem(CARD_KEY);
    setSelectedCard(storedSelectedCard ? JSON.parse(storedSelectedCard) : null);
  }, []);

  if (!isMounted) {
    return <>Loading selectedCard ...</>;
  }

  const changeSelectedCard = (selectedCard: CardPlus | null) => {
    setSelectedCard(selectedCard);
    if (selectedCard) {
      localStorage.setItem(CARD_KEY, JSON.stringify(selectedCard));
    } else {
      localStorage.removeItem(CARD_KEY);
    }
  }

  return (
    <SelectedCardContext.Provider value={{ selectedCard, changeSelectedCard }}>
      {children}
    </SelectedCardContext.Provider>
  );

}
