// Automatic ergonomic enhancements applier
// This script automatically applies ergonomic attributes to the document

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  theme: "light" | "dark" | "auto";
}

export function applyErgonomicAttributes(settings: AccessibilitySettings) {
  const body = document.body;
  const html = document.documentElement;

  // Apply font size
  html.setAttribute("data-font-size", settings.fontSize);

  // Apply compact mode
  html.setAttribute("data-compact-mode", settings.compactMode.toString());

  // Apply high contrast
  html.setAttribute("data-high-contrast", settings.highContrast.toString());

  // Apply reduced motion
  html.setAttribute("data-reduced-motion", settings.reducedMotion.toString());

  // Apply theme
  html.setAttribute("data-theme", settings.theme);

  // Update CSS custom properties for dynamic adjustments
  const root = document.documentElement.style;

  // Font size adjustments
  switch (settings.fontSize) {
    case "small":
      root.setProperty("--base-font-size", "0.875rem");
      root.setProperty("--heading-scale", "1.2");
      break;
    case "large":
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
  if (settings.highContrast) {
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
}

export function enhanceExistingElements() {
  // Auto-enhance buttons for better touch targets
  const buttons = document.querySelectorAll("button, [role='button']");
  buttons.forEach((button) => {
    button.classList.add("enhanced-focus");

    // Ensure minimum touch target size
    const element = button as HTMLElement;
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

    // Add aria-labels if missing
    const element = input as HTMLElement;
    if (!element.getAttribute("aria-label") && !element.getAttribute("id")) {
      const label = element.closest("label") || element.previousElementSibling;
      if (label && label.textContent) {
        element.setAttribute("aria-label", label.textContent.trim());
      }
    }
  });

  // Auto-enhance links
  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    link.classList.add("enhanced-focus");

    // Add external link indicators
    const element = link as HTMLAnchorElement;
    if (element.hostname && element.hostname !== window.location.hostname) {
      element.setAttribute(
        "aria-label",
        `${element.textContent} (apre in una nuova finestra)`,
      );
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  // Auto-enhance cards for better accessibility
  const cards = document.querySelectorAll("[class*='card'], .fantasy-card");
  cards.forEach((card) => {
    if (!card.getAttribute("role")) {
      card.setAttribute("role", "article");
    }
  });

  // Auto-enhance navigation elements
  const navElements = document.querySelectorAll("nav");
  navElements.forEach((nav) => {
    if (!nav.getAttribute("aria-label")) {
      nav.setAttribute("aria-label", "Navigazione");
    }
  });

  // Auto-enhance headings for screen readers
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let currentLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > currentLevel + 1) {
      console.warn(
        `Heading hierarchy skip detected: ${heading.textContent} (${heading.tagName})`,
      );
    }
    currentLevel = level;
  });
}

export function addSkipLinks() {
  // Add skip to main content link if it doesn't exist
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Vai al contenuto principale";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Ensure main content has proper ID
  let mainContent = document.getElementById("main-content");
  if (!mainContent) {
    mainContent = document.querySelector("main") as HTMLElement;
    if (mainContent) {
      mainContent.id = "main-content";
    }
  }
}

export function addLiveRegions() {
  // Add status announcements region if it doesn't exist
  if (!document.getElementById("status-announcements")) {
    const statusRegion = document.createElement("div");
    statusRegion.id = "status-announcements";
    statusRegion.setAttribute("aria-live", "polite");
    statusRegion.setAttribute("aria-atomic", "true");
    statusRegion.className = "sr-only";
    document.body.appendChild(statusRegion);
  }

  // Add alert announcements region if it doesn't exist
  if (!document.getElementById("alert-announcements")) {
    const alertRegion = document.createElement("div");
    alertRegion.id = "alert-announcements";
    alertRegion.setAttribute("aria-live", "assertive");
    alertRegion.setAttribute("aria-atomic", "true");
    alertRegion.className = "sr-only";
    document.body.appendChild(alertRegion);
  }
}

export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
) {
  const regionId =
    priority === "assertive" ? "alert-announcements" : "status-announcements";
  const region = document.getElementById(regionId);

  if (region) {
    region.textContent = message;

    // Clear the message after a delay to allow re-announcement of the same message
    setTimeout(() => {
      region.textContent = "";
    }, 1000);
  }
}

// Auto-apply enhancements when DOM is ready
export function initializeErgonomicEnhancements() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enhanceExistingElements();
      addSkipLinks();
      addLiveRegions();
    });
  } else {
    enhanceExistingElements();
    addSkipLinks();
    addLiveRegions();
  }

  // Re-enhance when new content is added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Debounce enhancements
        setTimeout(() => {
          enhanceExistingElements();
        }, 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Global utility functions
declare global {
  interface Window {
    announceToScreenReader: typeof announceToScreenReader;
    applyErgonomicAttributes: typeof applyErgonomicAttributes;
  }
}

window.announceToScreenReader = announceToScreenReader;
window.applyErgonomicAttributes = applyErgonomicAttributes;
