import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cookie, Settings, Shield, Eye, Target, Zap } from "lucide-react";
import { usePrivacyContext } from "@/contexts/PrivacyContext";

export function CookieConsentBanner() {
  const { showBanner, consent, acceptAll, acceptNecessary, updateConsent } =
    usePrivacyContext();
  const [showSettings, setShowSettings] = useState(false);
  const [tempConsent, setTempConsent] = useState(consent);

  if (!showBanner) return null;

  const handleSaveSettings = () => {
    updateConsent(tempConsent);
    setShowSettings(false);
  };

  const cookieTypes = [
    {
      key: "necessary" as const,
      title: "Cookie Necessari",
      description: "Essenziali per il funzionamento dell'applicazione",
      icon: Shield,
      required: true,
      examples: ["Autenticazione", "Sicurezza", "Preferenze di base"],
    },
    {
      key: "functional" as const,
      title: "Cookie Funzionali",
      description: "Migliorano l'esperienza utente",
      icon: Zap,
      required: false,
      examples: ["Preferenze UI", "Linguaggio", "Temi"],
    },
    {
      key: "analytics" as const,
      title: "Cookie Analitici",
      description: "Ci aiutano a migliorare l'applicazione",
      icon: Eye,
      required: false,
      examples: ["Google Analytics", "Performance monitoring"],
    },
    {
      key: "marketing" as const,
      title: "Cookie Marketing",
      description: "Per comunicazioni personalizzate",
      icon: Target,
      required: false,
      examples: ["Email marketing", "Retargeting"],
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-xl border-2 border-fantasy-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-fantasy-primary">
            <Cookie className="h-5 w-5" />
            Privacy e Cookie
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Utilizziamo cookie per migliorare la tua esperienza. Gestisci le tue
            preferenze o accetta tutti i cookie per continuare.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={acceptNecessary}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Solo Necessari
            </Button>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizza
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-fantasy-primary" />
                    Impostazioni Privacy
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-4">
                      Personalizza le tue preferenze sui cookie. Puoi modificare
                      queste impostazioni in qualsiasi momento dalle
                      impostazioni del profilo.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cookieTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Card key={type.key} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-fantasy-primary/10">
                                  <IconComponent className="h-4 w-4 text-fantasy-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {type.title}
                                    {type.required && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Richiesto
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {type.description}
                                  </p>
                                </div>
                              </div>

                              <div className="ml-11">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Esempi:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {type.examples.map((example, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {example}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <Switch
                              checked={tempConsent[type.key]}
                              onCheckedChange={(checked) => {
                                if (!type.required) {
                                  setTempConsent((prev) => ({
                                    ...prev,
                                    [type.key]: checked,
                                  }));
                                }
                              }}
                              disabled={type.required}
                              className="ml-4"
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveSettings} className="flex-1">
                      Salva Preferenze
                    </Button>
                    <Button
                      onClick={() => {
                        setTempConsent({
                          necessary: true,
                          analytics: true,
                          marketing: true,
                          functional: true,
                          lastUpdated: new Date().toISOString(),
                          version: "1.0",
                        });
                        handleSaveSettings();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Accetta Tutti
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={acceptAll}
              className="flex-1 bg-fantasy-primary hover:bg-fantasy-primary/90"
            >
              Accetta Tutti
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Consultando la nostra{" "}
            <button
              className="underline hover:text-fantasy-primary"
              onClick={() => window.open("/privacy-policy", "_blank")}
            >
              Privacy Policy
            </button>{" "}
            per maggiori dettagli.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
