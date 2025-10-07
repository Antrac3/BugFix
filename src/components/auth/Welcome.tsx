import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Sword,
  Users,
  Crown,
  Shield,
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface WelcomeProps {
  onComplete: () => void;
}

export function Welcome({ onComplete }: WelcomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-8 w-8" />;
      case "gm":
        return <Crown className="h-8 w-8" />;
      case "player":
        return <Users className="h-8 w-8" />;
      default:
        return <Users className="h-8 w-8" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "gm":
        return "from-purple-500 to-purple-600";
      case "player":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Hai accesso completo a tutte le funzionalità del sistema, incluso il pannello amministrativo e la gestione utenti.";
      case "gm":
        return "Puoi gestire campagne, personaggi, sessioni e tutti gli aspetti narrativi del LARP. Hai accesso agli strumenti di Game Master.";
      case "player":
        return "Puoi gestire i tuoi personaggi, partecipare alle sessioni e interagire con altri giocatori tramite il sistema di messaggi.";
      default:
        return "";
    }
  };

  const getQuickActions = (role: string) => {
    const common = [
      { name: "Leggi le Regole", href: "/rules", icon: BookOpen },
    ];

    switch (role) {
      case "super_admin":
        return [
          { name: "Pannello Admin", href: "/director", icon: Shield },
          { name: "Gestisci Utenti", href: "/user-management", icon: Users },
          { name: "Vai alle Impostazioni", href: "/settings", icon: Settings },
          ...common,
        ];
      case "admin":
        return [
          { name: "Pannello Admin", href: "/director", icon: Shield },
          { name: "Gestisci Utenti", href: "/players", icon: Users },
          ...common,
        ];
      case "gm":
        return [
          { name: "Gestisci Personaggi", href: "/characters", icon: Sword },
          { name: "Crea PNG", href: "/npcs", icon: Crown },
          { name: "Messaggi", href: "/messages", icon: MessageSquare },
          ...common,
        ];
      case "player":
        return [
          { name: "I Miei Personaggi", href: "/characters", icon: Sword },
          { name: "Messaggi", href: "/messages", icon: MessageSquare },
          ...common,
        ];
      default:
        return common;
    }
  };

  const steps = [
    {
      title: `Benvenuto, ${user.first_name}!`,
      content: (
        <div className="text-center space-y-6">
          <div
            className={`w-20 h-20 bg-gradient-to-r ${getRoleColor(user.role)} rounded-full flex items-center justify-center mx-auto text-white`}
          >
            {getRoleIcon(user.role)}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Account Creato con Successo!
            </h2>
            <div className="text-muted-foreground">
              Il tuo account è stato configurato con il ruolo di{" "}
              <Badge className="mx-1">
                {user.role === "gm"
                  ? "Game Master"
                  : user.role === "admin"
                    ? "Amministratore"
                    : "Giocatore"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {getRoleDescription(user.role)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-blue-800 mb-1">
                  Cosa puoi fare ora:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✨ Esplorare il sistema di gestione LARP</li>
                  <li>📖 Leggere il regolamento e le linee guida</li>
                  <li>⚙️ Personalizzare le tue impostazioni</li>
                  {user.role !== "player" && (
                    <li>👥 Gestire giocatori e personaggi</li>
                  )}
                  {(user.role === "gm" || user.role === "admin") && (
                    <li>📚 Creare e gestire trame narrative</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Azioni Rapide",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Inizia da Qui
            </h3>
            <p className="text-muted-foreground">
              Ecco alcune azioni che potresti voler fare per iniziare:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {getQuickActions(user.role).map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate(action.href)}
              >
                <action.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.name}</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-amber-800 mb-1">Suggerimento:</p>
                <p className="text-sm text-amber-700">
                  Puoi sempre accedere a queste funzioni tramite la barra
                  laterale di navigazione. Il tuo ruolo determina le sezioni
                  visibili nel menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipWelcome = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-fantasy-primary"
                      : index < currentStep
                        ? "bg-fantasy-primary/50"
                        : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {steps[currentStep].content}

          <div className="flex justify-between pt-6 border-t">
            <Button variant="ghost" onClick={skipWelcome}>
              Salta Tour
            </Button>
            <div className="space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Indietro
                </Button>
              )}
              <Button onClick={nextStep} className="fantasy-button">
                {currentStep === steps.length - 1 ? "Inizia!" : "Avanti"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
