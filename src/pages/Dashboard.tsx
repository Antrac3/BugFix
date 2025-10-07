import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCog,
  Zap,
  Package,
  MessageSquare,
  Plus,
  TrendingUp,
  Calendar,
  Star,
  Sword,
  Shield,
  Crown,
  Sparkles,
  Megaphone,
  MapPin,
  Clock,
  BookOpen,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";
import { PlayerForm } from "@/components/forms/PlayerForm";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { XPAwardModal } from "@/components/modals/XPAwardModal";
import { CampaignForm } from "@/components/forms/CampaignForm";
import { ItemTradeModal } from "@/components/modals/ItemTradeModal";
import { ReviewMessagesModal } from "@/components/modals/ReviewMessagesModal";
import { ScheduleSessionModal } from "@/components/modals/ScheduleSessionModal";
import { CampaignDetailsModal } from "@/components/modals/CampaignDetailsModal";
import { useCampaigns } from "@/hooks/useCampaigns";
import { usePlots } from "@/hooks/usePlots";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { CampaignsDebug } from "@/components/debug/CampaignsDebug";
import { PrivacyDebug } from "@/components/debug/PrivacyDebug";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { EventsWidget } from "@/components/widgets/EventsWidget";
import { DatabaseSetup } from "@/components/DatabaseSetup";
import { CommunicationsWidget } from "@/components/widgets/CommunicationsWidget";
import { DatabaseSetupError } from "@/components/ui/database-setup-error";
import { testSupabaseConnection } from "@/utils/supabase-test";

export default function Dashboard() {
  const {
    players,
    characters,
    tasks,
    messages,
    notifications,
    npcs,
    showNotification,
  } = useApp();
  const navigate = useNavigate();
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showItemTradeModal, setShowItemTradeModal] = useState(false);
  const [showReviewMessagesModal, setShowReviewMessagesModal] = useState(false);
  const [showScheduleSessionModal, setShowScheduleSessionModal] =
    useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);

  // Load campaigns from database
  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    deleteCampaign,
  } = useCampaigns();

  // Load plots data
  const { plots } = usePlots();

  const activeCharacters = characters.filter((c) => c.status === "active");
  const activePlayers = players.filter((p) => p.status === "active");
  const unreadMessages = messages.filter((m) => !m.is_read);
  const totalXP = characters.reduce((sum, c) => sum + c.xp, 0);

  // Debug logging for campaigns
  if (campaignsError) {
    console.log("🔍 Dashboard campaigns error:", campaignsError);
  }

  // Generate real recent activities from actual data
  const recentActivities = useMemo(() => {
    const activities: any[] = [];

    // Add character creations (last 3)
    const recentCharacters =
      characters
        ?.filter((char) => char.created_at)
        ?.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        ?.slice(0, 3) || [];

    recentCharacters.forEach((char) => {
      activities.push({
        title: `Nuovo personaggio "${char.name}" creato`,
        description: `${char.role} • ${formatDistanceToNow(new Date(char.created_at), { addSuffix: true, locale: it })}`,
        icon: <Users className="h-5 w-5 text-fantasy-primary" />,
        iconBg: "bg-fantasy-primary/10",
        badge: "PG",
        badgeVariant: "secondary" as const,
        badgeClass: "",
        timestamp: new Date(char.created_at),
      });
    });

    // Add recent tasks (last 2)
    const recentTasks =
      tasks
        ?.filter((task) => task.created)
        ?.sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        )
        ?.slice(0, 2) || [];

    recentTasks.forEach((task) => {
      activities.push({
        title: `Nuova attività: "${task.title}"`,
        description: `${task.category} • ${formatDistanceToNow(new Date(task.created), { addSuffix: true, locale: it })}`,
        icon: <Plus className="h-5 w-5 text-fantasy-secondary" />,
        iconBg: "bg-fantasy-secondary/10",
        badge:
          task.priority === "urgent"
            ? "Urgente"
            : task.priority === "high"
              ? "Alta"
              : "Normale",
        badgeVariant: "outline" as const,
        badgeClass:
          task.priority === "urgent" ? "border-red-500 text-red-500" : "",
        timestamp: new Date(task.created),
      });
    });

    // Add recent messages (last 2)
    const recentMessages =
      messages
        ?.filter((msg) => msg.created_at)
        ?.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        ?.slice(0, 2) || [];

    recentMessages.forEach((msg) => {
      activities.push({
        title: "Nuovo messaggio ricevuto",
        description: `da ${msg.from_character} �� ${formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: it })}`,
        icon: <MessageSquare className="h-5 w-5 text-fantasy-accent" />,
        iconBg: "bg-fantasy-accent/10",
        badge: "Messaggio",
        badgeVariant: "outline" as const,
        badgeClass: "border-fantasy-accent text-fantasy-accent",
        timestamp: new Date(msg.created_at),
      });
    });

    // Sort all activities by timestamp (most recent first) and take last 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [characters, tasks, messages]);

  const handleItemTradeModal = () => {
    if (characters.length === 0) {
      showNotification(
        "Crea almeno un personaggio prima di effettuare scambi",
        "error",
      );
      return;
    }
    setShowItemTradeModal(true);
  };

  const handleCampaignFormClose = () => {
    setShowCampaignForm(false);
    setSelectedCampaign(null);
    // The useCampaigns hook will automatically refresh the list
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignForm(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm("Sei sicuro di voler eliminare questa campagna?")) {
      try {
        await deleteCampaign(campaignId);
        showNotification("Campagna eliminata con successo", "success");
      } catch (error) {
        showNotification(
          "Errore durante l'eliminazione della campagna",
          "error",
        );
        console.error("Error deleting campaign:", error);
      }
    }
  };

  // Temporary debug function - remove later
  const runConnectionTest = async () => {
    console.clear();
    await testSupabaseConnection();
  };

  // Show database setup error if campaigns can't be loaded
  if (
    campaignsError &&
    (campaignsError.includes("tabella 'campaigns' non esiste") ||
      campaignsError.includes("ricorsione infinita") ||
      campaignsError.includes("infinite recursion"))
  ) {
    return (
      <div className="space-y-6">
        <DatabaseSetupError error={campaignsError} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-fantasy-gradient p-4 sm:p-6 lg:p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-gold" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Benvenuto, Game Master
            </h1>
            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-fantasy-gold animate-pulse" />
          </div>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 sm:mb-6">
            Gestisci la tua campagna LARP con il controllo completo su
            personaggi, storia e world-building.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-white/30 w-full sm:w-auto"
              size="sm"
              onClick={() => setShowCampaignForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuova Campagna
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              size="sm"
              onClick={() => setShowScheduleSessionModal(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Programma Sessione
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-100 hover:bg-red-500/20 w-full sm:w-auto"
              size="sm"
              onClick={runConnectionTest}
            >
              🧪 Test DB
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-1/2 -ml-16 -mb-8 h-24 w-24 rounded-full bg-white/5"></div>
      </div>

      {/* Status Overview - Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="fantasy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Personaggi Attivi
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeCharacters.length}
                </p>
              </div>
              <Sword className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="fantasy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trame Attive
                </p>
                <p className="text-2xl font-bold text-fantasy-primary">
                  {plots?.filter((p) => p.status === "active").length || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-fantasy-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="fantasy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Messaggi Non Letti
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {unreadMessages.length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="fantasy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  XP Totali Assegnati
                </p>
                <p className="text-2xl font-bold text-fantasy-gold">
                  {totalXP}
                </p>
              </div>
              <Zap className="h-8 w-8 text-fantasy-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Game Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaigns Overview */}
          {!campaignsLoading && !campaignsError && campaigns.length > 0 && (
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-fantasy-gold" />
                    <span>Le Tue Campagne</span>
                    <Badge variant="outline">{campaigns.length}</Badge>
                  </div>
                  <Button size="sm" onClick={() => setShowCampaignForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.slice(0, 4).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-card hover:border-fantasy-primary group"
                      onClick={() => handleCampaignClick(campaign)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground truncate group-hover:text-fantasy-primary transition-colors">
                          {campaign.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {campaign.status === "planning"
                            ? "In Pianificazione"
                            : campaign.status === "active"
                              ? "Attiva"
                              : campaign.status === "completed"
                                ? "Completata"
                                : campaign.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {campaign.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {campaign.player_count || 0}/{campaign.max_players}{" "}
                          giocatori
                        </span>
                        <span>{campaign.genre?.replace("_", " ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plots Overview */}
          {plots && plots.length > 0 && (
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-fantasy-primary" />
                    <span>Trame in Corso</span>
                    <Badge variant="outline">
                      {plots.filter((p) => p.status === "active").length}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => navigate("/plots")}>
                    Gestisci Trame
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plots
                    .filter((plot) => plot.status === "active")
                    .slice(0, 3)
                    .map((plot) => (
                      <div
                        key={plot.id}
                        className="p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card cursor-pointer"
                        onClick={() => navigate("/plots")}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{plot.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              P{plot.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {plot.plot_type === "main"
                                ? "Principale"
                                : plot.plot_type === "side"
                                  ? "Secondaria"
                                  : plot.plot_type === "personal"
                                    ? "Personale"
                                    : "Background"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {plot.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {plot.completion_percentage || 0}% completato
                          </span>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-fantasy-primary transition-all"
                              style={{
                                width: `${plot.completion_percentage || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Character Overview */}
          <Card className="fantasy-card border-indigo-200/50 bg-gradient-to-br from-indigo-50/30 to-blue-50/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Sword className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-base font-semibold text-indigo-900">
                    Personaggi Recenti
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs border-indigo-300 text-indigo-700"
                  >
                    {activeCharacters.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCharacterForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo PG
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeCharacters.slice(0, 4).map((character, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-indigo-200/50 bg-white/60 hover:bg-white/80 hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{character.name}</h4>
                      <Badge variant="default" className="text-xs">
                        Livello {character.level}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{character.class}</span>
                        <span>{character.xp} XP</span>
                      </div>
                      <p>Giocato da {character.player}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Communications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="fantasy-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-fantasy-gold" />
                <span>Azioni Rapide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start h-10 fantasy-button text-sm"
                onClick={() => setShowCharacterForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea Personaggio
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 text-sm"
                onClick={() => navigate("/plots")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Gestisci Trame
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 text-sm"
                onClick={() => setShowScheduleSessionModal(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Programma Sessione
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 text-sm"
                onClick={() => setShowXPModal(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Assegna XP
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 text-sm"
                onClick={() => (window.location.href = "/communications")}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Invia Comunicazione
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 text-sm"
                onClick={() => setShowPlayerForm(true)}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Aggiungi Giocatore
              </Button>
            </CardContent>
          </Card>

          {/* Communication Widgets */}
          <CommunicationsWidget />

          {/* Recent Activity */}
          <Card className="fantasy-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-fantasy-primary" />
                <span>Attività Recenti</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 4).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div
                        className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Nessuna attività recente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events & Notes */}
          <EventsWidget />
          <NotesWidget maxHeight="250px" />
        </div>

        {/* Database Setup Section */}
        <div className="mb-6">
          <DatabaseSetup />
        </div>
      </div>

      {/* Character Overview */}
      <Card className="fantasy-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sword className="h-5 w-5 text-fantasy-primary" />
              <span>Personaggi Attivi</span>
            </div>
            <Button size="sm" variant="outline">
              Vedi Tutti
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCharacters.slice(0, 6).map((character, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-card/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">
                    {character.name}
                  </h3>
                  <Badge variant="default">attivo</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {character.class}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3 text-fantasy-gold" />
                    <span className="text-muted-foreground">
                      Livello {character.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Giocato da {character.player}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plots Overview */}
      {plots && plots.length > 0 && (
        <Card className="fantasy-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-fantasy-primary" />
              <span>Trame Attive</span>
              <Badge variant="outline">
                {plots.filter((p) => p.status === "active").length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plots
                .filter((plot) => plot.status === "active")
                .slice(0, 6)
                .map((plot) => (
                  <div
                    key={plot.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card cursor-pointer"
                    onClick={() => navigate("/plots")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground truncate">
                        {plot.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {plot.plot_type === "main"
                          ? "Principale"
                          : plot.plot_type === "side"
                            ? "Secondaria"
                            : plot.plot_type === "personal"
                              ? "Personale"
                              : "Background"}
                      </Badge>
                    </div>
                    {plot.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {plot.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>P{plot.priority}</span>
                      <span>{plot.completion_percentage || 0}% completato</span>
                    </div>
                  </div>
                ))}
            </div>
            {plots.filter((p) => p.status === "active").length > 6 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/plots")}
                >
                  Vedi Tutte (
                  {plots.filter((p) => p.status === "active").length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Campaigns Section */}
      {!campaignsLoading && !campaignsError && campaigns.length > 0 && (
        <Card className="fantasy-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sword className="h-5 w-5 text-fantasy-primary" />
              <span>Le Tue Campagne</span>
              <Badge variant="outline">{campaigns.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.slice(0, 6).map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-card hover:border-fantasy-primary group"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-foreground truncate group-hover:text-fantasy-primary transition-colors">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          campaign.status === "planning"
                            ? "secondary"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {campaign.status === "planning"
                          ? "In Pianificazione"
                          : campaign.status === "active"
                            ? "Attiva"
                            : campaign.status === "completed"
                              ? "Completata"
                              : campaign.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {campaign.description}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {campaign.genre && (
                      <div className="flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span className="capitalize">
                          {campaign.genre.replace("_", " ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {campaign.player_count || 0}/{campaign.max_players}{" "}
                        giocatori
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{campaign.duration}h per sessione</span>
                    </div>
                    {campaign.start_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {campaign.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{campaign.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCampaign(campaign);
                      }}
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCampaign(campaign.id);
                      }}
                    >
                      Elimina
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {campaigns.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Vedi Tutte ({campaigns.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Section - Remove after fixing campaigns */}
      {campaignsError && <CampaignsDebug />}
      {import.meta.env.DEV && <PrivacyDebug />}

      {/* Modali */}
      <PlayerForm
        isOpen={showPlayerForm}
        onClose={() => setShowPlayerForm(false)}
      />
      <CharacterForm
        isOpen={showCharacterForm}
        onClose={() => setShowCharacterForm(false)}
      />
      <XPAwardModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
      />
      <ItemTradeModal
        isOpen={showItemTradeModal}
        onClose={() => setShowItemTradeModal(false)}
      />
      <ReviewMessagesModal
        isOpen={showReviewMessagesModal}
        onClose={() => setShowReviewMessagesModal(false)}
      />
      <ScheduleSessionModal
        isOpen={showScheduleSessionModal}
        onClose={() => setShowScheduleSessionModal(false)}
      />
      <CampaignForm
        isOpen={showCampaignForm}
        campaign={selectedCampaign}
        onClose={handleCampaignFormClose}
      />

      {/* Campaign Details Modal */}
      {showCampaignDetails && selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCampaignDetails(false);
            setSelectedCampaign(null);
          }}
          onEdit={() => {
            setShowCampaignDetails(false);
            setShowCampaignForm(true);
          }}
          onDelete={() => {
            setShowCampaignDetails(false);
            handleDeleteCampaign(selectedCampaign.id);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}
