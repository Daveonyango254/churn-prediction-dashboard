import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, isDarkMode, setIsDarkMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
