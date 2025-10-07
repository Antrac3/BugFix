import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Session,
  User as SupabaseUser,
  AuthError,
} from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Shield, UserPlus, BookOpen, Users, ArrowRight } from "lucide-react";
import { supabase, checkDatabaseSetup } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/lib/database.types";

// Profile type from database
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Extended user interface
export interface User extends Profile {
  name: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: "player" | "gm";
}

// Login data
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Reset password data
export interface ResetPasswordData {
  email: string;
}

// Auth context interface
interface AuthContextType {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  signUp: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    data: ResetPasswordData,
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  hasRole: (role: string | string[]) => boolean;
  canAccess: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔄 Starting auth initialization...");
        }

        // Get session first - don't block on database check
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (import.meta.env.DEV) {
          console.log(
            "📝 Session result:",
            initialSession ? "Found session" : "No session",
          );
        }

        setSession(initialSession);

        if (initialSession?.user) {
          // Load profile asynchronously, don't block auth initialization
          loadUserProfile(initialSession.user.id).catch((profileError) => {
            const errorMsg =
              profileError instanceof Error
                ? profileError.message
                : String(profileError);
            console.error("Profile loading failed (non-blocking):", errorMsg);
            // Set a minimal user object to allow auth to proceed
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || "",
              first_name: "",
              last_name: "",
              role: "player",
              avatar_url: null,
              created_at: "",
              updated_at: "",
              last_login: null,
              is_active: true,
              preferences: {},
              name: initialSession.user.email || "User",
            });
          });
        }

        // Check database setup asynchronously (non-blocking)
        setTimeout(() => {
          checkDatabaseSetup()
            .then((dbCheck) => {
              if (!dbCheck.success) {
                console.error("Database setup issue:", dbCheck.error);
                toast({
                  title: "Database non migrato",
                  description:
                    "Alcune funzionalità potrebbero non funzionare. Esegui la migrazione del database.",
                  variant: "destructive",
                });
              }
            })
            .catch((error) => {
              console.error("Database check failed:", error);
            });
        }, 1000);
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Errore di connessione",
          description: "Problema nella connessione a Supabase.",
          variant: "destructive",
        });
      } finally {
        console.log(
          "✅ Auth initialization complete - setting loading to false",
        );
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) {
        console.log("Auth state changed:", event);
      }

      setSession(session);

      if (session?.user) {
        // Load profile asynchronously, don't block auth
        loadUserProfile(session.user.id)
          .then(() => {
            if (import.meta.env.DEV) {
              console.log("✅ Profile loaded successfully in auth callback");
            }
            // Update last login
            if (event === "SIGNED_IN") {
              updateLastLogin(session.user.id).catch((error) =>
                console.error("Failed to update last login:", error),
              );
            }
          })
          .catch((profileError) => {
            const errorMsg =
              profileError instanceof Error
                ? profileError.message
                : String(profileError);
            console.error(
              "Profile loading failed in auth subscription:",
              errorMsg,
            );
            // Set minimal user object to proceed
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              first_name: "",
              last_name: "",
              role: "player",
              avatar_url: null,
              created_at: "",
              updated_at: "",
              last_login: null,
              is_active: true,
              preferences: {},
              name: session.user.email || "User",
            });
          });
      } else {
        setProfile(null);
        setUser(null);
      }

      // Always clear loading state
      if (import.meta.env.DEV) {
        console.log("🎯 Setting loading to false in auth callback");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        const errorMsg = `Code: ${error.code || "unknown"}, Message: ${error.message || "no message"}`;
        console.error("Error loading profile:", errorMsg);
        console.error("Full error details:", error);

        // Show user-friendly error message
        if (error.code === "PGRST116") {
          console.warn("Profile not found, creating one automatically...");

          // Try to create a profile automatically for existing users
          const currentUser = await supabase.auth.getUser();
          if (currentUser.data.user) {
            try {
              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  email: currentUser.data.user.email || "",
                  first_name:
                    currentUser.data.user.user_metadata?.first_name ||
                    currentUser.data.user.email?.split("@")[0] ||
                    "User",
                  last_name:
                    currentUser.data.user.user_metadata?.last_name || "",
                  role: currentUser.data.user.user_metadata?.role || "player",
                  is_active: true,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                console.log("✅ Profile created automatically:", newProfile);
                setProfile(newProfile);
                setUser({
                  ...newProfile,
                  name: `${newProfile.first_name} ${newProfile.last_name}`,
                });
                toast({
                  title: "Profilo creato",
                  description:
                    "Il tuo profilo è stato configurato automaticamente.",
                  variant: "default",
                });
                return;
              }
            } catch (createError) {
              console.error(
                "Failed to create profile automatically:",
                createError,
              );
            }
          }

          toast({
            title: "Profilo non trovato",
            description:
              "Contatta l'amministratore per configurare il tuo profilo.",
            variant: "destructive",
          });
        } else if (error.code === "42P01") {
          console.error(
            "Database table 'profiles' not found - run migration script",
          );
          toast({
            title: "Database non configurato",
            description:
              "Contatta l'amministratore per configurare il database.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore caricamento profilo",
            description: error.message || "Riprova più tardi.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data) {
        console.log("📊 Profile data loaded:", data);
        setProfile(data);
        const userData = {
          ...data,
          name: `${data.first_name} ${data.last_name}`,
        };
        console.log("👤 Setting user state:", userData);
        setUser(userData);
      } else {
        console.log("⚠️ No profile data found");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error in loadUserProfile:", errorMessage);
      console.error("Full error object:", error);

      toast({
        title: "Errore di connessione",
        description:
          "Impossibile caricare il profilo. Controlla la connessione.",
        variant: "destructive",
      });
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userId);
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  };

  const signUp = async (
    data: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Validate input
      if (data.password !== data.confirmPassword) {
        return { success: false, error: "Le password non corrispondono" };
      }

      if (data.password.length < 8) {
        return {
          success: false,
          error: "La password deve essere di almeno 8 caratteri",
        };
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
          },
        },
      });

      if (authError) {
        console.error("Signup error:", authError);
        return { success: false, error: getAuthErrorMessage(authError) };
      }

      if (authData.user && !authData.session) {
        toast({
          title: "Verifica la tua email",
          description: "Ti abbiamo inviato un link di conferma via email.",
          variant: "default",
        });
      } else {
        toast({
          title: "Registrazione completata",
          description: "Account creato con successo!",
          variant: "default",
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Errore durante la registrazione. Riprova.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    data: LoginData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        const errorMessage = getAuthErrorMessage(error);

        // Show additional guidance for invalid credentials
        if (error.message === "Invalid login credentials") {
          toast({
            title: "Credenziali non valide",
            description:
              "Controlla email e password, oppure registrati se non hai un account.",
            variant: "destructive",
          });
        }

        return { success: false, error: errorMessage };
      }

      toast({
        title: "Login effettuato",
        description: "Benvenuto nel LARP Manager!",
        variant: "default",
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Errore durante il login. Riprova." };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    // Prevent multiple simultaneous logout attempts
    if (isLoading) {
      if (import.meta.env.DEV) {
        console.log("Logout already in progress, skipping");
      }
      return;
    }

    setIsLoading(true);

    try {
      // Check if there's an active session before attempting logout
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
          // Don't throw error, just log it - we still want to clear local state
        }
      } else {
        if (import.meta.env.DEV) {
          console.log("No active session found, skipping API logout call");
        }
      }

      // Always clear local state regardless of API call success
      setSession(null);
      setProfile(null);
      setUser(null);

      toast({
        title: "Logout effettuato",
        description: "A presto!",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);

      // Even if there's an error, clear local state to ensure user is logged out
      setSession(null);
      setProfile(null);
      setUser(null);

      toast({
        title: "Logout effettuato",
        description: "Sessione terminata",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    data: ResetPasswordData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });

      if (error) {
        console.error("Reset password error:", error);
        return { success: false, error: getAuthErrorMessage(error) };
      }

      toast({
        title: "Email inviata",
        description: "Controlla la tua email per le istruzioni di reset.",
        variant: "default",
      });

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "Errore durante il reset. Riprova." };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    updates: Partial<Profile>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session) {
      return { success: false, error: "Utente non autenticato" };
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Errore durante l'aggiornamento" };
      }

      // Reload profile
      await loadUserProfile(user.id);

      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo.",
        variant: "default",
      });

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: "Errore durante l'aggiornamento. Riprova.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    // Super admin has access to everything
    if (user.role === "super_admin") return true;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const canAccess = (permission: string): boolean => {
    if (!user) return false;

    // Define permissions by role
    const permissions = {
      super_admin: ["*"], // Super admin can access everything including user management
      admin: ["*"], // Admin can access everything except user management
      gm: [
        "dashboard",
        "players",
        "characters",
        "npcs",
        "locations",
        "contacts",
        "tasks",
        "experience",
        "inventory",
        "messages",
        "rules",
        "director",
        "analytics",
        "notifications",
      ],
      player: ["dashboard", "characters", "messages", "rules", "notifications"],
    };

    const userPermissions = permissions[user.role] || [];
    return (
      userPermissions.includes("*") || userPermissions.includes(permission)
    );
  };

  // Helper function to format auth errors
  const getAuthErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Credenziali non valide. Se non hai un account, registrati prima di effettuare l'accesso.";
      case "Email not confirmed":
        return "Email non confermata. Controlla la tua casella di posta e clicca sul link di conferma.";
      case "User already registered":
        return "Email già registrata. Usa le credenziali di accesso esistenti.";
      case "Password should be at least 6 characters":
        return "La password deve essere di almeno 6 caratteri";
      case "Invalid email":
        return "Email non valida. Controlla il formato dell'indirizzo email.";
      case "Signup is disabled":
        return "La registrazione è temporaneamente disabilitata. Contatta l'amministratore.";
      case "Email rate limit exceeded":
        return "Troppi tentativi di accesso. Attendi qualche minuto prima di riprovare.";
      case "Too many requests":
        return "Troppi tentativi di accesso. Attendi qualche minuto prima di riprovare.";
      default:
        return (
          error.message || "Si è verificato un errore durante l'autenticazione"
        );
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    canAccess,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}

// Demo credentials component for development
export const DemoCredentials = () => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
      <Shield className="h-4 w-4" />
      Prima volta su LARP Manager?
    </h4>
    <div className="space-y-2 text-blue-700 text-sm">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        <span>Crea un nuovo account gratuito</span>
      </div>
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span>Gestisci personaggi, trame e eventi LARP</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>Collabora con GM e altri giocatori</span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-blue-200">
      <Link
        to="/register"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        Registrati ora
      </Link>
    </div>
  </div>
);
