import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCog,
  Plus,
  Crown,
  Users,
  Search,
  Edit,
  MoreHorizontal,
  Trash,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useApp, NPC } from "@/contexts/SupabaseAppContext";
import { NPCForm } from "@/components/forms/NPCForm";

export default function NPCs() {
  const { npcs, deleteNPC } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNPCForm, setShowNPCForm] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | undefined>();
  const [npcToDelete, setNPCToDelete] = useState<NPC | undefined>();

  const filteredNPCs = npcs.filter((npc) => {
    const matchesSearch =
      npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <UserCog className="h-8 w-8 text-fantasy-secondary" />
              <span>Gestione PNG</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Crea e gestisci personaggi non giocanti per la tua campagna
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => {
              setEditingNPC(undefined);
              setShowNPCForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crea PNG
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    PNG Totali
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {npcs.length}
                  </p>
                </div>
                <UserCog className="h-8 w-8 text-fantasy-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Eventi Collegati
                  </p>
                  <p className="text-3xl font-bold text-fantasy-accent">
                    {npcs.reduce(
                      (acc, npc) => acc + npc.linked_events.length,
                      0,
                    )}
                  </p>
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
                    Ruoli Unici
                  </p>
                  <p className="text-3xl font-bold text-fantasy-gold">
                    {new Set(npcs.map((npc) => npc.role)).size}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-fantasy-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca PNG per nome, ruolo o descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* NPCs List */}
        {filteredNPCs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNPCs.map((npc) => (
              <Card
                key={npc.id}
                className="fantasy-card hover:shadow-fantasy-lg transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2 mb-2">
                        {npc.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant="outline"
                          className="border-fantasy-secondary text-fantasy-secondary"
                        >
                          {npc.role}
                        </Badge>
                        {npc.location && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {npc.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingNPC(npc);
                            setShowNPCForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica PNG
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setNPCToDelete(npc)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Elimina PNG
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {npc.description}
                  </p>

                  {npc.linked_events.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Eventi Collegati
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {npc.linked_events.map((event, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {npc.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {npc.notes}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground border-t pt-4">
                    Creato da {npc.createdBy} •{" "}
                    {new Date(npc.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingNPC(npc);
                        setShowNPCForm(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Modifica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="fantasy-card">
            <CardContent className="p-12 text-center">
              <UserCog className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Nessun PNG trovato" : "Nessun PNG creato"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Prova ad aggiustare i criteri di ricerca"
                  : "Crea il tuo primo PNG per popolare la campagna"}
              </p>
              <Button
                className="fantasy-button"
                onClick={() => {
                  setEditingNPC(undefined);
                  setShowNPCForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea PNG
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modali */}
        <NPCForm
          isOpen={showNPCForm}
          onClose={() => {
            setShowNPCForm(false);
            setEditingNPC(undefined);
          }}
          npc={editingNPC}
        />

        {/* Alert Dialog per conferma eliminazione */}
        <AlertDialog
          open={!!npcToDelete}
          onOpenChange={() => setNPCToDelete(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare il PNG "{npcToDelete?.name}"?
                Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (npcToDelete) {
                    deleteNPC(npcToDelete.id);
                    setNPCToDelete(undefined);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
