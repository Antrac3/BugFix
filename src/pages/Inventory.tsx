import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Package,
  Plus,
  ArrowRightLeft,
  Gem,
  Shield,
  Search,
  Edit,
  MoreHorizontal,
  Trash,
  User,
  Star,
  Crown,
  Sparkles,
  Settings,
  ArrowUp,
  ChevronDown,
  Activity,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Swords,
  Zap,
  Heart,
  Target,
  Eye,
  Package2,
  Coins,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApp, InventoryItem } from "@/contexts/SupabaseAppContext";
import { InventoryItemForm } from "@/components/forms/InventoryItemForm";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { cn } from "@/lib/utils";

const rarityColors = {
  common: "bg-gray-500 text-white border-gray-400",
  uncommon: "bg-green-500 text-white border-green-400",
  rare: "bg-blue-500 text-white border-blue-400",
  epic: "bg-purple-500 text-white border-purple-400",
  legendary: "bg-orange-500 text-white border-orange-400",
};

const rarityBgColors = {
  common: "from-gray-50/30 to-slate-50/30 border-gray-200/30",
  uncommon: "from-green-50/30 to-emerald-50/30 border-green-200/30",
  rare: "from-blue-50/30 to-cyan-50/30 border-blue-200/30",
  epic: "from-purple-50/30 to-violet-50/30 border-purple-200/30",
  legendary: "from-orange-50/30 to-amber-50/30 border-orange-200/30",
};

const rarityIcons = {
  common: Shield,
  uncommon: Star,
  rare: Gem,
  epic: Crown,
  legendary: Sparkles,
};

const typeIcons = {
  weapon: Swords,
  armor: Shield,
  accessory: Gem,
  consumable: Heart,
  tool: Package2,
  misc: Package,
};

export default function Inventory() {
  const {
    inventoryItems,
    characters,
    deleteInventoryItem,
    transferItem,
    showNotification,
  } = useApp();
  const { settings } = useAccessibility();

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "rarity" | "value" | "updated">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | undefined>();
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
        handleCreateItem();
      }

      // Escape to clear selection/search
      if (event.key === "Escape") {
        if (searchTerm) {
          setSearchTerm("");
        } else if (selectedItems.length > 0) {
          setSelectedItems([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, selectedItems]);

  // Enhanced handlers
  const handleCreateItem = () => {
    setEditingItem(undefined);
    setShowItemForm(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    setIsLoading(true);
    try {
      await deleteInventoryItem(item.id);
      showNotification(
        `${item.name} è stato eliminato con successo`,
        "success",
      );
      setItemToDelete(undefined);
    } catch (error) {
      showNotification("Errore durante l'eliminazione dell'oggetto", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    switch (action) {
      case "delete":
        if (
          window.confirm(
            `Eliminare ${selectedItems.length} oggetti selezionati?`,
          )
        ) {
          setIsLoading(true);
          // Bulk delete logic would go here
          setSelectedItems([]);
          setIsLoading(false);
        }
        break;
      case "transfer":
        // Bulk transfer logic
        break;
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedItems = inventoryItems
    .filter((item) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.effects.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Tab filter
      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "assigned" && item.character_id) ||
        (selectedTab === "unassigned" && !item.character_id) ||
        (selectedTab === "valuable" && (item.value || 0) > 100);

      // Rarity filter
      const matchesRarity =
        rarityFilter === "all" || item.rarity === rarityFilter;

      // Character filter
      const matchesCharacter =
        characterFilter === "all" ||
        (characterFilter === "unassigned" && !item.character_id) ||
        item.character_id?.toString() === characterFilter;

      // Type filter
      const matchesType = typeFilter === "all" || item.category === typeFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesRarity &&
        matchesCharacter &&
        matchesType
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rarity":
          const rarityOrder = [
            "common",
            "uncommon",
            "rare",
            "epic",
            "legendary",
          ];
          comparison =
            rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
          break;
        case "value":
          comparison = (a.value || 0) - (b.value || 0);
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
    total: inventoryItems.length,
    assigned: inventoryItems.filter((item) => item.character_id).length,
    unassigned: inventoryItems.filter((item) => !item.character_id).length,
    valuable: inventoryItems.filter((item) => (item.value || 0) > 100).length,
    totalValue: inventoryItems.reduce(
      (sum, item) => sum + (item.value || 0),
      0,
    ),
    avgValue:
      inventoryItems.length > 0
        ? Math.round(
            inventoryItems.reduce((sum, item) => sum + (item.value || 0), 0) /
              inventoryItems.length,
          )
        : 0,
    rarityBreakdown: {
      common: inventoryItems.filter((item) => item.rarity === "common").length,
      uncommon: inventoryItems.filter((item) => item.rarity === "uncommon")
        .length,
      rare: inventoryItems.filter((item) => item.rarity === "rare").length,
      epic: inventoryItems.filter((item) => item.rarity === "epic").length,
      legendary: inventoryItems.filter((item) => item.rarity === "legendary")
        .length,
    },
    types: Array.from(
      new Set(inventoryItems.map((item) => item.category).filter(Boolean)),
    ),
  };

  const getRarityDisplayName = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Comune";
      case "uncommon":
        return "Non Comune";
      case "rare":
        return "Raro";
      case "epic":
        return "Epico";
      case "legendary":
        return "Leggendario";
      default:
        return rarity;
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case "weapon":
        return "Arma";
      case "armor":
        return "Armatura";
      case "accessory":
        return "Accessorio";
      case "consumable":
        return "Consumabile";
      case "tool":
        return "Strumento";
      case "misc":
        return "Vario";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <TooltipProvider>
          <div className="space-y-8" ref={mainContentRef}>
            <ErgonomicEnhancer />

            {/* Enhanced Header with Dashboard Styling */}
            <div className="bg-gradient-to-r from-amber-50/30 to-yellow-50/30 rounded-xl p-6 border border-amber-200/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Gestione Inventario
                      </h1>
                      <p className="text-muted-foreground">
                        Amministra oggetti, equipaggiamenti e tesori del tuo
                        mondo LARP
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats with Dashboard Style */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{stats.assigned} Assegnati</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>{stats.unassigned} Liberi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span>
                        Valore Medio: {stats.avgValue.toLocaleString()} monete
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      <span>{stats.valuable} Oggetti Preziosi</span>
                    </div>
                  </div>

                  {/* Rarity Breakdown */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(stats.rarityBreakdown).map(
                      ([rarity, count]) => {
                        if (count === 0) return null;
                        const RarityIcon =
                          rarityIcons[rarity as keyof typeof rarityIcons];
                        return (
                          <Badge
                            key={rarity}
                            className={
                              rarityColors[rarity as keyof typeof rarityColors]
                            }
                          >
                            <RarityIcon className="h-3 w-3 mr-1" />
                            {count} {getRarityDisplayName(rarity)}
                          </Badge>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Quick Actions with Dashboard Style */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EnhancedButton
                        onClick={handleCreateItem}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isLoading}
                        aria-label="Crea nuovo oggetto (Ctrl+N)"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuovo Oggetto
                      </EnhancedButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Crea un nuovo oggetto (Ctrl+N)</p>
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
                        onClick={() => handleBulkAction("transfer")}
                        disabled={selectedItems.length === 0}
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Trasferisci Selezionati
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        disabled={selectedItems.length === 0}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Elimina Selezionati
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters with Dashboard Styling */}
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
                    placeholder="Cerca per nome, descrizione, effetti o categoria... (/ per focus rapido)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Campo ricerca oggetti"
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i Tipi</SelectItem>
                      {stats.types.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type)}
                            {getTypeDisplayName(type)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rarità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le Rarità</SelectItem>
                      {Object.keys(rarityIcons).map((rarity) => {
                        const RarityIcon =
                          rarityIcons[rarity as keyof typeof rarityIcons];
                        return (
                          <SelectItem key={rarity} value={rarity}>
                            <div className="flex items-center gap-2">
                              <RarityIcon className="h-4 w-4" />
                              {getRarityDisplayName(rarity)}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={characterFilter}
                    onValueChange={setCharacterFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assegnazione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i Personaggi</SelectItem>
                      <SelectItem value="unassigned">Non Assegnati</SelectItem>
                      {characters.map((character) => (
                        <SelectItem
                          key={character.id}
                          value={character.id.toString()}
                        >
                          {character.name}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="rarity">Rarità</SelectItem>
                      <SelectItem value="value">Valore</SelectItem>
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
                    Mostrando {filteredAndSortedItems.length} di{" "}
                    {inventoryItems.length} oggetti
                  </span>
                  {selectedItems.length > 0 && (
                    <span className="text-primary font-medium">
                      {selectedItems.length} selezionati
                    </span>
                  )}
                  <span className="font-medium text-amber-600">
                    Valore Totale: {stats.totalValue.toLocaleString()} monete
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status Tabs with Dashboard Styling */}
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
                <TabsTrigger value="assigned" className="relative">
                  Assegnati
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.assigned}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unassigned" className="relative">
                  Liberi
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.unassigned}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="valuable" className="relative">
                  Preziosi
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.valuable}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {/* Main Content */}
                <main id="main-content" role="main" className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center gap-3">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span>Caricamento inventario...</span>
                      </div>
                    </div>
                  ) : filteredAndSortedItems.length === 0 ? (
                    <Card className="fantasy-card">
                      <CardContent className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchTerm ||
                          rarityFilter !== "all" ||
                          characterFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Nessun oggetto trovato"
                            : "Inventario vuoto"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {searchTerm ||
                          rarityFilter !== "all" ||
                          characterFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Prova a modificare i filtri di ricerca"
                            : "Inizia creando il tuo primo oggetto"}
                        </p>
                        {!searchTerm &&
                          rarityFilter === "all" &&
                          characterFilter === "all" &&
                          typeFilter === "all" && (
                            <EnhancedButton
                              onClick={handleCreateItem}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Crea il primo oggetto
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
                      {filteredAndSortedItems.map((item) => {
                        const RarityIcon =
                          rarityIcons[item.rarity as keyof typeof rarityIcons];
                        const characterName = characters.find(
                          (c) => c.id === item.character_id,
                        )?.name;

                        return (
                          <Card
                            key={item.id}
                            className={cn(
                              "fantasy-card group hover:shadow-lg transition-all duration-200 border-2",
                              rarityBgColors[
                                item.rarity as keyof typeof rarityBgColors
                              ],
                            )}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {getTypeIcon(item.category || "misc")}
                                    {item.name}
                                    <Badge
                                      className={
                                        rarityColors[
                                          item.rarity as keyof typeof rarityColors
                                        ]
                                      }
                                    >
                                      <RarityIcon className="h-3 w-3 mr-1" />
                                      {getRarityDisplayName(item.rarity)}
                                    </Badge>
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description}
                                  </p>
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
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifica
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Dettagli
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                                      Trasferisci
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setItemToDelete(item)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Elimina
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Item Details */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {item.value && (
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      {item.value.toLocaleString()} monete
                                    </span>
                                  </div>
                                )}
                                {item.quantity && (
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3 text-blue-500" />
                                    <span>x{item.quantity}</span>
                                  </div>
                                )}
                              </div>

                              {/* Effects */}
                              {item.effects && (
                                <div className="p-2 bg-muted/30 rounded-lg">
                                  <p className="text-xs text-muted-foreground font-medium mb-1">
                                    Effetti:
                                  </p>
                                  <p className="text-xs">{item.effects}</p>
                                </div>
                              )}

                              {/* Assignment */}
                              <div className="flex items-center justify-between">
                                {characterName ? (
                                  <Badge variant="default" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {characterName}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <Archive className="h-3 w-3 mr-1" />
                                    Non Assegnato
                                  </Badge>
                                )}
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
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
                                  <ArrowRightLeft className="h-3 w-3 mr-1" />
                                  Trasferisci
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </main>
              </TabsContent>
            </Tabs>

            {/* Modals */}
            <InventoryItemForm
              isOpen={showItemForm}
              onClose={() => {
                setShowItemForm(false);
                setEditingItem(undefined);
              }}
              item={editingItem}
            />

            <AlertDialog
              open={!!itemToDelete}
              onOpenChange={() => setItemToDelete(undefined)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina Oggetto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare "{itemToDelete?.name}"? Questa
                    azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      itemToDelete && handleDeleteItem(itemToDelete)
                    }
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
}
