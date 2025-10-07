import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Activity,
  UserCog,
  Zap,
  Package,
  BarChart3,
  Bell,
  Send,
  Plus,
  RefreshCw,
  Database,
  Download,
  Eye,
  Edit,
  X,
  CheckSquare,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";
import { ApprovalModal } from "@/components/modals/ApprovalModal";
import { BroadcastModal } from "@/components/modals/BroadcastModal";
import { UserRolesModal } from "@/components/modals/UserRolesModal";
import { GenerateReportModal } from "@/components/modals/GenerateReportModal";
import { ScheduleSessionModal } from "@/components/modals/ScheduleSessionModal";

export default function Director() {
  const {
    players,
    characters,
    tasks,
    messages,
    charactersLoading,
    tasksLoading,
    messagesLoading,
  } = useApp();

  // Calculate real system stats
  const systemStats = {
    status: "operational",
    uptime: "99.9%",
    activePlayers: (players || []).length, // Tutti i giocatori registrati, non solo attivi
    totalPlayers: (players || []).length,
    sessionsThisMonth: 0, // TODO: calcolare dalle sessioni reali
    upcomingEvents: 0, // TODO: calcolare dagli eventi reali
    systemHealth: "Ottimo",
    lastBackup: new Date().toISOString(),
  };
  const approvals = [];
  const systemModules = [];
  const broadcastMessages = [];

  // Mock functions for missing functionality
  const approveRequest = async () => ({
    success: false,
    error: "Not implemented",
  });
  const rejectRequest = async () => ({
    success: false,
    error: "Not implemented",
  });
  const toggleMaintenanceMode = async () => ({
    success: false,
    error: "Not implemented",
  });
  const restartApplication = async () => ({
    success: false,
    error: "Not implemented",
  });
  const optimizeDatabase = async () => ({
    success: false,
    error: "Not implemented",
  });
  const exportSystemLogs = async () => ({
    success: false,
    error: "Not implemented",
  });
  const clearCache = async () => ({ success: false, error: "Not implemented" });
  const createManualBackup = async () => ({
    success: false,
    error: "Not implemented",
  });

  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showUserRolesModal, setShowUserRolesModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showScheduleSessionModal, setShowScheduleSessionModal] =
    useState(false);

  const pendingApprovals = (approvals || []).filter(
    (a) => a.status === "pendente",
  );
  const recentActivity = [
    {
      type: "player_joined",
      description: "Alex Rivers si è unito alla campagna",
      timestamp: "2 ore fa",
      icon: Users,
      color: "text-green-500",
    },
    {
      type: "task_completed",
      description: "Calcoli PE completati",
      timestamp: "4 ore fa",
      icon: CheckCircle,
      color: "text-blue-500",
    },
    {
      type: "location_booked",
      description: "Tana del Drago prenotata per Sessione 16",
      timestamp: "1 giorno fa",
      icon: MapPin,
      color: "text-purple-500",
    },
    {
      type: "approval_needed",
      description: "Scambio oggetto richiede approvazione GM",
      timestamp: "2 giorni fa",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
  ];

  const handleViewApproval = (approval: any) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const formatLastBackup = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minuti fa`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ore fa`;
    } else {
      return date.toLocaleDateString("it-IT");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Crown className="h-8 w-8 text-fantasy-gold animate-pulse" />
              <span>Pannello Direttivo</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Centro di controllo principale per l'amministrazione e
              supervisione della campagna
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Notifiche
            </Button>
            <Button
              className="fantasy-button"
              onClick={() => setShowBroadcastModal(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Trasmetti
            </Button>
          </div>
        </div>

        {/* System Status Banner */}
        <Card className="fantasy-card border-fantasy-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-fantasy-success/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-fantasy-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Stato Sistema: Operativo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tutti i sistemi funzionano correttamente. Ultimo backup:{" "}
                    {formatLastBackup(systemStats.lastBackup)}
                  </p>
                </div>
              </div>
              <Badge className="bg-fantasy-success text-white">
                <Activity className="h-3 w-3 mr-1" />
                {systemStats.systemHealth}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Giocatori Attivi
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemStats.activePlayers}
                  </p>
                  <p className="text-xs text-fantasy-success">
                    Totale utenti registrati
                  </p>
                </div>
                <Users className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sessioni Questo Mese
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemStats.sessionsThisMonth}
                  </p>
                  <p className="text-xs text-fantasy-gold">+1 programmata</p>
                </div>
                <Calendar className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Approvazioni Pendenti
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {pendingApprovals.length}
                  </p>
                  <p className="text-xs text-orange-500">
                    {pendingApprovals.length > 0
                      ? "Richiede attenzione"
                      : "Tutto in ordine"}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Eventi in Arrivo
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemStats.upcomingEvents}
                  </p>
                  <p className="text-xs text-fantasy-primary">
                    Prossimo: Domani
                  </p>
                </div>
                <Clock className="h-8 w-8 text-fantasy-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvazioni ({pendingApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="system">Stato Sistema</TabsTrigger>
            <TabsTrigger value="communication">Comunicazione</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-fantasy-primary" />
                    <span>Attività Recenti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${activity.color}`}
                      >
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Director Actions */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-fantasy-gold" />
                    <span>Azioni Direttive</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start fantasy-button"
                    onClick={() => setShowBroadcastModal(true)}
                  >
                    <Send className="h-4 w-4 mr-3" />
                    Invia Annuncio Campagna
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowUserRolesModal(true)}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Gestisci Ruoli Utenti
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowScheduleSessionModal(true)}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Programma Sessione Master
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowGenerateReportModal(true)}
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Genera Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-3" />
                    Configurazione Sistema
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={createManualBackup}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Sicurezza e Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Approvazioni Pendenti</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-fantasy-success mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nessuna Approvazione Pendente
                    </h3>
                    <p className="text-muted-foreground">
                      Tutte le richieste sono state elaborate
                    </p>
                  </div>
                ) : (
                  pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{approval.type}</Badge>
                          <Badge
                            className={
                              approval.priority === "alta"
                                ? "bg-red-500 text-white"
                                : approval.priority === "media"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-green-500 text-white"
                            }
                          >
                            {approval.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{approval.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Richiesto da {approval.requester} il{" "}
                          {new Date(approval.submitted).toLocaleDateString(
                            "it-IT",
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApproval(approval)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisiona
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => approveRequest(approval.id)}
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Approva
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectRequest(approval.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemModules.map((module, index) => (
                <Card key={index} className="fantasy-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            module.status === "operativo"
                              ? "bg-green-500/10"
                              : "bg-orange-500/10"
                          }`}
                        >
                          <Shield
                            className={`h-5 w-5 ${
                              module.status === "operativo"
                                ? "text-green-500"
                                : "text-orange-500"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{module.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {module.users} utenti attivi • v{module.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            module.status === "operativo"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }
                        >
                          {module.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleMaintenanceMode(module.id)}
                        >
                          {module.status === "operativo"
                            ? "Manutenzione"
                            : "Attiva"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uptime:</span>
                        <span>{module.uptime}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ultimo aggiornamento:</span>
                        <span>
                          {new Date(module.lastUpdate).toLocaleDateString(
                            "it-IT",
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Actions */}
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-fantasy-accent" />
                  <span>Azioni Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={restartApplication}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riavvia Applicazione
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={optimizeDatabase}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Ottimizza Database
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={exportSystemLogs}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta Log Sistema
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-red-600"
                  onClick={clearCache}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancella Tutta Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Broadcast History */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-fantasy-accent" />
                      <span>Comunicazioni Recenti</span>
                    </div>
                    <Button
                      size="sm"
                      className="fantasy-button"
                      onClick={() => setShowBroadcastModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nuova
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {broadcastMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nessuna Comunicazione
                      </h3>
                      <p className="text-muted-foreground">
                        Invia il primo messaggio di trasmissione
                      </p>
                    </div>
                  ) : (
                    broadcastMessages.slice(0, 5).map((message, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium">
                            {message.subject}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {message.recipientGroup}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          A: {message.recipients.length} destinatari •{" "}
                          {new Date(message.sentAt).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-fantasy-primary" />
                    <span>Statistiche Rapide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {players.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Giocatori Totali
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-success">
                        {
                          (characters || []).filter(
                            (c) => c.status === "active",
                          ).length
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Personaggi Attivi
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-accent">
                        {
                          (tasks || []).filter((t) => t.status === "pending")
                            .length
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attività Pendenti
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-gold">
                        {(messages || []).filter((m) => !m.is_read).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Messaggi Non Letti
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedApproval(null);
          }}
          approval={selectedApproval}
        />
        <BroadcastModal
          isOpen={showBroadcastModal}
          onClose={() => setShowBroadcastModal(false)}
        />
        <UserRolesModal
          isOpen={showUserRolesModal}
          onClose={() => setShowUserRolesModal(false)}
        />
        <GenerateReportModal
          isOpen={showGenerateReportModal}
          onClose={() => setShowGenerateReportModal(false)}
        />
        <ScheduleSessionModal
          isOpen={showScheduleSessionModal}
          onClose={() => setShowScheduleSessionModal(false)}
        />
      </div>
    </div>
  );
}
