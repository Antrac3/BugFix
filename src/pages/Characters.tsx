import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Filter,
  Users,
  Sword,
  Shield,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  Crown,
  Zap,
  Heart,
  Brain,
  Target,
  Sparkles,
  Trash2,
  Settings,
  ArrowUp,
  ChevronDown,
  Activity,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApp } from "@/contexts/SupabaseAppContext";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { Database } from "@/lib/database.types";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { cn } from "@/lib/utils";

type Character = Database["public"]["Tables"]["characters"]["Row"];

export default function Characters() {
  const { characters, charactersLoading, deleteCharacter, showNotification } =
    useApp();
  const { settings } = useAccessibility();

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<
    Character | undefined
  >(undefined);
  const [sortBy, setSortBy] = useState<"name" | "level" | "xp" | "updated">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search with Ctrl+F or /
      if ((event.ctrlKey && event.key === "f") || event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      // Quick create with Ctrl+N
      if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        handleCreateCharacter();
      }

      // Escape to clear selection/search
      if (event.key === "Escape") {
        if (searchTerm) {
          setSearchTerm("");
        } else if (selectedCharacters.length > 0) {
          setSelectedCharacters([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, selectedCharacters]);

  // Enhanced handlers
  const handleCreateCharacter = () => {
    setEditingCharacter(undefined);
    setShowCharacterForm(true);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setShowCharacterForm(true);
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (
      !window.confirm(
        `Sei sicuro di voler eliminare ${character.name}? Questa azione non può essere annullata.`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteCharacter(character.id);
      showNotification(
        `${character.name} è stato eliminato con successo`,
        "success",
      );
    } catch (error) {
      showNotification(
        "Errore durante l'eliminazione del personaggio",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCharacters.length === 0) return;

    switch (action) {
      case "delete":
        if (
          window.confirm(
            `Eliminare ${selectedCharacters.length} personaggi selezionati?`,
          )
        ) {
          setIsLoading(true);
          // Bulk delete logic would go here
          setSelectedCharacters([]);
          setIsLoading(false);
        }
        break;
      case "activate":
        // Bulk activate logic
        break;
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedCharacters = characters
    .filter((character) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        character.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.background
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        character.player?.toLowerCase().includes(searchTerm.toLowerCase());

      // Tab filter
      const matchesTab =
        selectedTab === "all" || character.status === selectedTab;

      // Class filter
      const matchesClass =
        filterClass === "all" || character.class === filterClass;

      // Status filter
      const matchesStatus =
        filterStatus === "all" || character.status === filterStatus;

      return matchesSearch && matchesTab && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "level":
          comparison = (a.level || 0) - (b.level || 0);
          break;
        case "xp":
          comparison = (a.xp || 0) - (b.xp || 0);
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
    total: characters.length,
    active: characters.filter((c) => c.status === "active").length,
    inactive: characters.filter((c) => c.status === "inactive").length,
    avgLevel:
      characters.length > 0
        ? Math.round(
            characters.reduce((sum, c) => sum + (c.level || 0), 0) /
              characters.length,
          )
        : 0,
    totalXP: characters.reduce((sum, c) => sum + (c.xp || 0), 0),
    classes: Array.from(
      new Set(characters.map((c) => c.class).filter(Boolean)),
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <TooltipProvider>
          <div className="space-y-8" ref={mainContentRef}>
            <ErgonomicEnhancer />

            {/* Enhanced Header with ARIA Support */}
            <div className="bg-gradient-to-r from-fantasy-primary/5 to-fantasy-secondary/5 rounded-xl p-6 border border-fantasy-primary/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-fantasy-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-fantasy-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Gestione Personaggi
                      </h1>
                      <p className="text-muted-foreground">
                        Gestisci tutti i personaggi del tuo mondo LARP
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{stats.active} Attivi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>{stats.inactive} Inattivi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>Livello Medio: {stats.avgLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span>{stats.totalXP.toLocaleString()} XP Totali</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EnhancedButton
                        onClick={handleCreateCharacter}
                        className="fantasy-button"
                        disabled={isLoading}
                        aria-label="Crea nuovo personaggio (Ctrl+N)"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuovo Personaggio
                      </EnhancedButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Crea un nuovo personaggio (Ctrl+N)</p>
                    </TooltipContent>
                  </Tooltip>

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
                        onClick={() => handleBulkAction("activate")}
                        disabled={selectedCharacters.length === 0}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Attiva Selezionati
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        disabled={selectedCharacters.length === 0}
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
                    placeholder="Cerca per nome, classe, background o giocatore... (/ per focus rapido)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Campo ricerca personaggi"
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
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le Classi</SelectItem>
                      {stats.classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli Status</SelectItem>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="inactive">Inattivo</SelectItem>
                      <SelectItem value="retired">Ritirato</SelectItem>
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
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="level">Livello</SelectItem>
                      <SelectItem value="xp">Esperienza</SelectItem>
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
                    Mostrando {filteredAndSortedCharacters.length} di{" "}
                    {characters.length} personaggi
                  </span>
                  {selectedCharacters.length > 0 && (
                    <span className="text-primary font-medium">
                      {selectedCharacters.length} selezionati
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
                <TabsTrigger value="active" className="relative">
                  Attivi
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.active}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="relative">
                  Inattivi
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.inactive}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="retired" className="relative">
                  Ritirati
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {characters.filter((c) => c.status === "retired").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {/* Main Content */}
                <main id="main-content" role="main" className="space-y-6">
                  {charactersLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center gap-3">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span>Caricamento personaggi...</span>
                      </div>
                    </div>
                  ) : filteredAndSortedCharacters.length === 0 ? (
                    <Card className="fantasy-card">
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchTerm ||
                          filterClass !== "all" ||
                          filterStatus !== "all"
                            ? "Nessun personaggio trovato"
                            : "Nessun personaggio presente"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {searchTerm ||
                          filterClass !== "all" ||
                          filterStatus !== "all"
                            ? "Prova a modificare i filtri di ricerca"
                            : "Inizia creando il tuo primo personaggio"}
                        </p>
                        {!searchTerm &&
                          filterClass === "all" &&
                          filterStatus === "all" && (
                            <EnhancedButton
                              onClick={handleCreateCharacter}
                              className="fantasy-button"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Crea il primo personaggio
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
                      {filteredAndSortedCharacters.map((character) => (
                        <Card
                          key={character.id}
                          className="fantasy-card group hover:shadow-lg transition-all duration-200"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Sword className="h-4 w-4 text-fantasy-primary" />
                                  {character.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{character.class}</span>
                                  {character.background && (
                                    <>
                                      <span>•</span>
                                      <span>{character.background}</span>
                                    </>
                                  )}
                                </div>
                              </div>
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
                                    onClick={() =>
                                      handleEditCharacter(character)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifica
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizza
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteCharacter(character)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="font-medium">
                                    Livello {character.level || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Zap className="h-3 w-3" />
                                  <span>{character.xp || 0} XP</span>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <Badge
                                  variant={
                                    character.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {character.status === "active"
                                    ? "Attivo"
                                    : character.status === "inactive"
                                      ? "Inattivo"
                                      : "Ritirato"}
                                </Badge>
                                {character.player && (
                                  <div className="text-xs text-muted-foreground">
                                    {character.player}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Character Stats */}
                            {(character.strength ||
                              character.dexterity ||
                              character.intelligence ||
                              character.vitality) && (
                              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                                {character.strength && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Sword className="h-3 w-3 text-red-500" />
                                    <span>FOR {character.strength}</span>
                                  </div>
                                )}
                                {character.dexterity && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Target className="h-3 w-3 text-green-500" />
                                    <span>DES {character.dexterity}</span>
                                  </div>
                                )}
                                {character.intelligence && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Brain className="h-3 w-3 text-blue-500" />
                                    <span>INT {character.intelligence}</span>
                                  </div>
                                )}
                                {character.vitality && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Heart className="h-3 w-3 text-pink-500" />
                                    <span>VIT {character.vitality}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCharacter(character)}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Modifica
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Dettagli
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </main>
              </TabsContent>
            </Tabs>

            {/* Character Form Modal */}
            <CharacterForm
              isOpen={showCharacterForm}
              onClose={() => {
                setShowCharacterForm(false);
                setEditingCharacter(undefined);
              }}
              character={editingCharacter}
            />
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
