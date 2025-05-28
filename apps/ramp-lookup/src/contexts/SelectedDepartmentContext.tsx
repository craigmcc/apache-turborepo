"use client";

/**
 * React Context to provide the currently selected User to the application
 * and save it in local storage.
 */

// External Modules ----------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";

// Internal Modules ----------------------------------------------------------

import { DEPARTMENT_KEY, DepartmentPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

type SelectedDepartmentContextType = {
  // Function to change the currently selected Department (if any)
  changeSelectedDepartment: (selectedDepartment: DepartmentPlus | null) => void;
  // Currently selected Department
  selectedDepartment: DepartmentPlus | null;
}

export const SelectedDepartmentContext = createContext<SelectedDepartmentContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeSelectedDepartment: (selectedDepartment) => {},
  selectedDepartment: null,
});

export function useSelectedDepartmentContext() {
  const context = useContext(SelectedDepartmentContext);
  if (!context) {
    throw new Error("useSelectedDepartmentContext must be used within a SelectedDepartmentContextProvider");
  }
  return context;
}

export const SelectedDepartmentContextProvider = ({children}: {
  children: React.ReactNode,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentPlus | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedSelectedDepartment = localStorage.getItem(DEPARTMENT_KEY);
    setSelectedDepartment(storedSelectedDepartment ? JSON.parse(storedSelectedDepartment) : null);
  }, []);

  if (!isMounted) {
    return <>Loading selectedDepartment ...</>;
  }

  const changeSelectedDepartment = (selectedDepartment: DepartmentPlus | null) => {
    setSelectedDepartment(selectedDepartment);
    if (selectedDepartment) {
      localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(selectedDepartment));
    } else {
      localStorage.removeItem(DEPARTMENT_KEY);
    }
  }

  return (
    <SelectedDepartmentContext.Provider value={{ selectedDepartment, changeSelectedDepartment }}>
      {children}
    </SelectedDepartmentContext.Provider>
  );

}
