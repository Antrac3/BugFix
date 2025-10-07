import React, { createContext, useContext, ReactNode } from "react";
import { usePrivacy, PrivacyContextType } from "@/hooks/usePrivacy";

const PrivacyContext = createContext<PrivacyContextType | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const privacy = usePrivacy();

  return (
    <PrivacyContext.Provider value={privacy}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacyContext(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacyContext must be used within a PrivacyProvider");
  }
  return context;
}
