import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const loginSchema = z.object({
  email: z.string().min(1, "Email richiesta").email("Formato email non valido"),
  password: z.string().min(1, "Password richiesta"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setError("");

    const result = await signIn(data);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Errore durante il login");
    }
  };

  const fillDemoCredentials = (role: "admin" | "gm" | "player") => {
    const credentials = {
      admin: "admin@larpmanager.com",
      gm: "gm@larpmanager.com",
      player: "player@larpmanager.com",
    };

    setValue("email", credentials[role]);
    setValue("password", "password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-fantasy-primary rounded-xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Benvenuto</h1>
          <p className="text-muted-foreground">
            Accedi al tuo account LARP Manager
          </p>
        </div>

        {/* Login Form */}
        <Card className="fantasy-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Accedi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="la-tua-email@esempio.com"
                    className="pl-10"
                    {...register("email")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="La tua password"
                    className="pl-10 pr-10"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setValue("rememberMe", !!checked)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Ricordami
                </Label>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                    {error.includes("Credenziali non valide") && (
                      <div className="mt-2 pt-2 border-t border-red-300">
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-1 text-sm text-red-800 hover:text-red-900 underline font-medium"
                        >
                          <UserPlus className="h-3 w-3" />
                          Non hai un account? Registrati qui
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full fantasy-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Accedi
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/reset-password"
                  className="text-sm text-fantasy-primary hover:underline flex items-center justify-center gap-1"
                >
                  <KeyRound className="h-4 w-4" />
                  Password dimenticata?
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Non hai un account?{" "}
                <Link
                  to="/register"
                  className="text-fantasy-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Registrati
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © 2025 LARP Manager. Tutti i diritti riservati. Powered by Antrac3
          </p>
          <p className="mt-1">Sistema di gestione LARP professionale</p>
        </div>
      </div>
    </div>
  );
}
