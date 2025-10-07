import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Edit,
  FileText,
  History,
  Eye,
  Lock,
  Users,
  Search,
  Filter,
  Trash2,
  Star,
  Calendar,
  User,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import { AddRuleSectionModal } from "@/components/modals/AddRuleSectionModal";

// Interfaccia per le sezioni del regolamento
interface RuleSection {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: "bassa" | "media" | "alta";
  visibility: "public" | "gm_only";
  tags: string[];
  created_by: string;
  created_at: string;
  last_modified: string;
  version: number;
}

// Database del regolamento con dati di esempio
const rulesDatabase: RuleSection[] = [
  {
    id: 1,
    title: "Meccaniche Base del Gioco",
    content:
      "Le meccaniche fondamentali del LARP includono l'interpretazione del personaggio, il sistema di combattimento e le regole di sicurezza. Ogni giocatore deve rimanere nel personaggio durante tutta la durata della sessione, eccetto in caso di emergenze.",
    category: "Regole Base",
    priority: "alta",
    visibility: "public",
    tags: ["base", "meccaniche", "interpretazione"],
    created_by: "Game Master",
    created_at: "2024-01-01",
    last_modified: "2024-01-15",
    version: 2,
  },
  {
    id: 2,
    title: "Sistema di Combattimento",
    content:
      "Il combattimento segue un sistema basato sui colpi chiamati. Le armi devono essere certificate e sicure. Ogni personaggio ha punti ferita determinati dal ruolo. I colpi letali devono essere chiamati chiaramente.",
    category: "Combattimento",
    priority: "alta",
    visibility: "public",
    tags: ["combattimento", "armi", "sicurezza"],
    created_by: "Game Master",
    created_at: "2024-01-02",
    last_modified: "2024-01-10",
    version: 3,
  },
  {
    id: 3,
    title: "Regole di Sicurezza",
    content:
      "La sicurezza dei partecipanti è prioritaria. È vietato il contatto fisico reale durante i combattimenti. Tutte le armi devono essere di materiali sicuri. In caso di infortunio, interrompere immediatamente il gioco.",
    category: "Sicurezza",
    priority: "alta",
    visibility: "public",
    tags: ["sicurezza", "infortuni", "emergenze"],
    created_by: "Game Master",
    created_at: "2024-01-01",
    last_modified: "2024-01-15",
    version: 1,
  },
  {
    id: 4,
    title: "Sistema Magia e Abilità",
    content:
      "La magia è rappresentata attraverso gesticolazione e incantesimi verbali. Ogni ruolo ha accesso a diverse scuole magiche. Le abilità speciali devono essere dichiarate prima dell'uso.",
    category: "Magia e Abilità",
    priority: "media",
    visibility: "public",
    tags: ["magia", "abilità", "incantesimi"],
    created_by: "Game Master",
    created_at: "2024-01-05",
    last_modified: "2024-01-12",
    version: 2,
  },
  {
    id: 5,
    title: "Gestione PNG Segreti",
    content:
      "I PNG possono essere interpretati da master nascosti tra i giocatori. Questi personaggi hanno obiettivi specifici che non devono essere rivelati. Protocolli di comunicazione speciali con la regia.",
    category: "Eventi Speciali",
    priority: "media",
    visibility: "gm_only",
    tags: ["png", "segreti", "master"],
    created_by: "Senior GM",
    created_at: "2024-01-08",
    last_modified: "2024-01-14",
    version: 1,
  },
];

const categories = [
  "Tutte",
  "Regole Base",
  "Combattimento",
  "Roleplay",
  "Equipaggiamento",
  "Magia e Abilità",
  "Sicurezza",
  "Comportamento",
  "Eventi Speciali",
  "Sistema PE",
];

export default function Rules() {
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tutte");
  const [selectedRule, setSelectedRule] = useState<RuleSection | null>(null);
  const [rules, setRules] = useState<RuleSection[]>(rulesDatabase);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "Tutte" || rule.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "bassa":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === "gm_only" ? (
      <Lock className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-fantasy-primary" />
              <span>Regolamento</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci e condividi le regole ufficiali e le linee guida della
              tua campagna
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => setShowAddSectionModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Sezione
          </Button>
        </div>

        {/* Statistiche del Regolamento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Sezioni Totali
                  </p>
                  <p className="text-2xl font-bold">{rules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pubbliche</p>
                  <p className="text-2xl font-bold">
                    {rules.filter((r) => r.visibility === "public").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solo GM</p>
                  <p className="text-2xl font-bold">
                    {rules.filter((r) => r.visibility === "gm_only").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alta Priorità</p>
                  <p className="text-2xl font-bold">
                    {rules.filter((r) => r.priority === "alta").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtri e Ricerca */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca regole, contenuti o tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-background"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista delle Regole */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRules.map((rule) => (
            <Card
              key={rule.id}
              className="fantasy-card hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {getVisibilityIcon(rule.visibility)}
                      {rule.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority}
                      </Badge>
                      <Badge variant="outline">{rule.category}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedRule(rule)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                  {rule.content}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {rule.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {rule.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {rule.last_modified}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <History className="h-3 w-3" />v{rule.version}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRules.length === 0 && (
          <Card className="fantasy-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessuna regola trovata
              </h3>
              <p className="text-muted-foreground mb-6">
                Non ci sono regole che corrispondono ai criteri di ricerca
                selezionati.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Tutte");
                }}
              >
                Reimposta Filtri
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal per visualizzazione dettagliata */}
        {selectedRule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      {getVisibilityIcon(selectedRule.visibility)}
                      {selectedRule.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={getPriorityColor(selectedRule.priority)}
                      >
                        {selectedRule.priority}
                      </Badge>
                      <Badge variant="outline">{selectedRule.category}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRule(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedRule.content}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Tag:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Creato da:</span>{" "}
                      {selectedRule.createdBy}
                    </div>
                    <div>
                      <span className="font-medium">Versione:</span>{" "}
                      {selectedRule.version}
                    </div>
                    <div>
                      <span className="font-medium">Creato il:</span>{" "}
                      {selectedRule.created_at}
                    </div>
                    <div>
                      <span className="font-medium">Modificato il:</span>{" "}
                      {selectedRule.last_modified}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AddRuleSectionModal
          isOpen={showAddSectionModal}
          onClose={() => setShowAddSectionModal(false)}
        />
      </div>
    </div>
  );
}
