import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { usePrivacyContext } from "@/contexts/PrivacyContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PrivacySettings() {
  const { consent, updateConsent, resetConsent } = usePrivacyContext();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cookieTypes = [
    {
      key: "necessary" as const,
      title: "Cookie Necessari",
      description: "Essenziali per il funzionamento dell'applicazione",
      icon: Shield,
      required: true,
    },
    {
      key: "functional" as const,
      title: "Cookie Funzionali",
      description: "Migliorano l'esperienza utente e salvano preferenze",
      icon: Zap,
      required: false,
    },
    {
      key: "analytics" as const,
      title: "Cookie Analitici",
      description: "Ci aiutano a capire come viene utilizzata l'applicazione",
      icon: Eye,
      required: false,
    },
    {
      key: "marketing" as const,
      title: "Cookie Marketing",
      description: "Per comunicazioni personalizzate e contenuti rilevanti",
      icon: Target,
      required: false,
    },
  ];

  const handleConsentChange = (key: keyof typeof consent, value: boolean) => {
    updateConsent({ [key]: value });
    toast({
      title: "Preferenze aggiornate",
      description: `Impostazioni ${key} ${value ? "abilitate" : "disabilitate"}`,
    });
  };

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Simulate data export (in real app, this would call an API)
      const userData = {
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at,
        },
        privacy: consent,
        exportDate: new Date().toISOString(),
        format: "JSON",
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `larp-manager-data-${user.id}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dati esportati",
        description: "Il download dei tuoi dati è iniziato",
      });
    } catch (error) {
      toast({
        title: "Errore nell'esportazione",
        description:
          "Si è verificato un errore durante l'esportazione dei dati",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // In a real app, this would call a deletion API
      toast({
        title: "Richiesta ricevuta",
        description:
          "La richiesta di cancellazione è stata inviata. Riceverai una conferma via email.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description:
          "Si è verificato un errore durante la richiesta di cancellazione",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-fantasy-primary" />
            Panoramica Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Protetto</div>
              <div className="text-sm text-muted-foreground">
                I tuoi dati sono al sicuro
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">GDPR Compliant</div>
              <div className="text-sm text-muted-foreground">
                Rispettiamo i tuoi diritti
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">Consenso Aggiornato</div>
              <div className="text-sm text-muted-foreground">
                {new Date(consent.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferenze Cookie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {cookieTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.key}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-fantasy-primary/10">
                        <IconComponent className="h-4 w-4 text-fantasy-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {type.title}
                          {type.required && (
                            <Badge variant="secondary" className="text-xs">
                              Richiesto
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Switch
                    checked={consent[type.key]}
                    onCheckedChange={(checked) => {
                      if (!type.required) {
                        handleConsentChange(type.key, checked);
                      }
                    }}
                    disabled={type.required}
                    className="ml-4"
                  />
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetConsent} size="sm">
              Reset Preferenze
            </Button>
            <Button
              onClick={() => window.open("/privacy-policy", "_blank")}
              variant="outline"
              size="sm"
            >
              Leggi Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestione Dati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Export Data */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-4 w-4 text-fantasy-accent" />
                  <h4 className="font-semibold">Esporta i tuoi Dati</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scarica una copia completa di tutti i tuoi dati in formato
                  JSON
                </p>
              </div>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                {isExporting ? "Esportando..." : "Esporta"}
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-start justify-between p-4 border rounded-lg border-red-200 dark:border-red-800">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Cancella Account
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Elimina permanentemente il tuo account e tutti i dati
                  associati
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Elaborando..." : "Cancella"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Conferma Cancellazione Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Questa azione è <strong>irreversibile</strong>. Verranno
                        eliminati:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Il tuo profilo utente</li>
                        <li>Tutti i personaggi creati</li>
                        <li>Note e comunicazioni</li>
                        <li>Progressi e statistiche</li>
                        <li>Preferenze e impostazioni</li>
                      </ul>
                      <p className="font-semibold">
                        Sei sicuro di voler procedere?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sì, Cancella Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Legali</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>I tuoi diritti secondo il GDPR:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Accesso ai tuoi dati personali</li>
              <li>Correzione di dati inesatti</li>
              <li>Cancellazione dei tuoi dati (diritto all'oblio)</li>
              <li>Portabilità dei dati</li>
              <li>Limitazione del trattamento</li>
              <li>Opposizione al trattamento</li>
            </ul>
            <p className="mt-4">
              Per qualsiasi domanda o per esercitare i tuoi diritti, contatta:
              <strong> privacy@larpmanager.com</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
