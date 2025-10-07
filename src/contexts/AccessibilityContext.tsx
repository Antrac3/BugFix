import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large" | "xl";
  contrast: "normal" | "high";
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  theme: "light" | "dark" | "auto";
  compactMode: boolean;
  focusIndicator: "default" | "enhanced";
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  currentFontSize: string;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "medium",
  contrast: "normal",
  reducedMotion: false,
  keyboardNavigation: true,
  screenReader: false,
  theme: "auto",
  compactMode: false,
  focusIndicator: "default",
};

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem("accessibility-settings");
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Detect system preferences
  useEffect(() => {
    const detectSystemPreferences = () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const prefersHighContrast = window.matchMedia(
        "(prefers-contrast: high)",
      ).matches;

      setSettings((prev) => ({
        ...prev,
        reducedMotion: prev.reducedMotion || prefersReducedMotion,
        contrast:
          prev.contrast === "normal" && prefersHighContrast
            ? "high"
            : prev.contrast,
        theme:
          prev.theme === "auto"
            ? prefersDarkMode
              ? "dark"
              : "light"
            : prev.theme,
      }));
    };

    detectSystemPreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(prefers-contrast: high)"),
    ];

    mediaQueries.forEach((mq) =>
      mq.addEventListener("change", detectSystemPreferences),
    );

    return () => {
      mediaQueries.forEach((mq) =>
        mq.removeEventListener("change", detectSystemPreferences),
      );
    };
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty(
      "--font-size-multiplier",
      settings.fontSize === "small"
        ? "0.875"
        : settings.fontSize === "large"
          ? "1.125"
          : settings.fontSize === "xl"
            ? "1.25"
            : "1",
    );

    // High contrast
    if (settings.contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Theme
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Compact mode
    if (settings.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }

    // Enhanced focus
    if (settings.focusIndicator === "enhanced") {
      root.classList.add("enhanced-focus");
    } else {
      root.classList.remove("enhanced-focus");
    }

    // Screen reader support
    if (settings.screenReader) {
      root.setAttribute("data-screen-reader", "true");
    } else {
      root.removeAttribute("data-screen-reader");
    }

    // Save to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("accessibility-settings");
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    isHighContrast: settings.contrast === "high",
    isReducedMotion: settings.reducedMotion,
    currentFontSize: settings.fontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key - close modals/dropdowns
      if (event.key === "Escape") {
        const activeElement = document.activeElement as HTMLElement;
        if (
          activeElement?.closest('[role="dialog"]') ||
          activeElement?.closest("[data-dropdown]")
        ) {
          const closeButton = document.querySelector(
            "[data-close]",
          ) as HTMLElement;
          closeButton?.click();
        }
      }

      // Arrow keys for navigation in lists/grids
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        const activeElement = document.activeElement as HTMLElement;
        const container = activeElement?.closest("[data-keyboard-nav]");
        if (container) {
          event.preventDefault();
          const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) as NodeListOf<HTMLElement>;

          const currentIndex =
            Array.from(focusableElements).indexOf(activeElement);
          let nextIndex = currentIndex;

          if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            nextIndex =
              currentIndex > 0
                ? currentIndex - 1
                : focusableElements.length - 1;
          } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            nextIndex =
              currentIndex < focusableElements.length - 1
                ? currentIndex + 1
                : 0;
          }

          focusableElements[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

// Hook for focus management
export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  const pushFocus = (element: HTMLElement) => {
    setFocusHistory((prev) => [...prev, element]);
  };

  const popFocus = () => {
    setFocusHistory((prev) => {
      const newHistory = [...prev];
      const lastElement = newHistory.pop();
      lastElement?.focus();
      return newHistory;
    });
  };

  const clearFocusHistory = () => {
    setFocusHistory([]);
  };

  return { pushFocus, popFocus, clearFocusHistory };
}
