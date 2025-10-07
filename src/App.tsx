import * as React from "react";
import { EnhancedToaster } from "./components/ui/enhanced-toast"; // wrapper pronto
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAppProvider } from "./contexts/SupabaseAppContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { CookieConsentBanner } from "./components/privacy/CookieConsentBanner";

import "./styles/ergonomic.css";
import { AuthenticatedLayout } from "./components/layout/AuthenticatedLayout";
import { ProtectedRoute, PublicRoute } from "./components/auth/ProtectedRoute";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import Players from "./pages/Players";
import Characters from "./pages/Characters";
import NPCs from "./pages/NPCs";
import Locations from "./pages/Locations";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import Experience from "./pages/Experience";
import Inventory from "./pages/Inventory";
import Messages from "./pages/Messages";
import Rules from "./pages/Rules";
import Director from "./pages/Director";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import UserManagement from "./pages/UserManagement";
import Events from "./pages/Events";
import Plots from "./pages/Plots";
import Communications from "./pages/Communications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  React.useEffect(() => {
    const handleKeyDown = () => document.body.classList.add("keyboard-user");
    const handleMouseDown = () => document.body.classList.add("mouse-user");

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Salta al contenuto principale
      </a>

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/" element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route index element={<EnhancedDashboard />} />
            <Route path="characters" element={<Characters />} />
            <Route path="events" element={<Events />} />
            <Route path="plots" element={<Plots />} />
            <Route path="communications" element={<Communications />} />
            <Route path="messages" element={<Messages />} />
            <Route path="rules" element={<Rules />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<ProtectedRoute requiredRole={["admin","super_admin"]}><Settings /></ProtectedRoute>} />

            <Route path="players" element={<ProtectedRoute requiredRole={["gm","admin"]}><Players /></ProtectedRoute>} />
            <Route path="npcs" element={<ProtectedRoute requiredRole={["gm","admin"]}><NPCs /></ProtectedRoute>} />
            <Route path="locations" element={<ProtectedRoute requiredRole={["gm","admin"]}><Locations /></ProtectedRoute>} />
            <Route path="contacts" element={<ProtectedRoute requiredRole={["gm","admin"]}><Contacts /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute requiredRole={["gm","admin"]}><Tasks /></ProtectedRoute>} />
            <Route path="experience" element={<ProtectedRoute requiredRole={["gm","admin"]}><Experience /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute requiredRole={["gm","admin"]}><Inventory /></ProtectedRoute>} />

            <Route path="director" element={<ProtectedRoute requiredRole="admin"><Director /></ProtectedRoute>} />
            <Route path="user-management" element={<ProtectedRoute requiredRole="super_admin"><UserManagement /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute requiredRole={["gm","admin"]}><Analytics /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccessibilityProvider>
        <SupabaseAuthProvider>
          <SupabaseAppProvider>
            <PrivacyProvider>
              <EnhancedToaster />
              <AppContent />
              <CookieConsentBanner />
            </PrivacyProvider>
          </SupabaseAppProvider>
        </SupabaseAuthProvider>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
