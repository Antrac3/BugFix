import React, { useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import {
  applyErgonomicAttributes,
  enhanceExistingElements,
  addSkipLinks,
  addLiveRegions,
  announceToScreenReader,
} from "@/utils/ergonomic-applier";

// Universal hook that automatically enhances any page with ergonomic improvements
export function useUniversalErgonomics() {
  const { settings } = useAccessibility();

  useEffect(() => {
    // Apply ergonomic attributes to the document
    applyErgonomicAttributes({
      fontSize: settings.fontSize === "xl" ? "large" : settings.fontSize,
      compactMode: settings.compactMode,
      highContrast: settings.contrast === "high",
      reducedMotion: settings.reducedMotion,
      theme: settings.theme,
    });

    // Enhance existing elements
    enhanceExistingElements();
    addSkipLinks();
    addLiveRegions();
  }, [settings]);

  // Auto-enhance new content when it's added
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldEnhance = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldEnhance = true;
            }
          });
        }
      });

      if (shouldEnhance) {
        // Debounce enhancements to avoid excessive processing
        setTimeout(() => {
          enhanceExistingElements();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return {
    announceToScreenReader,
    settings,
    applyErgonomicAttributes,
  };
}

// Hook specifically for page-level enhancements
export function usePageErgonomics(pageTitle?: string) {
  const ergonomics = useUniversalErgonomics();

  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - LARP Manager`;
      announceToScreenReader(`Navigato a ${pageTitle}`);
    }
  }, [pageTitle]);

  return ergonomics;
}

// Easy-to-use class names for manual application
export function useErgonomicClasses() {
  const { settings } = useAccessibility();

  return {
    // Page-level classes
    pageContainer: `ergonomic-page ${
      settings.compactMode ? "compact" : "comfortable"
    } ${settings.contrast === "high" ? "high-contrast" : ""} ${
      settings.reducedMotion ? "reduced-motion" : ""
    }`,

    // Header classes
    pageHeader: "ergonomic-page-header",
    pageTitle: `ergonomic-heading font-bold ${
      settings.fontSize === "xl"
        ? "text-4xl"
        : settings.fontSize === "large"
          ? "text-3xl"
          : settings.fontSize === "small"
            ? "text-xl"
            : "text-2xl"
    }`,
    pageDescription: `ergonomic-caption ${
      settings.fontSize === "xl"
        ? "text-lg"
        : settings.fontSize === "large"
          ? "text-base"
          : settings.fontSize === "small"
            ? "text-sm"
            : "text-base"
    }`,

    // Content classes
    card: "ergonomic-card",
    grid: "ergonomic-grid",
    button: "ergonomic-button enhanced-focus",
    text: "ergonomic-text",
    caption: "ergonomic-caption",

    // Layout classes
    section: `space-y-4 ${settings.compactMode ? "compact-spacing" : "normal-spacing"}`,
    loading: "ergonomic-loading",

    // Interactive classes
    focusRing: "enhanced-focus",
    touchTarget: "min-h-[44px] min-w-[44px]",
  };
}

// Auto-apply ergonomics to any component
export function withErgonomics<T extends object>(
  Component: React.ComponentType<T>,
  pageTitle?: string,
) {
  return function ErgonomicComponent(props: T) {
    usePageErgonomics(pageTitle);

    return <Component {...props} />;
  };
}
