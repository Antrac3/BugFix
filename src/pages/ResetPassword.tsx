import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  KeyRound,
  Mail,
  AlertCircle,
  Loader2,
  Shield,
  CheckCircle,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email richiesta").email("Formato email non valido"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { resetPassword, isLoading } = useAuth();

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError("");

    const result = await resetPassword(data);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Errore durante il reset della password");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fantasy-primary/10 via-background to-fantasy-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="fantasy-card shadow-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Email Inviata!
              </h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Se l'indirizzo email <strong>{getValues("email")}</strong> è
                  registrato nel nostro sistema, riceverai le istruzioni per
                  reimpostare la password.
                </p>
                <p className="text-sm text-muted-foreground">
                  Controlla anche la cartella spam/posta indesiderata.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Link to="/login">
                  <Button className="w-full fantasy-button">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Torna al Login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSuccess(false)}
                >
                  Invia di Nuovo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">
            Inserisci la tua email per ricevere le istruzioni
          </p>
        </div>

        {/* Reset Form */}
        <Card className="fantasy-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5" />
              Password Dimenticata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Come funziona:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Inserisci il tuo indirizzo email</li>
                      <li>Riceverai un'email con un link sicuro</li>
                      <li>Clicca sul link per creare una nuova password</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Indirizzo Email</Label>
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
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Invia Istruzioni
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-fantasy-primary hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al Login
              </Link>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <div className="text-xs text-muted-foreground">
                <p>Problemi con il reset?</p>
                <p className="mt-1">
                  Contatta il supporto:
                  <a
                    href="mailto:support@larpmanager.com"
                    className="text-fantasy-primary hover:underline ml-1"
                  >
                    support@larpmanager.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="fantasy-card bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  Nota sulla Sicurezza:
                </p>
                <p className="text-amber-700">
                  Per la tua sicurezza, non riveleremo mai se un indirizzo email
                  è registrato nel nostro sistema. Se non ricevi l'email,
                  potrebbe significare che l'indirizzo non è associato a nessun
                  account.
                </p>
              </div>
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
