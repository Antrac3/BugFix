import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Archive,
  Star,
  Clock,
  User,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaccia per le notifiche
interface Notification {
  id: number;
  type: "message" | "session" | "alert" | "update" | "approval";
  title: string;
  content: string;
  sender: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  actionRequired: boolean;
  relatedData?: any;
}

// Real notifications will be loaded from useApp

// Impostazioni notifiche
interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  messageAlerts: boolean;
  approvalAlerts: boolean;
  systemAlerts: boolean;
  reminderTiming: string;
}

export default function Notifications() {
  const { notifications: realNotifications } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>(
    realNotifications || [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    messageAlerts: true,
    approvalAlerts: true,
    systemAlerts: true,
    reminderTiming: "1h",
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "urgent",
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sender.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "unread") return matchesSearch && !notification.read;
    if (selectedTab === "urgent")
      return matchesSearch && notification.priority === "urgent";
    if (selectedTab === "actions")
      return matchesSearch && notification.actionRequired;

    return matchesSearch;
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "session":
        return <Calendar className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "update":
        return <Bell className="h-4 w-4" />;
      case "approval":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Ora";
    if (diffInHours < 24) return `${diffInHours}h fa`;
    return `${Math.floor(diffInHours / 24)}gg fa`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Bell className="h-8 w-8 text-fantasy-primary" />
              <span>Notifiche</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci le tue notifiche e rimani aggiornato sulle attività del
              LARP
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Segna Tutte Come Lette
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Impostazioni
            </Button>
          </div>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totali</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Non Lette</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgenti</p>
                  <p className="text-2xl font-bold text-red-600">
                    {urgentCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Azioni Richieste
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter((n) => n.actionRequired).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impostazioni Notifiche */}
        {showSettings && (
          <Card className="fantasy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Impostazioni Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Canali di Notifica</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="email-notifications">
                        Notifiche Email
                      </label>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="push-notifications">Notifiche Push</label>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Tipi di Notifica</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="session-reminders">
                        Promemoria Sessioni
                      </label>
                      <Switch
                        id="session-reminders"
                        checked={settings.sessionReminders}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            sessionReminders: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="message-alerts">Alert Messaggi</label>
                      <Switch
                        id="message-alerts"
                        checked={settings.messageAlerts}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            messageAlerts: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="approval-alerts">
                        Alert Approvazioni
                      </label>
                      <Switch
                        id="approval-alerts"
                        checked={settings.approvalAlerts}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            approvalAlerts: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="system-alerts">Alert Sistema</label>
                      <Switch
                        id="system-alerts"
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            systemAlerts: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtri e Ricerca */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca notifiche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">Tutte</TabsTrigger>
                  <TabsTrigger value="unread">Non Lette</TabsTrigger>
                  <TabsTrigger value="urgent">Urgenti</TabsTrigger>
                  <TabsTrigger value="actions">Azioni</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Lista Notifiche */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`fantasy-card transition-all ${
                !notification.read
                  ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        notification.type === "alert"
                          ? "bg-red-100"
                          : notification.type === "session"
                            ? "bg-blue-100"
                            : notification.type === "message"
                              ? "bg-green-100"
                              : notification.type === "update"
                                ? "bg-yellow-100"
                                : "bg-purple-100"
                      }`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <Badge
                          className={getPriorityColor(notification.priority)}
                        >
                          {notification.priority}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Azione Richiesta
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">
                        {notification.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notification.sender}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {!notification.read && (
                        <DropdownMenuItem
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Segna Come Letta
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Aggiungi ai Preferiti
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archivia
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <Card className="fantasy-card">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessuna notifica trovata
              </h3>
              <p className="text-muted-foreground">
                Non ci sono notifiche che corrispondono ai criteri selezionati.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
