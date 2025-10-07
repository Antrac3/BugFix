import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Activity,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Target,
  Flame,
  Lightbulb,
  Heart,
  Scroll,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";
import { PlayerForm } from "@/components/forms/PlayerForm";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { XPAwardModal } from "@/components/modals/XPAwardModal";
import { CampaignForm } from "@/components/forms/CampaignForm";
import { ItemTradeModal } from "@/components/modals/ItemTradeModal";
import { ReviewMessagesModal } from "@/components/modals/ReviewMessagesModal";
import { ScheduleSessionModal } from "@/components/modals/ScheduleSessionModal";
import { useCampaigns } from "@/hooks/useCampaigns";
import { usePlots } from "@/hooks/usePlots";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { CampaignsDebug } from "@/components/debug/CampaignsDebug";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { EventsWidget } from "@/components/widgets/EventsWidget";
import { CommunicationsWidget } from "@/components/widgets/CommunicationsWidget";
import { CampaignDetailsModal } from "@/components/modals/CampaignDetailsModal";

export default function EnhancedDashboard() {
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

  // Load campaigns and plots
  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    deleteCampaign,
  } = useCampaigns();
  const { plots } = usePlots();

  const activeCharacters =
    characters?.filter((c) => c?.status === "active") || [];
  const activePlayers = players?.filter((p) => p?.status === "active") || [];
  const unreadMessages = messages?.filter((m) => !m?.is_read) || [];
  const totalXP = characters?.reduce((sum, c) => sum + (c?.xp || 0), 0) || 0;

  // Advanced stats calculation with better error handling
  const advancedStats = useMemo(() => {
    try {
      const activeCampaigns = Array.isArray(campaigns)
        ? campaigns.filter((c) => c?.status === "active").length
        : 0;
      const activePlots = Array.isArray(plots)
        ? plots.filter((p) => p?.status === "active").length
        : 0;
      const completedPlots = Array.isArray(plots)
        ? plots.filter((p) => p?.status === "completed").length
        : 0;
      const plotCompletionRate =
        Array.isArray(plots) && plots.length > 0
          ? Math.round((completedPlots / plots.length) * 100)
          : 0;

      const avgCharacterLevel =
        Array.isArray(activeCharacters) && activeCharacters.length > 0
          ? Math.round(
              activeCharacters.reduce(
                (sum, c) => sum + (Number(c?.level) || 0),
                0,
              ) / activeCharacters.length,
            )
          : 0;

      const upcomingEvents = Array.isArray(tasks)
        ? tasks.filter((t) => {
            try {
              return (
                t?.dueDate &&
                new Date(t.dueDate) > new Date() &&
                new Date(t.dueDate) <
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              );
            } catch {
              return false;
            }
          }).length
        : 0;

      const engagementBase =
        (activePlots || 0) * 20 +
        (activeCharacters?.length || 0) * 15 +
        (activePlayers?.length || 0) * 10;
      const engagementScore =
        engagementBase > 0 ? Math.round(engagementBase / 10) : 0;

      return {
        activeCampaigns: Math.max(0, activeCampaigns || 0),
        activePlots: Math.max(0, activePlots || 0),
        plotCompletionRate: Math.max(0, Math.min(100, plotCompletionRate || 0)),
        avgCharacterLevel: Math.max(0, avgCharacterLevel || 0),
        upcomingEvents: Math.max(0, upcomingEvents || 0),
        engagementScore: Math.max(0, engagementScore || 0),
      };
    } catch (error) {
      console.error("Error calculating advancedStats:", error);
      return {
        activeCampaigns: 0,
        activePlots: 0,
        plotCompletionRate: 0,
        avgCharacterLevel: 0,
        upcomingEvents: 0,
        engagementScore: 0,
      };
    }
  }, [campaigns, plots, activeCharacters, activePlayers, tasks]);

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleCampaignFormClose = () => {
    setShowCampaignForm(false);
    setSelectedCampaign(null);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Section with Glass Morphism */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>

          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-yellow-400/20 to-transparent rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>

          <div className="relative z-10 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <Crown className="h-10 w-10 text-yellow-400 drop-shadow-lg" />
                    <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                      Dashboard di Produzione
                    </h1>
                    <p className="text-lg text-blue-100 mt-2">
                      Il tuo regno digitale per epiche avventure LARP
                    </p>
                  </div>
                </div>

                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Orchestrare mondi immaginari non è mai stato così potente.
                  Gestisci trame, personaggi e destini con strumenti degni di un
                  vero Game Master.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => setShowCampaignForm(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nuova Campagna
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowScheduleSessionModal(true)}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Programma Sessione
                  </Button>
                </div>
              </div>

              {/* Quick Stats in Hero */}
              <div className="grid grid-cols-2 gap-4 lg:w-80">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {advancedStats.activeCampaigns}
                      </p>
                      <p className="text-xs text-blue-200">Campagne Attive</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Flame className="h-8 w-8 text-orange-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {advancedStats.engagementScore}
                      </p>
                      <p className="text-xs text-blue-200">Engagement</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {advancedStats.plotCompletionRate}%
                      </p>
                      <p className="text-xs text-blue-200">Trame Risolte</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {advancedStats.avgCharacterLevel}
                      </p>
                      <p className="text-xs text-blue-200">Livello Medio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Personaggi Attivi
                  </p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {activeCharacters?.length || 0}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1">
                    +
                    {activeCharacters?.filter(
                      (c) =>
                        c?.created_at &&
                        new Date(c.created_at) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ).length || 0}{" "}
                    questa settimana
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <Sword className="h-12 w-12 text-emerald-600 relative z-10 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(
                    activePlayers.length > 0
                      ? (activeCharacters.length / activePlayers.length) * 100
                      : 0,
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-emerald-500 mt-1">
                  Rapporto PG/Giocatori
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Trame Attive
                  </p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                    {advancedStats.activePlots}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    {plots?.filter((p) => p.priority <= 2).length || 0} ad alta
                    priorità
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <BookOpen className="h-12 w-12 text-purple-600 relative z-10 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(
                    Math.max(advancedStats.plotCompletionRate || 0, 0),
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-purple-500 mt-1">
                  Tasso di completamento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Messaggi
                  </p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {unreadMessages.length}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {messages.length} totali
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <MessageSquare className="h-12 w-12 text-blue-600 relative z-10 group-hover:scale-110 transition-transform" />
                  {unreadMessages.length > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {unreadMessages.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(
                    messages.length > 0
                      ? (unreadMessages.length / messages.length) * 100
                      : 0,
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-blue-500 mt-1">Non letti</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    XP Totali
                  </p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                    {(totalXP || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-500 mt-1">
                    Liv. {advancedStats.avgCharacterLevel} medio
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <Zap className="h-12 w-12 text-amber-600 relative z-10 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(
                    totalXP > 0 ? Math.max((totalXP / 10000) * 100, 5) : 0,
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-amber-500 mt-1">
                  Progressione campagna
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid with Enhanced Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Primary Content */}
          <div className="xl:col-span-8 space-y-8">
            {/* Campaigns Showcase */}
            {!campaignsLoading && campaigns.length > 0 && (
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
                  <div className="bg-background rounded-lg p-6">
                    <CardHeader className="px-0 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold">
                              Le Tue Campagne
                            </CardTitle>
                            <p className="text-muted-foreground">
                              Mondi in evoluzione sotto la tua guida
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowCampaignForm(true)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nuova Campagna
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="px-0 pb-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {campaigns.slice(0, 4).map((campaign, index) => (
                          <div
                            key={campaign.id}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleCampaignClick(campaign)}
                          >
                            <div
                              className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                              style={{
                                background: `linear-gradient(135deg, hsl(${index * 90}, 70%, 50%), hsl(${index * 90 + 60}, 60%, 60%))`,
                              }}
                            ></div>

                            <div className="relative p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                    {campaign.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {campaign.description}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    campaign.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-3"
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

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-indigo-500" />
                                  <span>
                                    {campaign.player_count || 0}/
                                    {campaign.max_players}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-purple-500" />
                                  <span>{campaign.duration}h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-pink-500" />
                                  <span className="truncate">
                                    {campaign.location || "TBD"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-yellow-500" />
                                  <span className="truncate capitalize">
                                    {campaign.genre?.replace("_", " ") ||
                                      "Fantasy"}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  {[
                                    ...Array(
                                      Math.min(campaign.player_count || 0, 4),
                                    ),
                                  ].map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center"
                                    >
                                      <span className="text-xs text-white font-bold">
                                        {i + 1}
                                      </span>
                                    </div>
                                  ))}
                                  {(campaign.player_count || 0) > 4 && (
                                    <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                                      <span className="text-xs text-gray-600 font-bold">
                                        +{campaign.player_count - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            )}

            {/* Plots and Characters Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Plots */}
              {plots && plots.length > 0 && (
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                          <Scroll className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Trame in Corso
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Storie che si dipanano
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/plots")}
                      >
                        Gestisci
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plots
                        .filter((plot) => plot.status === "active")
                        .slice(0, 3)
                        .map((plot) => (
                          <div
                            key={plot.id}
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => navigate("/plots")}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold group-hover:text-purple-600 transition-colors">
                                {plot.title}
                              </h4>
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
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {plot.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    plot.completion_percentage || 0,
                                  ),
                                )}
                                % completato
                              </span>
                              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, plot.completion_percentage || 0))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Characters */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                        <Sword className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Personaggi Recenti
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Eroi in formazione
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowCharacterForm(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nuovo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {activeCharacters.slice(0, 3).map((character, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {character.level}
                              </span>
                            </div>
                            {character.name}
                          </h4>
                          <Badge variant="default" className="text-xs">
                            Attivo
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">
                              {character.class}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              {character.xp} XP
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Giocato da {character.player}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Actions Panel */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-1">
                <div className="bg-background rounded-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">Azioni Rapide</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                      onClick={() => setShowCharacterForm(true)}
                    >
                      <Sword className="h-5 w-5 mr-3" />
                      Crea Personaggio
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => navigate("/plots")}
                    >
                      <BookOpen className="h-5 w-5 mr-3 text-purple-600" />
                      Gestisci Trame
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => setShowScheduleSessionModal(true)}
                    >
                      <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                      Programma Sessione
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 hover:bg-amber-50 hover:border-amber-300"
                      onClick={() => setShowXPModal(true)}
                    >
                      <Zap className="h-5 w-5 mr-3 text-amber-600" />
                      Assegna XP
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 hover:bg-indigo-50 hover:border-indigo-300"
                      onClick={() => (window.location.href = "/communications")}
                    >
                      <Megaphone className="h-5 w-5 mr-3 text-indigo-600" />
                      Invia Comunicazione
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Enhanced Widgets */}
            <div className="space-y-6">
              <CommunicationsWidget />
              <EventsWidget />
              <NotesWidget maxHeight="200px" />
            </div>
          </div>
        </div>

        {/* Upcoming Events Timeline */}
        {advancedStats.upcomingEvents > 0 && (
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-1">
              <div className="bg-background rounded-lg p-6">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Eventi in Arrivo
                      </CardTitle>
                      <p className="text-muted-foreground">
                        La tua agenda della prossima settimana
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Timeline eventi sarà implementata prossimamente
                    </p>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Debug Section */}
      {campaignsError && <CampaignsDebug />}

      {/* Modals */}
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
            deleteCampaign(selectedCampaign.id);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}
