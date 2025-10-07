import { useState, useEffect } from "react";
import { AppLayout } from "./AppLayout";
import { Welcome } from "@/components/auth/Welcome";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useKeyboardNavigation } from "@/contexts/AccessibilityContext";

export function AuthenticatedLayout() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Enable keyboard navigation
  useKeyboardNavigation();

  useEffect(() => {
    // Check if this is the user's first login
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, "true");
    }
    setShowWelcome(false);
  };

  return (
    <div
      role="application"
      aria-label="LARP Manager Application"
      data-keyboard-nav
    >
      <main id="main-content" role="main">
        <AppLayout />
      </main>
      {showWelcome && (
        <div role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <Welcome onComplete={handleWelcomeComplete} />
        </div>
      )}
    </div>
  );
}
