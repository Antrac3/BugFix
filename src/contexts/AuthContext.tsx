import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "@/hooks/use-toast";

// User interface
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: "player" | "gm" | "admin";
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: "it" | "en";
    notifications: boolean;
  };
  isActive: boolean;
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
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (
    data: ResetPasswordData,
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  hasRole: (role: string | string[]) => boolean;
  canAccess: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_STORAGE_KEYS = {
  USER: "larp_manager_user",
  TOKEN: "larp_manager_token",
  REMEMBER_ME: "larp_manager_remember_me",
  USERS_DB: "larp_manager_users_db",
} as const;

// Mock users database for demo (in real app this would be server-side)
const defaultUsers: User[] = [
  {
    id: 1,
    email: "admin@larpmanager.com",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    role: "admin",
    joinDate: "2024-01-01",
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: "auto",
      language: "it",
      notifications: true,
    },
    isActive: true,
  },
  {
    id: 2,
    email: "gm@larpmanager.com",
    firstName: "Game",
    lastName: "Master",
    name: "Game Master",
    role: "gm",
    joinDate: "2024-01-02",
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: "dark",
      language: "it",
      notifications: true,
    },
    isActive: true,
  },
  {
    id: 3,
    email: "player@larpmanager.com",
    firstName: "Test",
    lastName: "Player",
    name: "Test Player",
    role: "player",
    joinDate: "2024-01-03",
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: "light",
      language: "it",
      notifications: false,
    },
    isActive: true,
  },
];

// Utility functions
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Password validation
function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("La password deve essere di almeno 8 caratteri");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera maiuscola");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera minuscola");
  }
  if (!/\d/.test(password)) {
    errors.push("La password deve contenere almeno un numero");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate mock token (in real app this would come from server)
function generateToken(): string {
  return `token_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// Hash password (simplified for demo - use proper hashing in production)
function hashPassword(password: string): string {
  // This is just for demo - use bcrypt or similar in production
  return btoa(password + "salt_larp_manager");
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize users database
  useEffect(() => {
    const existingUsers = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);
    if (existingUsers.length === 0) {
      // Create default users with hashed passwords
      const usersWithPasswords = defaultUsers.map((user) => ({
        ...user,
        passwordHash: hashPassword("password123"), // Default password for demo
      }));
      saveToStorage(AUTH_STORAGE_KEYS.USERS_DB, usersWithPasswords);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);

      const savedUser = loadFromStorage<User | null>(
        AUTH_STORAGE_KEYS.USER,
        null,
      );
      const savedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
      const rememberMe = loadFromStorage<boolean>(
        AUTH_STORAGE_KEYS.REMEMBER_ME,
        false,
      );

      if (savedUser && savedToken && rememberMe) {
        // Validate token and user still exists
        const usersDb = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);
        const userExists = usersDb.find(
          (u: any) => u.id === savedUser.id && u.isActive,
        );

        if (userExists) {
          setUser(savedUser);
        } else {
          // Clean up invalid session
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
        }
      }

      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (
    data: LoginData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate input
      if (!validateEmail(data.email)) {
        return { success: false, error: "Email non valida" };
      }

      if (!data.password) {
        return { success: false, error: "Password richiesta" };
      }

      // Get users database
      const usersDb = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);

      // Find user
      const dbUser = usersDb.find(
        (u: any) =>
          u.email.toLowerCase() === data.email.toLowerCase() && u.isActive,
      );

      if (!dbUser) {
        return { success: false, error: "Credenziali non valide" };
      }

      // Verify password
      if (!verifyPassword(data.password, dbUser.passwordHash)) {
        return { success: false, error: "Credenziali non valide" };
      }

      // Create user session
      const userSession: User = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.avatar,
        joinDate: dbUser.joinDate,
        lastLogin: new Date().toISOString(),
        preferences: dbUser.preferences,
        isActive: dbUser.isActive,
      };

      // Generate token
      const token = generateToken();

      // Save session
      setUser(userSession);
      saveToStorage(AUTH_STORAGE_KEYS.USER, userSession);
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);

      if (data.rememberMe) {
        saveToStorage(AUTH_STORAGE_KEYS.REMEMBER_ME, true);
      }

      // Update last login in database
      const updatedUsers = usersDb.map((u: any) =>
        u.id === dbUser.id ? { ...u, lastLogin: userSession.lastLogin } : u,
      );
      saveToStorage(AUTH_STORAGE_KEYS.USERS_DB, updatedUsers);

      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${userSession.firstName}!`,
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

  const register = async (
    data: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate input
      if (!validateEmail(data.email)) {
        return { success: false, error: "Email non valida" };
      }

      if (!data.firstName.trim()) {
        return { success: false, error: "Nome richiesto" };
      }

      if (!data.lastName.trim()) {
        return { success: false, error: "Cognome richiesto" };
      }

      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(". ") };
      }

      if (data.password !== data.confirmPassword) {
        return { success: false, error: "Le password non corrispondono" };
      }

      // Get users database
      const usersDb = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);

      // Check if email already exists
      const existingUser = usersDb.find(
        (u: any) => u.email.toLowerCase() === data.email.toLowerCase(),
      );

      if (existingUser) {
        return { success: false, error: "Email già registrata" };
      }

      // Create new user
      const newUser = {
        id: Math.max(...usersDb.map((u: any) => u.id), 0) + 1,
        email: data.email.toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        role: data.role,
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: "auto" as const,
          language: "it" as const,
          notifications: true,
        },
        isActive: true,
        passwordHash: hashPassword(data.password),
      };

      // Save to database
      const updatedUsers = [...usersDb, newUser];
      saveToStorage(AUTH_STORAGE_KEYS.USERS_DB, updatedUsers);

      toast({
        title: "Registrazione completata",
        description:
          "Account creato con successo! Ora puoi effettuare il login.",
        variant: "default",
      });

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);

    toast({
      title: "Logout effettuato",
      description: "Arrivederci!",
      variant: "default",
    });
  };

  const resetPassword = async (
    data: ResetPasswordData,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!validateEmail(data.email)) {
        return { success: false, error: "Email non valida" };
      }

      // Get users database
      const usersDb = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);

      // Check if user exists
      const user = usersDb.find(
        (u: any) =>
          u.email.toLowerCase() === data.email.toLowerCase() && u.isActive,
      );

      if (!user) {
        // Don't reveal if email exists for security
        return { success: true };
      }

      toast({
        title: "Email inviata",
        description:
          "Se l'email esiste, riceverai le istruzioni per il reset della password.",
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
    updates: Partial<User>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Utente non autenticato" };
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...updates };

      // Update user state
      setUser(updatedUser);
      saveToStorage(AUTH_STORAGE_KEYS.USER, updatedUser);

      // Update users database
      const usersDb = loadFromStorage(AUTH_STORAGE_KEYS.USERS_DB, []);
      const updatedUsers = usersDb.map((u: any) =>
        u.id === user.id ? { ...u, ...updates } : u,
      );
      saveToStorage(AUTH_STORAGE_KEYS.USERS_DB, updatedUsers);

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

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const canAccess = (permission: string): boolean => {
    if (!user) return false;

    // Define permissions by role
    const permissions = {
      admin: ["*"], // Admin can access everything
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    hasRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Demo credentials component for development
export const DemoCredentials = () => (
  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
    <h4 className="font-semibold text-blue-800 mb-2">Credenziali Demo:</h4>
    <div className="space-y-1 text-blue-700">
      <div>
        <strong>Admin:</strong> admin@larpmanager.com / password123
      </div>
      <div>
        <strong>GM:</strong> gm@larpmanager.com / password123
      </div>
      <div>
        <strong>Player:</strong> player@larpmanager.com / password123
      </div>
    </div>
  </div>
);
