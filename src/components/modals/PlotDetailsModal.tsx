import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Edit,
  Trash2,
  Crown,
  Sword,
  Heart,
  Shield,
  Target,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Zap,
  Plus,
  Activity,
  Pause,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface PlotDetailsModalProps {
  plot: any;
  objectives: any[];
  events: any[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PlotDetailsModal({
  plot,
  objectives,
  events,
  onClose,
  onEdit,
  onDelete,
}: PlotDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "main":
        return "Principale";
      case "side":
        return "Secondaria";
      case "personal":
        return "Personale";
      case "background":
        return "Background";
      default:
        return type;
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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "Critica";
      case 2:
        return "Alta";
      case 3:
        return "Media";
      case 4:
        return "Bassa";
      case 5:
        return "Molto Bassa";
      default:
        return "Media";
    }
  };

  const getObjectiveTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Eye className="h-3 w-3" />;
      case "private":
        return <Users className="h-3 w-3" />;
      case "secret":
        return <EyeOff className="h-3 w-3" />;
      case "hidden":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "story":
        return "bg-blue-100 text-blue-800";
      case "action":
        return "bg-red-100 text-red-800";
      case "revelation":
        return "bg-purple-100 text-purple-800";
      case "conflict":
        return "bg-orange-100 text-orange-800";
      case "resolution":
        return "bg-green-100 text-green-800";
      case "npc_appearance":
        return "bg-yellow-100 text-yellow-800";
      case "trigger":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedObjectives = objectives.sort((a, b) => a.priority - b.priority);
  const sortedEvents = events.sort(
    (a, b) =>
      new Date(a.scheduled_time || a.created_at).getTime() -
      new Date(b.scheduled_time || b.created_at).getTime(),
  );

  const completedObjectives = objectives.filter(
    (obj) => obj.status === "completed",
  ).length;
  const completionPercentage =
    objectives.length > 0
      ? Math.round((completedObjectives / objectives.length) * 100)
      : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-bold text-fantasy-primary flex items-center gap-2">
                <span className="flex-shrink-0">
                  {getTypeIcon(plot.plot_type)}
                </span>
                <span className="truncate">{plot.title}</span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {getTypeLabel(plot.plot_type)}
                </Badge>
                <Badge className={`${getStatusColor(plot.status)} text-xs`}>
                  <span className="hidden sm:inline mr-1">
                    {getStatusIcon(plot.status)}
                  </span>
                  <span className="capitalize">{plot.status}</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <span className={getPriorityColor(plot.priority)}>
                    P{plot.priority} - {getPriorityLabel(plot.priority)}
                  </span>
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Modifica</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Elimina</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-3 sm:py-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-fantasy-primary">
              {objectives.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Obiettivi
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {completedObjectives}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Completati
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-fantasy-secondary">
              {events.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Eventi
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-fantasy-accent">
              {completionPercentage}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Progresso
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Panoramica</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">
                Obiettivi ({objectives.length})
              </span>
              <span className="sm:hidden">Obiett. ({objectives.length})</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Eventi ({events.length})</span>
              <span className="sm:hidden">Eventi ({events.length})</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 overflow-y-auto flex-1"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dettagli Trama</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plot.description && (
                    <div>
                      <h4 className="font-medium mb-2">Descrizione</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {plot.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Creata:</span>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(plot.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Aggiornata:</span>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(plot.updated_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </div>

                  {(plot.start_date || plot.target_end_date) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {plot.start_date && (
                        <div>
                          <span className="font-medium">Inizio:</span>
                          <p className="text-muted-foreground">
                            {new Date(plot.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {plot.target_end_date && (
                        <div>
                          <span className="font-medium">Fine Prevista:</span>
                          <p className="text-muted-foreground">
                            {new Date(
                              plot.target_end_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {plot.tags && plot.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tag</h4>
                      <div className="flex flex-wrap gap-1">
                        {plot.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progresso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Completamento Obiettivi
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {completedObjectives}/{objectives.length}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-fantasy-primary h-2 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {plot.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Note</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {plot.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Objectives Tab */}
          <TabsContent
            value="objectives"
            className="space-y-4 overflow-y-auto flex-1"
          >
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold">
                Obiettivi ({objectives.length})
              </h3>
              <Button size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuovo Obiettivo</span>
              </Button>
            </div>

            {sortedObjectives.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Nessun obiettivo</h4>
                <p className="text-muted-foreground">
                  Aggiungi obiettivi per guidare lo sviluppo della trama
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sortedObjectives.map((objective) => (
                  <Card
                    key={objective.id}
                    className="border-l-4 border-l-fantasy-primary"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getObjectiveTypeIcon(objective.objective_type)}
                          <CardTitle className="text-base">
                            {objective.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              objective.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {objective.status === "completed" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {objective.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {objective.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {objective.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={getPriorityColor(objective.priority)}>
                          P{objective.priority}
                        </span>
                        <span className="capitalize">
                          {objective.objective_type}
                        </span>
                        {objective.is_mandatory && (
                          <Badge variant="outline" className="text-xs">
                            Obbligatorio
                          </Badge>
                        )}
                      </div>

                      {objective.deadline && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Scadenza:{" "}
                            {new Date(objective.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent
            value="events"
            className="space-y-4 overflow-y-auto flex-1"
          >
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold">
                Eventi ({events.length})
              </h3>
              <Button size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuovo Evento</span>
              </Button>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Nessun evento</h4>
                <p className="text-muted-foreground">
                  Programma eventi per dare vita alla trama
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge
                              className={getEventTypeColor(event.event_type)}
                            >
                              {event.event_type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            {event.scheduled_time && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(
                                    event.scheduled_time,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {event.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.duration_minutes}min</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.participants &&
                              event.participants.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{event.participants.length}</span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent
            value="timeline"
            className="space-y-4 overflow-y-auto flex-1"
          >
            <h3 className="text-base sm:text-lg font-semibold">
              Timeline della Trama
            </h3>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">
                Timeline in sviluppo
              </h4>
              <p className="text-muted-foreground">
                Visualizzazione cronologica degli eventi sarà disponibile presto
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
