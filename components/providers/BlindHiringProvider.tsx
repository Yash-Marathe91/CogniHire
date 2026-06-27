"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type BlindHiringContextType = {
  isBlindMode: boolean;
  toggleBlindMode: () => void;
};

const BlindHiringContext = createContext<BlindHiringContextType | undefined>(undefined);

export function BlindHiringProvider({ children }: { children: React.ReactNode }) {
  const [isBlindMode, setIsBlindMode] = useState(false);

  // Persist preference in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("blind_hiring_mode");
    if (stored === "true") {
      setIsBlindMode(true);
    }
  }, []);

  const toggleBlindMode = () => {
    setIsBlindMode(prev => {
      const newVal = !prev;
      localStorage.setItem("blind_hiring_mode", String(newVal));
      return newVal;
    });
  };

  return (
    <BlindHiringContext.Provider value={{ isBlindMode, toggleBlindMode }}>
      {children}
    </BlindHiringContext.Provider>
  );
}

export function useBlindHiring() {
  const context = useContext(BlindHiringContext);
  if (context === undefined) {
    throw new Error("useBlindHiring must be used within a BlindHiringProvider");
  }
  return context;
}
