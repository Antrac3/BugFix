import React from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { AccessibilityNotifications } from "@/components/ui/accessibility-notifications";
import { AccessibilityToolbar } from "@/components/ui/accessibility-toolbar";
import { cn } from "@/lib/utils";

interface UniversalErgonomicLayoutProps {
  children: React.ReactNode;
}

export function UniversalErgonomicLayout({
  children,
}: UniversalErgonomicLayoutProps) {
  const { settings, isReducedMotion } = useAccessibility();

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isReducedMotion && "transition-none",
        settings.highContrast && "contrast-125",
        settings.theme === "dark" && "dark",
      )}
      style={{
        fontSize: `${
          settings.fontSize === "large"
            ? "1.125rem"
            : settings.fontSize === "small"
              ? "0.875rem"
              : "1rem"
        }`,
      }}
    >
      {/* Accessibility toolbar - floating */}
      <AccessibilityToolbar />

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Vai al contenuto principale
      </a>

      {/* Main content area */}
      <main
        id="main-content"
        className={cn(
          "p-4 sm:p-6 lg:p-8",
          settings.compactMode && "p-3 sm:p-4 lg:p-6",
        )}
        role="main"
        aria-label="Contenuto principale"
      >
        {/* Accessibility notifications */}
        <AccessibilityNotifications />

        {/* Enhanced content wrapper */}
        <div
          className={cn(
            "mx-auto max-w-7xl",
            settings.compactMode && "space-y-4",
            !settings.compactMode && "space-y-6",
          )}
        >
          {children}
        </div>
      </main>

      {/* Accessibility announcements for screen readers */}
      <div
        id="accessibility-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}

// HOC to wrap any page with ergonomic layout
export function withErgonomicLayout<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function ErgonomicWrappedComponent(props: P) {
    return (
      <UniversalErgonomicLayout>
        <Component {...props} />
      </UniversalErgonomicLayout>
    );
  };
}

// Hook to inject ergonomic styles into existing components
export function useErgonomicStyles() {
  const { settings, isReducedMotion } = useAccessibility();

  return {
    // Container styles
    pageContainer: cn(
      "space-y-6",
      settings.compactMode && "space-y-4",
      isReducedMotion && "transition-none",
    ),

    // Header styles
    pageHeader: cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
    ),

    pageTitle: cn(
      "font-bold text-foreground",
      settings.fontSize === "large" && "text-3xl",
      settings.fontSize === "medium" && "text-2xl",
      settings.fontSize === "small" && "text-xl",
    ),

    pageDescription: cn(
      "text-muted-foreground",
      settings.fontSize === "large" && "text-lg",
      settings.fontSize === "medium" && "text-base",
      settings.fontSize === "small" && "text-sm",
    ),

    // Card styles
    card: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      settings.highContrast && "border-2 border-foreground/20",
      settings.compactMode ? "p-4" : "p-6",
    ),

    // Grid styles
    grid: cn("grid gap-6", settings.compactMode && "gap-4"),

    // Button styles
    button: cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      settings.compactMode ? "h-8 px-3 text-xs" : "h-10 px-4 py-2",
      isReducedMotion && "transition-none",
    ),

    // Text styles
    heading1: cn(
      "font-bold text-foreground",
      settings.fontSize === "large" && "text-4xl",
      settings.fontSize === "medium" && "text-3xl",
      settings.fontSize === "small" && "text-2xl",
    ),

    heading2: cn(
      "font-semibold text-foreground",
      settings.fontSize === "large" && "text-2xl",
      settings.fontSize === "medium" && "text-xl",
      settings.fontSize === "small" && "text-lg",
    ),

    heading3: cn(
      "font-medium text-foreground",
      settings.fontSize === "large" && "text-xl",
      settings.fontSize === "medium" && "text-lg",
      settings.fontSize === "small" && "text-base",
    ),

    bodyText: cn(
      "text-foreground",
      settings.fontSize === "large" && "text-lg",
      settings.fontSize === "medium" && "text-base",
      settings.fontSize === "small" && "text-sm",
    ),

    captionText: cn(
      "text-muted-foreground",
      settings.fontSize === "large" && "text-base",
      settings.fontSize === "medium" && "text-sm",
      settings.fontSize === "small" && "text-xs",
    ),

    // Layout helpers
    section: cn("space-y-4", settings.compactMode && "space-y-3"),

    // Focus styles
    focusRing:
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",

    // Animation styles
    animation: cn(
      !isReducedMotion && "transition-all duration-200 ease-in-out",
      isReducedMotion && "transition-none",
    ),

    // High contrast mode
    highContrast: settings.highContrast && "contrast-125 saturate-125",
  };
}
