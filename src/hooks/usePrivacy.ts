import { useState, useEffect, createContext, useContext } from "react";

export interface PrivacyConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  lastUpdated: string;
  version: string;
}

export interface PrivacyContextType {
  consent: PrivacyConsent;
  showBanner: boolean;
  acceptAll: () => void;
  acceptNecessary: () => void;
  updateConsent: (newConsent: Partial<PrivacyConsent>) => void;
  resetConsent: () => void;
  hasConsent: (type: keyof PrivacyConsent) => boolean;
}

const PRIVACY_VERSION = "1.0";
const CONSENT_KEY = "larp_manager_privacy_consent";

const defaultConsent: PrivacyConsent = {
  necessary: true, // Always true, required for app functionality
  analytics: false,
  marketing: false,
  functional: false,
  lastUpdated: new Date().toISOString(),
  version: PRIVACY_VERSION,
};

export const PrivacyContext = createContext<PrivacyContextType | null>(null);

export function usePrivacy(): PrivacyContextType {
  const [consent, setConsent] = useState<PrivacyConsent>(defaultConsent);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Load existing consent from localStorage
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsedConsent = JSON.parse(stored);

        // Check if version is outdated
        if (parsedConsent.version !== PRIVACY_VERSION) {
          setShowBanner(true);
          return;
        }

        setConsent(parsedConsent);
        setShowBanner(false);
      } catch (error) {
        console.error("Error parsing stored consent:", error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: PrivacyConsent) => {
    const consentWithMetadata = {
      ...newConsent,
      lastUpdated: new Date().toISOString(),
      version: PRIVACY_VERSION,
      necessary: true, // Always enforce necessary cookies
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithMetadata));
    setConsent(consentWithMetadata);
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      lastUpdated: new Date().toISOString(),
      version: PRIVACY_VERSION,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      lastUpdated: new Date().toISOString(),
      version: PRIVACY_VERSION,
    });
  };

  const updateConsent = (newConsent: Partial<PrivacyConsent>) => {
    saveConsent({
      ...consent,
      ...newConsent,
    });
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent(defaultConsent);
    setShowBanner(true);
  };

  const hasConsent = (type: keyof PrivacyConsent): boolean => {
    return consent[type] === true;
  };

  return {
    consent,
    showBanner,
    acceptAll,
    acceptNecessary,
    updateConsent,
    resetConsent,
    hasConsent,
  };
}
