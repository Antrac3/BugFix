import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  User,
  Users,
  Crown,
  CheckCircle,
  LogIn,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Nome richiesto")
      .min(2, "Il nome deve essere di almeno 2 caratteri")
      .max(50, "Il nome non può superare 50 caratteri"),
    lastName: z
      .string()
      .min(1, "Cognome richiesto")
      .min(2, "Il cognome deve essere di almeno 2 caratteri")
      .max(50, "Il cognome non può superare 50 caratteri"),
    email: z
      .string()
      .min(1, "Email richiesta")
      .email("Formato email non valido"),
    password: z
      .string()
      .min(8, "La password deve essere di almeno 8 caratteri")
      .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
      .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
      .regex(/\d/, "La password deve contenere almeno un numero"),
    confirmPassword: z.string().min(1, "Conferma password richiesta"),
    role: z.enum(["player", "gm"], {
      required_error: "Seleziona un ruolo",
    }),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "Devi accettare i termini e condizioni",
    }),
    acceptPrivacy: z.boolean().refine((value) => value === true, {
      message: "Devi accettare l'informativa sulla privacy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const watchedRole = watch("role");
  const acceptTerms = watch("acceptTerms");
  const acceptPrivacy = watch("acceptPrivacy");

  const onSubmit = async (data: RegisterFormData) => {
    setError("");

    const result = await signUp(data);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registrazione completata! Controlla la tua email per confermare l'account.",
          },
        });
      }, 2000);
    } else {
      setError(result.error || "Errore durante la registrazione");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "player":
        return <Users className="h-4 w-4" />;
      case "gm":
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "player":
        return "Partecipa alle sessioni LARP come giocatore";
      case "gm":
        return "Organizza e gestisce le sessioni LARP";
      default:
        return "";
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
        <Card className="fantasy-card shadow-lg max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Registrazione Completata!
            </h2>
            <p className="text-muted-foreground">
              Il tuo account è stato creato con successo. Verrai reindirizzato
              alla pagina di login...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-fantasy-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground">Unisciti a Noi</h1>
          <p className="text-muted-foreground">
            Crea il tuo account LARP Manager
          </p>
        </div>

        {/* Registration Form */}
        <Card className="fantasy-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registrazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    placeholder="Mario"
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    placeholder="Rossi"
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="mario.rossi@esempio.com"
                    className="pl-10"
                    {...register("email")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <Select
                  value={watchedRole}
                  onValueChange={(value) =>
                    setValue("role", value as "player" | "gm")
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tuo ruolo">
                      {watchedRole && (
                        <div className="flex items-center gap-2">
                          {getRoleIcon(watchedRole)}
                          <span className="capitalize">
                            {watchedRole === "gm" ? "Game Master" : "Giocatore"}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Giocatore</div>
                          <div className="text-xs text-muted-foreground">
                            Partecipa alle sessioni LARP
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gm">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Game Master</div>
                          <div className="text-xs text-muted-foreground">
                            Organizza e gestisce le sessioni
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
                {watchedRole && (
                  <p className="text-xs text-muted-foreground">
                    {getRoleDescription(watchedRole)}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crea una password sicura"
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
                    <p className="text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Conferma Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ripeti la password"
                      className="pl-10 pr-10"
                      {...register("confirmPassword")}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", !!checked)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    Accetto i{" "}
                    <Link
                      to="/terms"
                      className="text-fantasy-primary hover:underline"
                    >
                      termini e condizioni
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-600">
                    {errors.acceptTerms.message}
                  </p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(checked) =>
                      setValue("acceptPrivacy", !!checked)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="acceptPrivacy" className="text-sm">
                    Accetto l'{" "}
                    <Link
                      to="/privacy"
                      className="text-fantasy-primary hover:underline"
                    >
                      informativa sulla privacy
                    </Link>
                  </Label>
                </div>
                {errors.acceptPrivacy && (
                  <p className="text-xs text-red-600">
                    {errors.acceptPrivacy.message}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
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
                    Registrazione in corso...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crea Account
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link
                to="/login"
                className="text-fantasy-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                Accedi
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 LARP Manager. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
}
