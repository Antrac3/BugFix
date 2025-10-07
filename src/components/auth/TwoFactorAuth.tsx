import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Smartphone,
  Key,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorAuth({ isOpen, onClose }: TwoFactorAuthProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      check2FAStatus();
    }
  }, [isOpen]);

  const check2FAStatus = async () => {
    try {
      // In a real implementation, this would check if 2FA is enabled for the user
      // For now, we'll simulate the check
      setIs2FAEnabled(false);
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const enable2FA = async () => {
    try {
      setIsLoading(true);

      // Generate secret key and QR code
      // In a real implementation, this would call a backend service
      const mockSecret = "JBSWY3DPEHPK3PXP"; // Base32 encoded secret
      const appName = "LARP Manager";
      const userEmail = user?.email || "";

      const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${mockSecret}&issuer=${encodeURIComponent(appName)}`;

      setSecretKey(mockSecret);
      setQrCodeUrl(qrUrl);
      setStep("setup");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Errore",
        description: "Impossibile abilitare l'autenticazione a due fattori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Codice non valido",
        description: "Inserisci un codice di 6 cifre",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // In a real implementation, this would verify the TOTP code
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error("Invalid code format");
      }

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substr(2, 8).toUpperCase(),
      );
      setBackupCodes(codes);

      setIs2FAEnabled(true);
      setStep("backup");

      toast({
        title: "2FA Abilitato",
        description:
          "L'autenticazione a due fattori è stata abilitata con successo",
      });
    } catch (error) {
      toast({
        title: "Verifica fallita",
        description: "Il codice inserito non è corretto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, this would disable 2FA on the server
      setIs2FAEnabled(false);
      setShowDisableDialog(false);
      onClose();

      toast({
        title: "2FA Disabilitato",
        description: "L'autenticazione a due fattori è stata disabilitata",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile disabilitare l'autenticazione a due fattori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "secret" | "backup") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "secret") {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
      toast({
        title: "Copiato",
        description: "Testo copiato negli appunti",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "larp-manager-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Autenticazione a Due Fattori
            </DialogTitle>
            <DialogDescription>
              {is2FAEnabled
                ? "Gestisci le impostazioni dell'autenticazione a due fattori"
                : "Proteggi il tuo account con un ulteriore livello di sicurezza"}
            </DialogDescription>
          </DialogHeader>

          {is2FAEnabled ? (
            // 2FA is enabled - show management options
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">2FA Abilitato</p>
                    <p className="text-sm text-green-600">
                      Il tuo account è protetto
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Attivo
                </Badge>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBackupDialog(true)}
                  className="w-full justify-start"
                >
                  <Key className="h-4 w-4 mr-3" />
                  Visualizza Codici di Backup
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDisableDialog(true)}
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Disabilita 2FA
                </Button>
              </div>
            </div>
          ) : (
            // 2FA setup flow
            <div className="space-y-4">
              {step === "setup" && (
                <>
                  {qrCodeUrl ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="bg-white border-2 border-dashed border-border rounded-lg p-4 mb-4">
                          <QrCode className="h-32 w-32 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Scansiona questo QR code con la tua app
                            authenticator
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Oppure inserisci manualmente questa chiave:
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={secretKey}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(secretKey, "secret")}
                          >
                            {copiedSecret ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Inserisci il codice di verifica:
                        </label>
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep("setup");
                            setQrCodeUrl("");
                            setSecretKey("");
                            setVerificationCode("");
                          }}
                          className="flex-1"
                        >
                          Annulla
                        </Button>
                        <Button
                          onClick={verify2FA}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="flex-1 fantasy-button"
                        >
                          {isLoading ? "Verifica..." : "Verifica"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <Smartphone className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-medium text-blue-800 mb-2">
                          Proteggi il tuo account
                        </h3>
                        <p className="text-sm text-blue-600">
                          L'autenticazione a due fattori aggiunge un ulteriore
                          livello di sicurezza richiedendo un codice dal tuo
                          telefono oltre alla password.
                        </p>
                      </div>

                      <Button
                        onClick={enable2FA}
                        disabled={isLoading}
                        className="w-full fantasy-button"
                      >
                        {isLoading ? "Configurazione..." : "Abilita 2FA"}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {step === "backup" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Check className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-medium mb-2">2FA Configurato!</h3>
                    <p className="text-sm text-muted-foreground">
                      Salva questi codici di backup in un posto sicuro
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            Importante!
                          </p>
                          <p className="text-sm text-yellow-700">
                            Questi codici ti permetteranno di accedere se perdi
                            il tuo dispositivo. Conservali in un posto sicuro.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-center">
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(backupCodes.join("\n"), "backup")
                        }
                        className="flex-1"
                      >
                        {copiedBackup ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copia
                      </Button>
                      <Button
                        variant="outline"
                        onClick={downloadBackupCodes}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Scarica
                      </Button>
                    </div>

                    <Button onClick={onClose} className="w-full fantasy-button">
                      Completato
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Codici di Backup</DialogTitle>
            <DialogDescription>
              Usa questi codici se non hai accesso al tuo dispositivo
              authenticator
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="text-center">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(backupCodes.join("\n"), "backup")
                }
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copia
              </Button>
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowBackupDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disabilita 2FA</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler disabilitare l'autenticazione a due fattori?
              Questo renderà il tuo account meno sicuro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={disable2FA}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Disattivazione..." : "Disabilita 2FA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
