import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Euro,
  Eye,
  UserPlus,
  CheckCircle,
  Settings,
  ArrowUp,
  ChevronDown,
  Activity,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Sparkles,
  Target,
} from "lucide-react";
import { useEvents, Event, CreateEventData } from "@/hooks/useEvents";
import { EventForm } from "@/components/forms/EventForm";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { usePlots } from "@/hooks/usePlots";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Events = () => {
  const { profile } = useAuth();
  const { settings } = useAccessibility();
  const { plots } = usePlots();
  const {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    checkInParticipant,
  } = useEvents();

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "date" | "title" | "participants" | "updated"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const canManageEvents = profile?.role === "gm" || profile?.role === "admin";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search with Ctrl+F or /
      if ((event.ctrlKey && event.key === "f") || event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      // Quick create with Ctrl+N
      if (event.ctrlKey && event.key === "n" && canManageEvents) {
        event.preventDefault();
        handleCreateEvent();
      }

      // Escape to clear selection/search
      if (event.key === "Escape") {
        if (searchTerm) {
          setSearchTerm("");
        } else if (selectedEvents.length > 0) {
          setSelectedEvents([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, selectedEvents, canManageEvents]);

  // Enhanced handlers
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowCreateDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      await deleteEvent(selectedEvent.id);
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEvents.length === 0) return;

    switch (action) {
      case "delete":
        if (
          window.confirm(
            `Eliminare ${selectedEvents.length} eventi selezionati?`,
          )
        ) {
          setIsLoading(true);
          // Bulk delete logic would go here
          setSelectedEvents([]);
          setIsLoading(false);
        }
        break;
      case "publish":
        // Bulk publish logic
        break;
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedEvents = events
    .filter((event) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Tab filter
      const matchesTab = selectedTab === "all" || event.status === selectedTab;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      // Type filter
      const matchesType =
        typeFilter === "all" || event.event_type === typeFilter;

      return matchesSearch && matchesTab && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison =
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          break;
        case "participants":
          comparison =
            (a.current_participants || 0) - (b.current_participants || 0);
          break;
        case "updated":
          comparison =
            new Date(a.updated_at || 0).getTime() -
            new Date(b.updated_at || 0).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Statistics for dashboard insights
  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.start_date) > new Date()).length,
    active: events.filter((e) => e.status === "open").length,
    completed: events.filter((e) => e.status === "completed").length,
    totalParticipants: events.reduce(
      (sum, e) => sum + (e.current_participants || 0),
      0,
    ),
    avgParticipants:
      events.length > 0
        ? Math.round(
            events.reduce((sum, e) => sum + (e.current_participants || 0), 0) /
              events.length,
          )
        : 0,
    types: Array.from(new Set(events.map((e) => e.event_type).filter(Boolean))),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "full":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Aperto";
      case "full":
        return "Completo";
      case "in_progress":
        return "In Corso";
      case "completed":
        return "Completato";
      case "cancelled":
        return "Annullato";
      case "planning":
        return "Pianificazione";
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "session":
        return <CalendarCheck className="h-4 w-4" />;
      case "tournament":
        return <Target className="h-4 w-4" />;
      case "workshop":
        return <Users className="h-4 w-4" />;
      case "meeting":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <TooltipProvider>
          <div className="space-y-8" ref={mainContentRef}>
            <ErgonomicEnhancer />

            {/* Enhanced Header with ARIA Support */}
            <div className="bg-gradient-to-r from-green-50/30 to-emerald-50/30 rounded-xl p-6 border border-green-200/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Gestione Eventi
                      </h1>
                      <p className="text-muted-foreground">
                        Organizza e gestisci tutti gli eventi del tuo mondo LARP
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{stats.upcoming} In Arrivo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{stats.active} Attivi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3 w-3 text-purple-500" />
                      <span>Media: {stats.avgParticipants} partecipanti</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-3 w-3 text-orange-500" />
                      <span>{stats.totalParticipants} iscrizioni totali</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {canManageEvents && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <EnhancedButton
                          onClick={handleCreateEvent}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoading}
                          aria-label="Crea nuovo evento (Ctrl+N)"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nuovo Evento
                        </EnhancedButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Crea un nuovo evento (Ctrl+N)</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Opzioni
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Visualizzazione</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          setViewMode(viewMode === "grid" ? "table" : "grid")
                        }
                      >
                        {viewMode === "grid"
                          ? "Vista Tabella"
                          : "Vista Griglia"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Azioni Bulk</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("publish")}
                        disabled={
                          selectedEvents.length === 0 || !canManageEvents
                        }
                      >
                        <CalendarCheck className="h-4 w-4 mr-2" />
                        Pubblica Selezionati
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        disabled={
                          selectedEvents.length === 0 || !canManageEvents
                        }
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina Selezionati
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Ricerca e Filtri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Cerca per titolo, descrizione o location... (/ per focus rapido)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Campo ricerca eventi"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchTerm("")}
                      aria-label="Cancella ricerca"
                    >
                      ×
                    </Button>
                  )}
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo Evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i Tipi</SelectItem>
                      {stats.types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "session"
                            ? "Sessione"
                            : type === "tournament"
                              ? "Torneo"
                              : type === "workshop"
                                ? "Workshop"
                                : type === "meeting"
                                  ? "Incontro"
                                  : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli Status</SelectItem>
                      <SelectItem value="open">Aperto</SelectItem>
                      <SelectItem value="full">Completo</SelectItem>
                      <SelectItem value="in_progress">In Corso</SelectItem>
                      <SelectItem value="completed">Completato</SelectItem>
                      <SelectItem value="cancelled">Annullato</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordina per" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="title">Titolo</SelectItem>
                      <SelectItem value="participants">Partecipanti</SelectItem>
                      <SelectItem value="updated">
                        Ultimo Aggiornamento
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="justify-center"
                  >
                    {sortOrder === "asc" ? (
                      <>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Crescente
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-4 w-4 mr-2 rotate-180" />
                        Decrescente
                      </>
                    )}
                  </Button>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Mostrando {filteredAndSortedEvents.length} di{" "}
                    {events.length} eventi
                  </span>
                  {selectedEvents.length > 0 && (
                    <span className="text-primary font-medium">
                      {selectedEvents.length} selezionati
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Tabs */}
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="relative">
                  Tutti
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="open" className="relative">
                  Aperti
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.active}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="relative">
                  In Corso
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {events.filter((e) => e.status === "in_progress").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="relative">
                  Completati
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.completed}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {/* Main Content */}
                <main id="main-content" role="main" className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center gap-3">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span>Caricamento eventi...</span>
                      </div>
                    </div>
                  ) : filteredAndSortedEvents.length === 0 ? (
                    <Card className="fantasy-card">
                      <CardContent className="text-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Nessun evento trovato"
                            : "Nessun evento presente"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Prova a modificare i filtri di ricerca"
                            : "Inizia creando il tuo primo evento"}
                        </p>
                        {!searchTerm &&
                          statusFilter === "all" &&
                          typeFilter === "all" &&
                          canManageEvents && (
                            <EnhancedButton
                              onClick={handleCreateEvent}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Crea il primo evento
                            </EnhancedButton>
                          )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div
                      className={cn(
                        "grid gap-6",
                        viewMode === "grid"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-1",
                      )}
                    >
                      {filteredAndSortedEvents.map((event) => (
                        <Card
                          key={event.id}
                          className="fantasy-card group hover:shadow-lg transition-all duration-200"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {getTypeIcon(event.event_type)}
                                  {event.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {format(
                                      new Date(event.start_date),
                                      "PPP 'alle' HH:mm",
                                      {
                                        locale: it,
                                      },
                                    )}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">
                                      {event.location.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {canManageEvents && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">
                                        Apri menu azioni
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditEvent(event)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifica
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Dettagli
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedEvent(event);
                                        setShowDeleteDialog(true);
                                      }}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Elimina
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(event.status)}>
                                {getStatusLabel(event.status)}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {event.current_participants || 0}
                                  {event.max_participants &&
                                    `/${event.max_participants}`}
                                </span>
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {event.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-blue-500" />
                                  <span>{event.duration}h</span>
                                </div>
                              )}
                              {event.cost && (
                                <div className="flex items-center gap-1">
                                  <Euro className="h-3 w-3 text-green-500" />
                                  <span>€{event.cost}</span>
                                </div>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Dettagli
                              </Button>
                              {event.status === "open" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Iscriviti
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </main>
              </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <EventForm
              isOpen={showCreateDialog || showEditDialog}
              onClose={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setSelectedEvent(null);
              }}
              event={selectedEvent}
              plots={plots || []}
            />

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina Evento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare "{selectedEvent?.title}"?
                    Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteEvent}
                    disabled={isLoading}
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Events;
