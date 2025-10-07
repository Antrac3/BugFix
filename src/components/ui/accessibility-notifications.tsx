import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  X,
  Keyboard,
  Eye,
  Volume2,
  Zap,
} from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface AccessibilityTip {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "keyboard" | "visual" | "motion" | "interaction";
  condition?: () => boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const accessibilityTips: AccessibilityTip[] = [
  {
    id: "keyboard-navigation",
    title: "Navigazione da Tastiera",
    description:
      "Usa Tab per navigare, Invio per attivare, Escape per chiudere dialoghi e frecce per muoverti nelle liste.",
    icon: <Keyboard className="h-4 w-4" />,
    category: "keyboard",
    condition: () => true,
  },
  {
    id: "high-contrast",
    title: "Alto Contrasto Disponibile",
    description:
      "Attiva l'alto contrasto per migliorare la leggibilità se hai difficoltà visive.",
    icon: <Eye className="h-4 w-4" />,
    category: "visual",
    condition: () =>
      window.matchMedia("(prefers-contrast: high)").matches ||
      localStorage
        .getItem("accessibility-settings")
        ?.includes('"contrast":"normal"'),
  },
  {
    id: "reduced-motion",
    title: "Riduci Animazioni",
    description:
      "Se le animazioni ti causano disagio, puoi disabilitarle nelle impostazioni di accessibilità.",
    icon: <Zap className="h-4 w-4" />,
    category: "motion",
    condition: () =>
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  },
  {
    id: "screen-reader",
    title: "Supporto Screen Reader",
    description:
      "L'app è ottimizzata per lettori di schermo. Attiva la modalità dedicata per un'esperienza migliorata.",
    icon: <Volume2 className="h-4 w-4" />,
    category: "interaction",
    condition: () => true,
  },
  {
    id: "font-size",
    title: "Dimensione Testo",
    description:
      "Puoi aumentare la dimensione del testo per migliorare la leggibilità.",
    icon: <Eye className="h-4 w-4" />,
    category: "visual",
    condition: () => true,
  },
];

export function AccessibilityNotifications() {
  const { settings, updateSettings } = useAccessibility();
  const [dismissedTips, setDismissedTips] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("dismissed-accessibility-tips") || "[]",
      );
    } catch {
      return [];
    }
  });
  const [showTips, setShowTips] = useState(false);

  // Check if user might benefit from accessibility features
  useEffect(() => {
    const checkAccessibilityNeeds = () => {
      const hasAccessibilityPreferences =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(prefers-contrast: high)").matches ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const hasCustomSettings = localStorage.getItem("accessibility-settings");

      // Show tips if user hasn't seen them and might benefit
      if (!hasCustomSettings && hasAccessibilityPreferences) {
        setTimeout(() => setShowTips(true), 2000);
      }
    };

    checkAccessibilityNeeds();
  }, []);

  const availableTips = accessibilityTips.filter(
    (tip) =>
      !dismissedTips.includes(tip.id) &&
      (tip.condition ? tip.condition() : true),
  );

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(newDismissed);
    localStorage.setItem(
      "dismissed-accessibility-tips",
      JSON.stringify(newDismissed),
    );

    if (availableTips.length <= 1) {
      setShowTips(false);
    }
  };

  const dismissAllTips = () => {
    const allTipIds = accessibilityTips.map((tip) => tip.id);
    setDismissedTips(allTipIds);
    localStorage.setItem(
      "dismissed-accessibility-tips",
      JSON.stringify(allTipIds),
    );
    setShowTips(false);
  };

  if (!showTips || availableTips.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw]">
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-sm">
                Suggerimenti Accessibilità
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAllTips}
              className="h-6 w-6 p-0"
              aria-label="Chiudi tutti i suggerimenti"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-3">
            {availableTips.slice(0, 2).map((tip) => (
              <div
                key={tip.id}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium">{tip.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tip.description}
                    </p>
                    {tip.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={tip.action.onClick}
                        className="mt-2 h-6 text-xs"
                      >
                        {tip.action.label}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissTip(tip.id)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                    aria-label={`Dismissi suggerimento: ${tip.title}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {availableTips.length > 2 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                +{availableTips.length - 2} altri suggerimenti disponibili
              </p>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTips(false)}
              className="h-7 text-xs"
            >
              Nascondi per ora
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Open accessibility settings
                window.dispatchEvent(
                  new CustomEvent("open-accessibility-settings"),
                );
              }}
              className="h-7 text-xs"
            >
              Impostazioni
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Progress indicator for accessibility setup
export function AccessibilityProgress() {
  const { settings } = useAccessibility();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      let completedSteps = 0;
      const totalSteps = 5;

      // Check what user has configured
      if (settings.fontSize !== "medium") completedSteps++;
      if (settings.contrast === "high") completedSteps++;
      if (settings.reducedMotion) completedSteps++;
      if (settings.theme !== "auto") completedSteps++;
      if (settings.keyboardNavigation) completedSteps++;

      setProgress((completedSteps / totalSteps) * 100);
    };

    calculateProgress();
  }, [settings]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <Card className="px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div className="text-sm">
            <span className="font-medium">Accessibilità: </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% configurata
            </span>
          </div>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Quick accessibility actions for common tasks
export function QuickAccessibilityActions() {
  const { settings, updateSettings } = useAccessibility();

  const actions = [
    {
      id: "toggle-high-contrast",
      label:
        settings.contrast === "high" ? "Contrasto Normale" : "Alto Contrasto",
      icon: <Eye className="h-3 w-3" />,
      action: () =>
        updateSettings({
          contrast: settings.contrast === "high" ? "normal" : "high",
        }),
      active: settings.contrast === "high",
    },
    {
      id: "toggle-reduced-motion",
      label: settings.reducedMotion
        ? "Abilita Animazioni"
        : "Riduci Animazioni",
      icon: <Zap className="h-3 w-3" />,
      action: () => updateSettings({ reducedMotion: !settings.reducedMotion }),
      active: settings.reducedMotion,
    },
    {
      id: "increase-font-size",
      label: "Testo Grande",
      icon: <Eye className="h-3 w-3" />,
      action: () => {
        const sizes: Array<typeof settings.fontSize> = [
          "small",
          "medium",
          "large",
          "xl",
        ];
        const currentIndex = sizes.indexOf(settings.fontSize);
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
        updateSettings({ fontSize: sizes[nextIndex] });
      },
      active: settings.fontSize !== "medium",
    },
  ];

  return (
    <div className="flex items-center space-x-1">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.active ? "default" : "ghost"}
          size="sm"
          onClick={action.action}
          className="h-7 px-2 text-xs"
          title={action.label}
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
