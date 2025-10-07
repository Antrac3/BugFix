import { useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

/**
 * Simple component that automatically applies ergonomic enhancements to any page
 * Just add <ErgonomicEnhancer /> at the top of any page component to activate enhancements
 */
export function ErgonomicEnhancer() {
  const { settings } = useAccessibility();

  useEffect(() => {
    // Apply font size attribute
    document.documentElement.setAttribute(
      "data-font-size",
      settings.fontSize === "xl" ? "large" : settings.fontSize,
    );

    // Apply compact mode
    document.documentElement.setAttribute(
      "data-compact-mode",
      settings.compactMode.toString(),
    );

    // Apply high contrast
    document.documentElement.setAttribute(
      "data-high-contrast",
      (settings.contrast === "high").toString(),
    );

    // Apply reduced motion
    document.documentElement.setAttribute(
      "data-reduced-motion",
      settings.reducedMotion.toString(),
    );

    // Apply theme
    document.documentElement.setAttribute("data-theme", settings.theme);

    // Update CSS custom properties for dynamic adjustments
    const root = document.documentElement.style;

    // Font size adjustments
    switch (settings.fontSize) {
      case "small":
        root.setProperty("--base-font-size", "0.875rem");
        root.setProperty("--heading-scale", "1.2");
        break;
      case "large":
      case "xl":
        root.setProperty("--base-font-size", "1.125rem");
        root.setProperty("--heading-scale", "1.4");
        break;
      default:
        root.setProperty("--base-font-size", "1rem");
        root.setProperty("--heading-scale", "1.3");
    }

    // Spacing adjustments for compact mode
    if (settings.compactMode) {
      root.setProperty("--spacing-multiplier", "0.75");
      root.setProperty("--padding-multiplier", "0.8");
    } else {
      root.setProperty("--spacing-multiplier", "1");
      root.setProperty("--padding-multiplier", "1");
    }

    // High contrast adjustments
    if (settings.contrast === "high") {
      root.setProperty("--border-width-multiplier", "2");
      root.setProperty("--contrast-boost", "1.25");
    } else {
      root.setProperty("--border-width-multiplier", "1");
      root.setProperty("--contrast-boost", "1");
    }

    // Motion adjustments
    if (settings.reducedMotion) {
      root.setProperty("--animation-duration", "0.01ms");
      root.setProperty("--transition-duration", "0.01ms");
    } else {
      root.setProperty("--animation-duration", "200ms");
      root.setProperty("--transition-duration", "150ms");
    }

    // Auto-enhance buttons for better touch targets
    setTimeout(() => {
      const buttons = document.querySelectorAll("button, [role='button']");
      buttons.forEach((button) => {
        const element = button as HTMLElement;
        element.classList.add("enhanced-focus");

        // Ensure minimum touch target size
        const rect = element.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
          element.style.minHeight = "44px";
          element.style.minWidth = "44px";
        }
      });

      // Auto-enhance form inputs
      const inputs = document.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.classList.add("enhanced-focus");
      });

      // Auto-enhance links
      const links = document.querySelectorAll("a[href]");
      links.forEach((link) => {
        link.classList.add("enhanced-focus");
      });
    }, 100);
  }, [settings]);

  // This component doesn't render anything visible
  return null;
}

// Simple utility function to get ergonomic class names
export function getErgonomicClasses(settings: any) {
  return {
    pageContainer: `space-y-6 ${settings.compactMode ? "space-y-4" : "space-y-6"}`,
    pageTitle: `font-bold text-foreground ${
      settings.fontSize === "xl" || settings.fontSize === "large"
        ? "text-3xl"
        : settings.fontSize === "small"
          ? "text-xl"
          : "text-2xl"
    }`,
    pageDescription: `text-muted-foreground ${
      settings.fontSize === "xl" || settings.fontSize === "large"
        ? "text-lg"
        : settings.fontSize === "small"
          ? "text-sm"
          : "text-base"
    }`,
    card: `rounded-lg border bg-card text-card-foreground shadow-sm ${
      settings.compactMode ? "p-4" : "p-6"
    } ${settings.contrast === "high" ? "border-2" : ""}`,
    button: `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
      settings.compactMode ? "h-8 px-3 text-xs" : "h-10 px-4 py-2"
    } ${settings.reducedMotion ? "transition-none" : ""}`,
  };
}
