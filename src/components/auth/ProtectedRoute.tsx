import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, session, hasRole, canAccess } =
    useAuth();
  const location = useLocation();
  const [hasWaitedForProfile, setHasWaitedForProfile] = useState(false);

  // Debug logging only in development
  if (import.meta.env.DEV && isLoading) {
    console.log("🛡️ ProtectedRoute State:", {
      pathname: location.pathname,
      isAuthenticated,
      isLoading,
      hasSession: !!session,
      hasUser: !!user,
      userRole: user?.role,
      requiredRole,
    });
  }

  // Give some time for the profile to load before showing "Database not configured"
  useEffect(() => {
    if (session && !user && !isLoading) {
      const timer = setTimeout(() => {
        setHasWaitedForProfile(true);
      }, 2000); // Wait 2 seconds

      return () => clearTimeout(timer);
    } else {
      setHasWaitedForProfile(false);
    }
  }, [session, user, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center">
        <Card className="fantasy-card max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-fantasy-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-fantasy-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Caricamento...
            </h2>
            <p className="text-muted-foreground">
              Verifica dell'autenticazione in corso
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if we have a session but no user profile (database not migrated)
  // Only show this error if we've waited enough time for the profile to load
  if (session && !user && !isLoading && hasWaitedForProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
        <Card className="fantasy-card max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Database Non Configurato
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Il database non è stato ancora migrato. Per usare
                l'applicazione:
              </p>
              <ol className="text-sm text-muted-foreground text-left space-y-1">
                <li>1. Vai alla dashboard Supabase</li>
                <li>2. Apri SQL Editor</li>
                <li>3. Esegui lo script di migrazione</li>
              </ol>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Ricarica Pagina
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
        <Card className="fantasy-card max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Accesso Negato
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Non hai i permessi necessari per accedere a questa pagina.
              </p>
              <p className="text-sm text-muted-foreground">
                Ruolo richiesto:{" "}
                <span className="font-medium">
                  {Array.isArray(requiredRole)
                    ? requiredRole.join(", ")
                    : requiredRole}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Il tuo ruolo: <span className="font-medium">{user?.role}</span>
              </p>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermission && !canAccess(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
        <Card className="fantasy-card max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Funzionalità Non Disponibile
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Questa funzionalità non è disponibile per il tuo tipo di
                account.
              </p>
              <p className="text-sm text-muted-foreground">
                Permesso richiesto:{" "}
                <span className="font-medium">{requiredPermission}</span>
              </p>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}

// Component for public routes (redirect to dashboard if authenticated)
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fantasy-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
