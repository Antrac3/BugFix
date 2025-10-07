import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Eye,
  Database,
  Users,
  Mail,
  Download,
  Trash2,
  FileText,
  Clock,
  Globe,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: "data-collection",
      title: "Raccolta Dati",
      icon: Database,
      content: [
        {
          subtitle: "Dati Personali",
          items: [
            "Nome e cognome",
            "Indirizzo email",
            "Informazioni di contatto",
            "Preferenze utente",
          ],
        },
        {
          subtitle: "Dati di Gioco",
          items: [
            "Personaggi LARP creati",
            "Statistiche e progressi",
            "Comunicazioni in-game",
            "Note e appunti personali",
          ],
        },
        {
          subtitle: "Dati Tecnici",
          items: [
            "Indirizzo IP",
            "Browser e dispositivo",
            "Log di accesso",
            "Cookie e storage locale",
          ],
        },
      ],
    },
    {
      id: "data-usage",
      title: "Utilizzo Dati",
      icon: Eye,
      content: [
        {
          subtitle: "Funzionalità del Servizio",
          items: [
            "Gestione account utente",
            "Salvataggio progressi di gioco",
            "Comunicazioni tra giocatori",
            "Personalizzazione esperienza",
          ],
        },
        {
          subtitle: "Miglioramento Servizio",
          items: [
            "Analisi utilizzo applicazione",
            "Ottimizzazione performance",
            "Sviluppo nuove funzionalità",
            "Supporto tecnico",
          ],
        },
      ],
    },
    {
      id: "data-sharing",
      title: "Condivisione Dati",
      icon: Users,
      content: [
        {
          subtitle: "All'interno della Piattaforma",
          items: [
            "Game Master autorizzati possono vedere dati di gioco",
            "Altri giocatori vedono solo informazioni pubbliche",
            "Comunicazioni condivise secondo le impostazioni privacy",
          ],
        },
        {
          subtitle: "Servizi Terzi",
          items: [
            "Supabase (database hosting) - solo dati necessari",
            "Servizi di autenticazione",
            "Non vendiamo mai i tuoi dati a terzi",
          ],
        },
      ],
    },
    {
      id: "user-rights",
      title: "Diritti dell'Utente",
      icon: Shield,
      content: [
        {
          subtitle: "Diritti GDPR",
          items: [
            "Accesso ai tuoi dati",
            "Correzione dati errati",
            "Cancellazione dati (diritto all'oblio)",
            "Portabilità dati",
            "Limitazione del trattamento",
          ],
        },
        {
          subtitle: "Come Esercitare i Diritti",
          items: [
            "Accedi alle impostazioni privacy nel tuo profilo",
            "Richiedi export completo dei tuoi dati",
            "Contatta il supporto per assistenza",
            "Cancella il tuo account e tutti i dati associati",
          ],
        },
      ],
    },
    {
      id: "data-security",
      title: "Sicurezza Dati",
      icon: Lock,
      content: [
        {
          subtitle: "Misure Tecniche",
          items: [
            "Crittografia SSL/TLS per tutte le comunicazioni",
            "Database protetto con autenticazione robusta",
            "Backup regolari e sicuri",
            "Monitoraggio accessi e anomalie",
          ],
        },
        {
          subtitle: "Misure Organizzative",
          items: [
            "Accesso limitato ai dati su base need-to-know",
            "Formazione staff su privacy e sicurezza",
            "Procedure di incident response",
            "Audit periodici di sicurezza",
          ],
        },
      ],
    },
    {
      id: "data-retention",
      title: "Conservazione Dati",
      icon: Clock,
      content: [
        {
          subtitle: "Periodi di Conservazione",
          items: [
            "Dati account: fino alla cancellazione account",
            "Dati di gioco: secondo le policy della campagna",
            "Log tecnici: 12 mesi massimo",
            "Comunicazioni: secondo le impostazioni utente",
          ],
        },
        {
          subtitle: "Cancellazione Automatica",
          items: [
            "Account inattivi oltre 2 anni",
            "Dati temporanei dopo 30 giorni",
            "Backup secondo retention policy",
            "Cookie secondo le impostazioni browser",
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-fantasy-primary flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Privacy Policy
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Come gestiamo i tuoi dati personali nel rispetto del GDPR
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Torna Indietro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Ultimo aggiornamento: {new Date().toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Versione 1.0
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Introduzione</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Benvenuto in LARP Manager. La privacy dei nostri utenti è
                fondamentale per noi. Questa Privacy Policy spiega come
                raccogliamo, utilizziamo, proteggiamo e gestiamo le tue
                informazioni personali in conformità al Regolamento Generale
                sulla Protezione dei Dati (GDPR).
              </p>
              <p>
                Come piattaforma per la gestione di giochi di ruolo dal vivo
                (LARP), gestiamo dati relativi a personaggi, trame,
                comunicazioni e progressi di gioco. Ci impegniamo a trattare
                tutti i dati con la massima cura e trasparenza.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} id={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-fantasy-primary">
                    <IconComponent className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.content.map((subsection, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold mb-3">
                          {subsection.subtitle}
                        </h4>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="flex items-start gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-fantasy-primary mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-fantasy-primary" />
              Gestisci la tua Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start gap-2"
                onClick={() => navigate("/settings?tab=privacy")}
              >
                <Shield className="h-5 w-5 text-fantasy-primary" />
                <div className="text-left">
                  <div className="font-semibold">Impostazioni Privacy</div>
                  <div className="text-xs text-muted-foreground">
                    Gestisci consensi e preferenze
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start gap-2"
                onClick={() => navigate("/settings?tab=data")}
              >
                <Download className="h-5 w-5 text-fantasy-accent" />
                <div className="text-left">
                  <div className="font-semibold">Esporta Dati</div>
                  <div className="text-xs text-muted-foreground">
                    Scarica tutti i tuoi dati
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start gap-2"
                onClick={() => navigate("/settings?tab=account")}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <div className="font-semibold">Cancella Account</div>
                  <div className="text-xs text-muted-foreground">
                    Elimina tutti i tuoi dati
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-fantasy-primary" />
              Contatti per la Privacy
            </h3>
            <div className="text-muted-foreground space-y-2">
              <p>
                Per qualsiasi domanda riguardo questa Privacy Policy o per
                esercitare i tuoi diritti:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Email: privacy@larpmanager.com</li>
                <li>• Tramite le impostazioni del tuo account</li>
                <li>• Supporto in-app nella sezione Aiuto</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
