import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Target,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  Pause,
  XCircle,
  Eye,
  EyeOff,
  Crown,
  Sword,
  Shield,
  Heart,
  MessageSquare,
  Lightbulb,
  MapPin,
  ChevronRight,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { usePlots } from "@/hooks/usePlots";
import { useCampaigns } from "@/hooks/useCampaigns";
import { PlotForm } from "@/components/forms/PlotForm";
import { PlotDetailsModal } from "@/components/modals/PlotDetailsModal";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
import { ObjectiveForm } from "@/components/forms/ObjectiveForm";
import { EventForm } from "@/components/forms/EventForm";

import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default function Plots() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showPlotDetails, setShowPlotDetails] = useState(false);

  const { campaigns } = useCampaigns();
  const {
    plots,
    objectives,
    events,
    loading,
    error,
    createPlot,
    updatePlot,
    deletePlot,
    createObjective,
    createEvent,
  } = usePlots(selectedCampaignId || undefined);

  // Filter plots based on search and filters
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchesSearch =
        searchTerm === "" ||
        plot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || plot.status === statusFilter;
      const matchesType = typeFilter === "all" || plot.plot_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [plots, searchTerm, statusFilter, typeFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalPlots = plots.length;
    const activePlots = plots.filter((p) => p.status === "active").length;
    const completedPlots = plots.filter((p) => p.status === "completed").length;
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(
      (o) => o.status === "completed",
    ).length;

    return {
      totalPlots,
      activePlots,
      completedPlots,
      totalObjectives,
      completedObjectives,
      completionRate:
        totalObjectives > 0
          ? Math.round((completedObjectives / totalObjectives) * 100)
          : 0,
    };
  }, [plots, objectives]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planning":
        return <Clock className="h-4 w-4" />;
      case "active":
        return <Activity className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "abandoned":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "abandoned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "main":
        return <Crown className="h-4 w-4" />;
      case "side":
        return <Sword className="h-4 w-4" />;
      case "personal":
        return <Heart className="h-4 w-4" />;
      case "background":
        return <Shield className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-600";
      case 2:
        return "text-orange-600";
      case 3:
        return "text-yellow-600";
      case 4:
        return "text-green-600";
      case 5:
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const handlePlotClick = (plot: any) => {
    setSelectedPlot(plot);
    setShowPlotDetails(true);
  };

  const handlePlotFormClose = () => {
    setShowPlotForm(false);
    setSelectedPlot(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fantasy-primary flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Gestione Trame
            </h1>
            <p className="text-muted-foreground">
              Orchestrare il destino attraverso trame intrecciate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedCampaignId?.toString() || "all"}
              onValueChange={(value) =>
                setSelectedCampaignId(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleziona campagna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le campagne</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowPlotForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Trama
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trame Totali
                  </p>
                  <p className="text-2xl font-bold">{stats.totalPlots}</p>
                </div>
                <BookOpen className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trame Attive
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activePlots}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Obiettivi
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.completedObjectives}/{stats.totalObjectives}
                  </p>
                </div>
                <Target className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completamento
                  </p>
                  <p className="text-2xl font-bold text-fantasy-secondary">
                    {stats.completionRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-fantasy-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca trame..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="planning">In Pianificazione</SelectItem>
                  <SelectItem value="active">Attive</SelectItem>
                  <SelectItem value="paused">In Pausa</SelectItem>
                  <SelectItem value="completed">Completate</SelectItem>
                  <SelectItem value="abandoned">Abbandonate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="main">Principale</SelectItem>
                  <SelectItem value="side">Secondaria</SelectItem>
                  <SelectItem value="personal">Personale</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-fantasy-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento trame...</p>
            </div>
          ) : filteredPlots.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nessuna trama trovata
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Prova a modificare i filtri di ricerca"
                  : "Inizia creando la tua prima trama"}
              </p>
              <Button onClick={() => setShowPlotForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Prima Trama
              </Button>
            </div>
          ) : (
            filteredPlots.map((plot) => (
              <Card
                key={plot.id}
                className="hover:shadow-lg transition-all cursor-pointer group h-fit min-h-[280px] flex flex-col"
                onClick={() => handlePlotClick(plot)}
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getTypeIcon(plot.plot_type)}
                      </div>
                      <CardTitle className="text-base sm:text-lg group-hover:text-fantasy-primary transition-colors truncate">
                        {plot.title}
                      </CardTitle>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(plot.status)} text-xs whitespace-nowrap`}
                      >
                        <span className="hidden sm:inline mr-1">
                          {getStatusIcon(plot.status)}
                        </span>
                        <span className="capitalize">{plot.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-medium ${getPriorityColor(plot.priority)}`}
                      >
                        P{plot.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{plot.character_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{plot.objective_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{plot.event_count || 0}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  {plot.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                      {plot.description}
                    </p>
                  )}

                  {plot.tags && plot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {plot.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs truncate max-w-[80px]"
                          title={tag}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {plot.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plot.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="truncate flex-1 mr-2">
                        {formatDistanceToNow(new Date(plot.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </span>
                      {plot.completion_percentage !== undefined && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-8 sm:w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-fantasy-primary transition-all"
                              style={{
                                width: `${plot.completion_percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {plot.completion_percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent
              className="p-4 sm:p-6 text-center"
              onClick={() => setShowObjectiveForm(true)}
            >
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-accent mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Nuovo Obiettivo
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Aggiungi obiettivi alle trame esistenti
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent
              className="p-4 sm:p-6 text-center"
              onClick={() => setShowEventForm(true)}
            >
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-secondary mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Nuovo Evento
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Programma eventi nella timeline
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-primary mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Analisi Trame
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Visualizza metriche e progressi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {showPlotForm && (
          <PlotForm
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            plot={selectedPlot}
            onClose={handlePlotFormClose}
            onSubmit={handlePlotFormClose}
          />
        )}

        {showObjectiveForm && (
          <ObjectiveForm
            plots={plots}
            onClose={() => setShowObjectiveForm(false)}
            onSubmit={() => setShowObjectiveForm(false)}
          />
        )}

        {showEventForm && (
          <EventForm
            plots={plots}
            onClose={() => setShowEventForm(false)}
            onSubmit={() => setShowEventForm(false)}
          />
        )}

        {showPlotDetails && selectedPlot && (
          <PlotDetailsModal
            plot={selectedPlot}
            objectives={objectives.filter(
              (obj) => obj.plot_id === selectedPlot.id,
            )}
            events={events.filter((event) => event.plot_id === selectedPlot.id)}
            onClose={() => {
              setShowPlotDetails(false);
              setSelectedPlot(null);
            }}
            onEdit={() => {
              setShowPlotDetails(false);
              setShowPlotForm(true);
            }}
            onDelete={() => {
              setShowPlotDetails(false);
              deletePlot(selectedPlot.id);
              setSelectedPlot(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
