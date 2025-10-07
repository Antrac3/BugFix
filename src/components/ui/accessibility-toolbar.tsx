import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accessibility,
  Eye,
  Type,
  Palette,
  Zap,
  Settings,
  Volume2,
  Moon,
  Sun,
  Monitor,
  RotateCcw,
} from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface AccessibilityToolbarProps {
  position?: "top" | "bottom" | "floating";
  compact?: boolean;
  className?: string;
}

export function AccessibilityToolbar({
  position = "top",
  compact = false,
  className,
}: AccessibilityToolbarProps) {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const quickActions = [
    {
      icon: Type,
      label: "Dimensione testo",
      action: () => {
        const sizes: Array<typeof settings.fontSize> = [
          "small",
          "medium",
          "large",
          "xl",
        ];
        const currentIndex = sizes.indexOf(settings.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        updateSettings({ fontSize: sizes[nextIndex] });
      },
      isActive: settings.fontSize !== "medium",
    },
    {
      icon: Eye,
      label: "Alto contrasto",
      action: () =>
        updateSettings({
          contrast: settings.contrast === "high" ? "normal" : "high",
        }),
      isActive: settings.contrast === "high",
    },
    {
      icon: Zap,
      label: "Riduci animazioni",
      action: () => updateSettings({ reducedMotion: !settings.reducedMotion }),
      isActive: settings.reducedMotion,
    },
    {
      icon: settings.theme === "dark" ? Sun : Moon,
      label: "Cambia tema",
      action: () =>
        updateSettings({
          theme: settings.theme === "dark" ? "light" : "dark",
        }),
      isActive: settings.theme === "dark",
    },
  ];

  if (compact) {
    return (
      <div
        className={cn(
          "fixed z-50 flex items-center space-x-1 p-2 bg-background/95 backdrop-blur border rounded-lg shadow-lg",
          position === "top" && "top-4 right-4",
          position === "bottom" && "bottom-4 right-4",
          position === "floating" && "top-1/2 right-4 -translate-y-1/2",
          className,
        )}
        role="toolbar"
        aria-label="Strumenti di accessibilità"
      >
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={action.action}
            className={cn(
              "h-8 w-8",
              action.isActive && "bg-fantasy-primary text-white",
            )}
            title={action.label}
            aria-pressed={action.isActive}
          >
            <action.icon className="h-4 w-4" />
            <span className="sr-only">{action.label}</span>
          </Button>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Impostazioni avanzate"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Impostazioni avanzate</span>
            </Button>
          </DialogTrigger>
          <AccessibilitySettingsDialog />
        </Dialog>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-muted/50 border-b",
        className,
      )}
      role="banner"
      aria-label="Barra degli strumenti di accessibilità"
    >
      <div className="flex items-center space-x-2">
        <Accessibility className="h-5 w-5 text-fantasy-primary" />
        <span className="text-sm font-medium">Accessibilità</span>
      </div>

      <div className="flex items-center space-x-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.isActive ? "default" : "outline"}
            size="sm"
            onClick={action.action}
            className="h-8 text-xs"
            aria-pressed={action.isActive}
          >
            <action.icon className="h-3 w-3 mr-1" />
            {action.label}
          </Button>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Avanzate
            </Button>
          </DialogTrigger>
          <AccessibilitySettingsDialog />
        </Dialog>
      </div>
    </div>
  );
}

function AccessibilitySettingsDialog() {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Accessibility className="h-5 w-5" />
          <span>Impostazioni Accessibilità</span>
        </DialogTitle>
        <DialogDescription>
          Personalizza l'interfaccia per migliorare la tua esperienza d'uso
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Visual Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Impostazioni Visive</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dimensione Testo</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value: typeof settings.fontSize) =>
                  updateSettings({ fontSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Piccolo</SelectItem>
                  <SelectItem value="medium">Normale</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="xl">Molto Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">Alto Contrasto</Label>
              <Switch
                id="high-contrast"
                checked={settings.contrast === "high"}
                onCheckedChange={(checked) =>
                  updateSettings({ contrast: checked ? "high" : "normal" })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tema</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: typeof settings.theme) =>
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Chiaro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Scuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>Automatico</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode">Modalità Compatta</Label>
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) =>
                  updateSettings({ compactMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Motion & Interaction */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Movimento e Interazione</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-motion">Riduci Animazioni</Label>
                <p className="text-xs text-muted-foreground">
                  Riduce movimenti e transizioni
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) =>
                  updateSettings({ reducedMotion: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="keyboard-nav">Navigazione da Tastiera</Label>
                <p className="text-xs text-muted-foreground">
                  Abilita controlli avanzati da tastiera
                </p>
              </div>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) =>
                  updateSettings({ keyboardNavigation: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Indicatore di Focus</Label>
              <Select
                value={settings.focusIndicator}
                onValueChange={(value: typeof settings.focusIndicator) =>
                  updateSettings({ focusIndicator: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standard</SelectItem>
                  <SelectItem value="enhanced">Migliorato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Screen Reader Support */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Supporto Screen Reader</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="screen-reader">Modalità Screen Reader</Label>
                <p className="text-xs text-muted-foreground">
                  Ottimizza l'interfaccia per lettori di schermo
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) =>
                  updateSettings({ screenReader: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ripristina Predefinite</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Hook to show accessibility toolbar based on user preferences
export function useAccessibilityToolbar() {
  const [showToolbar, setShowToolbar] = useState(() => {
    try {
      return localStorage.getItem("show-accessibility-toolbar") === "true";
    } catch {
      return false;
    }
  });

  const toggleToolbar = () => {
    const newValue = !showToolbar;
    setShowToolbar(newValue);
    localStorage.setItem("show-accessibility-toolbar", newValue.toString());
  };

  return { showToolbar, toggleToolbar };
}
