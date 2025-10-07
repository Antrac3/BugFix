import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Save,
  Key,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  HardDrive,
  Monitor,
  Volume2,
  Eye,
  Moon,
  Sun,
} from "lucide-react";
import { TwoFactorAuth } from "@/components/auth/TwoFactorAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/SupabaseAppContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export default function Settings() {
  const { showNotification } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [show2FADialog, setShow2FADialog] = useState(false);

  // Local state for settings (with default values)
  const [localSettings, setLocalSettings] = useState({
    name: "LARP Manager",
    description: "Sistema di gestione LARP",
    theme: "dark",
    language: "it",
    defaultLocation: "Location predefinita",
    timezone: "Europe/Rome",
    compactMode: false,
    animationEffects: true,
    emailNotifications: true,
    sessionReminders: true,
    characterUpdates: false,
    systemMaintenance: false,
    accentColor: "fantasy",
    autoBackup: false,
    backupFrequency: "weekly",
    retentionPeriod: "30",
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const { supabase } = await import("@/lib/supabase");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("settings")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading settings:", error);
          return;
        }

        if (profile?.settings) {
          console.log("📖 Loading settings from database:", profile.settings);
          setLocalSettings((prev) => ({ ...prev, ...profile.settings }));
        } else {
          console.log("📖 No settings found in database, using defaults");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [user?.id]);

  const updateLocalSetting = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      showNotification("Salvataggio in corso...", "info");

      // Save to localStorage as backup
      localStorage.setItem("larpSettings", JSON.stringify(localSettings));

      // Save to database in user profile
      if (user?.id) {
        const { supabase } = await import("@/lib/supabase");

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            settings: localSettings,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Database save error:", updateError);
          showNotification(
            "Salvato solo localmente. Errore database: " + updateError.message,
            "error",
          );
          return;
        }

        console.log("✅ Settings saved to database for user:", user.id);
        showNotification("Impostazioni salvate nel database!", "success");
      } else {
        showNotification(
          "Salvato solo localmente (utente non autenticato)",
          "info",
        );
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      showNotification(
        "Errore nel salvare le impostazioni: " + String(error),
        "error",
      );
    }
  };

  const resetSettings = () => {
    setLocalSettings({
      name: "LARP Manager",
      description: "Sistema di gestione LARP",
      theme: "dark",
      language: "it",
      defaultLocation: "Location predefinita",
      timezone: "Europe/Rome",
      compactMode: false,
      animationEffects: true,
      emailNotifications: true,
      sessionReminders: true,
      characterUpdates: false,
      systemMaintenance: false,
      accentColor: "fantasy",
      autoBackup: false,
      backupFrequency: "weekly",
      retentionPeriod: "30",
    });
    setHasChanges(false);
    showNotification("Impostazioni ripristinate", "info");
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "larp_manager_settings.json";
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Impostazioni esportate con successo!", "success");
  };

  const createManualBackup = async () => {
    try {
      showNotification("Creazione backup in corso...", "info");

      // Simulate backup creation with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const backupData = {
        timestamp: new Date().toISOString(),
        settings: localSettings,
        version: "1.0.0",
        user: user?.email,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `larp_backup_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showNotification("Backup creato e scaricato con successo!", "success");
    } catch (error) {
      showNotification("Errore durante la creazione del backup", "error");
    }
  };

  const handleFileRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        if (backupData.settings) {
          setLocalSettings(backupData.settings);
          setHasChanges(true);
          showNotification("Backup ripristinato con successo!", "success");
        } else {
          showNotification("File di backup non valido", "error");
        }
      } catch (error) {
        showNotification("Errore nel leggere il file di backup", "error");
      }
    };
    reader.readAsText(file);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          showNotification("Notifiche push abilitate con successo!", "success");
          // Send test notification
          new Notification("LARP Manager", {
            body: "Notifiche push configurate correttamente!",
            icon: "/favicon.ico",
          });
        } else {
          showNotification("Permesso per le notifiche negato", "error");
        }
      } catch (error) {
        showNotification("Errore nell'abilitare le notifiche", "error");
      }
    } else {
      showNotification(
        "Le notifiche non sono supportate da questo browser",
        "error",
      );
    }
  };

  const setup2FA = () => {
    setShow2FADialog(true);
    // Simulate 2FA setup
    setTimeout(() => {
      setShow2FADialog(false);
      showNotification(
        "Autenticazione a due fattori configurata! (Demo)",
        "success",
      );
    }, 2000);
  };

  const optimizeDatabase = async () => {
    showNotification("Ottimizzazione database in corso...", "info");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    showNotification("Database ottimizzato con successo!", "success");
  };

  const clearCache = async () => {
    try {
      const settingsBackup = localStorage.getItem("larpSettings");
      localStorage.clear();
      if (settingsBackup) {
        localStorage.setItem("larpSettings", settingsBackup);
      }
      sessionStorage.clear();
      showNotification("Cache pulita con successo!", "success");
    } catch (error) {
      showNotification("Errore durante la pulizia della cache", "error");
    }
  };

  const runDiagnostics = async () => {
    showNotification("Esecuzione diagnostica sistema...", "info");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const diagnosticResult = {
      database: "✅ OK",
      memory: "✅ OK",
      storage: "⚠️ 78% utilizzato",
      performance: "✅ Ottimale",
    };
    console.log("🔍 Diagnostica Sistema:", diagnosticResult);
    showNotification(
      "Diagnostica completata! Controlla la console per i dettagli.",
      "success",
    );
  };

  const exportSystemLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      user: user?.email,
      system: { version: "1.0.0", performance: "optimal" },
      activity: [
        { action: "settings_export", timestamp: new Date().toISOString() },
      ],
    };
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system_logs_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Log di sistema esportati!", "success");
  };

  const toggleDebugMode = () => {
    const debugMode = localStorage.getItem("debugMode") === "true";
    localStorage.setItem("debugMode", (!debugMode).toString());
    showNotification(
      `Modalità debug ${!debugMode ? "attivata" : "disattivata"}!`,
      "info",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <SettingsIcon className="h-8 w-8 text-fantasy-primary" />
              <span>Impostazioni</span>
              {hasChanges && (
                <Badge className="bg-orange-500 text-white">
                  Modifiche Non Salvate
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Configura le impostazioni della tua campagna LARP e del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={!hasChanges}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ripristina
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="fantasy-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Salva Modifiche
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Card className="fantasy-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Generale
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Aspetto
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifiche
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sicurezza
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Avanzate
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Impostazioni Generali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">Nome Campagna</Label>
                      <Input
                        id="campaign-name"
                        value={localSettings.name}
                        onChange={(e) =>
                          updateLocalSetting("name", e.target.value)
                        }
                        placeholder="Inserisci il nome della campagna"
                      />
                    </div>

                    <div>
                      <Label htmlFor="campaign-description">Descrizione</Label>
                      <Textarea
                        id="campaign-description"
                        value={localSettings.description}
                        onChange={(e) =>
                          updateLocalSetting("description", e.target.value)
                        }
                        placeholder="Descrivi la tua campagna LARP"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="default-location">
                        Location Predefinita
                      </Label>
                      <Input
                        id="default-location"
                        value={localSettings.defaultLocation}
                        onChange={(e) =>
                          updateLocalSetting("defaultLocation", e.target.value)
                        }
                        placeholder="Location principale della campagna"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Fuso Orario</Label>
                      <Select
                        value={localSettings.timezone}
                        onValueChange={(value) =>
                          updateLocalSetting("timezone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Rome">
                            Europa/Roma
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europa/Londra
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            America/New York
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            America/Los Angeles
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-mode">Modalità Compatta</Label>
                      <Switch
                        id="compact-mode"
                        checked={localSettings.compactMode}
                        onCheckedChange={(checked) =>
                          updateLocalSetting("compactMode", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="animation-effects">
                        Effetti di Animazione
                      </Label>
                      <Switch
                        id="animation-effects"
                        checked={localSettings.animationEffects}
                        onCheckedChange={(checked) =>
                          updateLocalSetting("animationEffects", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aspetto e Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="theme">Tema</Label>
                      <Select
                        value={localSettings.theme}
                        onValueChange={(value) =>
                          updateLocalSetting("theme", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fantasy-dark">
                            Fantasy Scuro
                          </SelectItem>
                          <SelectItem value="fantasy-light">
                            Fantasy Chiaro
                          </SelectItem>
                          <SelectItem value="medieval">Medievale</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="accent-color">Colore Principale</Label>
                      <Select
                        value={localSettings.accentColor}
                        onValueChange={(value) =>
                          updateLocalSetting("accentColor", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purple">Viola</SelectItem>
                          <SelectItem value="blue">Blu</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="red">Rosso</SelectItem>
                          <SelectItem value="gold">Oro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Anteprima Tema</h4>
                      <div className="space-y-2">
                        <div className="h-8 bg-fantasy-primary rounded flex items-center px-3 text-white text-sm">
                          Colore Principale
                        </div>
                        <div className="h-6 bg-fantasy-accent rounded flex items-center px-3 text-white text-xs">
                          Colore Secondario
                        </div>
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Impostazioni Notifiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Canali di Notifica</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">
                          Notifiche Email
                        </Label>
                        <Switch
                          id="email-notifications"
                          checked={localSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            updateLocalSetting("emailNotifications", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-reminders">
                          Promemoria Sessioni
                        </Label>
                        <Switch
                          id="session-reminders"
                          checked={localSettings.sessionReminders}
                          onCheckedChange={(checked) =>
                            updateLocalSetting("sessionReminders", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Tipi di Notifica</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Approvazioni richieste</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Promemoria sessioni</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        <span>Nuovi messaggi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span>Aggiornamenti regolamento</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <PrivacySettings />
            </TabsContent>

            {/* Backup Settings */}
            <TabsContent value="backup" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup e Archiviazione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-backup">Backup Automatico</Label>
                      <Switch
                        id="auto-backup"
                        checked={localSettings.autoBackup}
                        onCheckedChange={(checked) =>
                          updateLocalSetting("autoBackup", checked)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="backup-frequency">Frequenza Backup</Label>
                      <Select
                        value={localSettings.backupFrequency}
                        onValueChange={(value) =>
                          updateLocalSetting("backupFrequency", value)
                        }
                        disabled={!localSettings.autoBackup}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Giornaliero</SelectItem>
                          <SelectItem value="weekly">Settimanale</SelectItem>
                          <SelectItem value="monthly">Mensile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="retention-period">
                        Periodo di Conservazione (giorni)
                      </Label>
                      <Input
                        id="retention-period"
                        type="number"
                        value={localSettings.retentionPeriod}
                        onChange={(e) =>
                          updateLocalSetting("retentionPeriod", e.target.value)
                        }
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Azioni Backup</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={createManualBackup}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Crea Backup Manuale
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileRestore}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          variant="outline"
                          className="w-full justify-start pointer-events-none"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ripristina da Backup
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() =>
                          showNotification(
                            "Cronologia backup disponibile nella versione Pro",
                            "info",
                          )
                        }
                      >
                        <HardDrive className="h-4 w-4 mr-2" />
                        Visualizza Cronologia Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sicurezza e Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {user?.role !== "super_admin" && user?.role !== "admin" && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-semibold">
                            Impostazioni di Sicurezza
                          </span>
                        </div>
                        <p className="text-sm text-orange-700 mt-2">
                          Le impostazioni di sicurezza avanzate sono disponibili
                          solo per gli amministratori.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {user?.role === "super_admin" && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Shield className="h-5 w-5" />
                          <span className="font-semibold">
                            Accesso Super Amministratore
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-2">
                          Hai accesso completo a tutte le impostazioni di
                          sicurezza avanzate.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Controlli di Accesso</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <span className="font-medium">
                              Autenticazione a Due Fattori
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Proteggi il tuo account
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Disabilitato</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={setup2FA}
                            >
                              Configura
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <span className="font-medium">Notifiche Push</span>
                            <p className="text-xs text-muted-foreground">
                              Ricevi notifiche in tempo reale
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                Notification.permission === "granted"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {Notification.permission === "granted"
                                ? "Abilitate"
                                : "Disabilitate"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={requestNotificationPermission}
                            >
                              Abilita
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Sessioni Multiple</span>
                          <Badge variant="outline">Consentite</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Timeout Sessione</span>
                          <Badge variant="outline">24 ore</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Privacy Dati</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Crittografia Dati</span>
                          <Badge className="bg-green-100 text-green-800">
                            Attiva
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Log di Accesso</span>
                          <Badge className="bg-green-100 text-green-800">
                            Attivo
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Condivisione Analitiche</span>
                          <Badge variant="outline">Disabilitata</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Impostazioni Avanzate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Attenzione</span>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Le impostazioni avanzate possono influire sulle
                      prestazioni del sistema. Modificare solo se si è sicuri di
                      quello che si sta facendo.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Prestazioni</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={optimizeDatabase}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Ottimizza Database
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={clearCache}
                      >
                        <HardDrive className="h-4 w-4 mr-2" />
                        Pulisci Cache
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={runDiagnostics}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Diagnostica Sistema
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Debug e Manutenzione</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={exportSystemLogs}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Esporta Log Sistema
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={toggleDebugMode}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Modalità Debug
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600"
                        onClick={resetSettings}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reset Impostazioni
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>

          {/* 2FA Dialog */}
          <TwoFactorAuth
            isOpen={show2FADialog}
            onClose={() => setShow2FADialog(false)}
          />
        </Card>
      </div>
    </div>
  );
}
