import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  MapPin,
  Edit,
  MoreHorizontal,
  Calendar,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  UserX,
  MessageSquare,
  ExternalLink,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, Player } from "@/contexts/SupabaseAppContext";
import { PlayerForm } from "@/components/forms/PlayerForm";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
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

const statusColors = {
  active: "bg-fantasy-success text-white",
  inactive: "bg-yellow-500 text-white",
  suspended: "bg-fantasy-danger text-white",
};

const statusIcons = {
  active: CheckCircle,
  inactive: AlertCircle,
  suspended: UserX,
};

export default function Players() {
  const { players, deletePlayer } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [playerToDelete, setPlayerToDelete] = useState<Player | undefined>();

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesRole = roleFilter === "all" || player.role === roleFilter;

    if (selectedTab === "all")
      return matchesSearch && matchesStatus && matchesRole;
    if (selectedTab === "active")
      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        player.status === "active"
      );
    if (selectedTab === "inactive")
      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        player.status !== "active"
      );

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return Icon ? <Icon className="h-3 w-3" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <ErgonomicEnhancer />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Users className="h-8 w-8 text-fantasy-primary" />
              <span>Gestione Giocatori</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci profili giocatori, informazioni di contatto e
              partecipazione alle campagne
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => {
              setEditingPlayer(undefined);
              setShowPlayerForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Giocatore
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Giocatori
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {players.length}
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
                    Giocatori Attivi
                  </p>
                  <p className="text-3xl font-bold text-fantasy-success">
                    {players.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-fantasy-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Game Masters
                  </p>
                  <p className="text-3xl font-bold text-fantasy-gold">
                    {players.filter((p) => p.role === "gm").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-fantasy-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-fantasy-accent">+2</p>
                </div>
                <Star className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca giocatori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="player">Players</SelectItem>
                    <SelectItem value="gm">Game Masters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Tutti i Giocatori ({players.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Attivi ({players.filter((p) => p.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inattivi ({players.filter((p) => p.status !== "active").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Player Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="fantasy-card hover:shadow-fantasy-lg transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-lg bg-fantasy-gradient flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {player.name}
                            {player.role === "gm" && (
                              <Shield className="h-4 w-4 text-fantasy-gold" />
                            )}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              className={
                                statusColors[
                                  player.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {getStatusIcon(player.status)}
                              <span className="ml-1 capitalize">
                                {player.status}
                              </span>
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {player.role}
                            </Badge>
                          </div>
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
                              setEditingPlayer(player);
                              setShowPlayerForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica Profilo
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Invia Messaggio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setPlayerToDelete(player)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Elimina Giocatore
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{player.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{player.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{player.location}</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    {player.socialLinks &&
                      Object.keys(player.socialLinks).length > 0 && (
                        <div className="flex items-center space-x-2">
                          {Object.entries(player.socialLinks).map(
                            ([platform, handle]) => (
                              <Badge
                                key={platform}
                                variant="secondary"
                                className="text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {platform}: {handle}
                              </Badge>
                            ),
                          )}
                        </div>
                      )}

                    {/* Characters and Campaigns */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">
                          Characters:{" "}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {player.characters.join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Campaigns: </span>
                        <span className="text-sm text-muted-foreground">
                          {player.campaigns.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* Join Date and Last Active */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Joined:{" "}
                          {new Date(player.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        Last active:{" "}
                        {new Date(player.lastActive).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Notes */}
                    {player.notes && (
                      <div className="text-sm bg-muted/50 p-3 rounded-lg">
                        <span className="font-medium">Notes: </span>
                        <span className="text-muted-foreground">
                          {player.notes}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No players found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    roleFilter !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "Add your first player to get started"}
                  </p>
                  <Button
                    className="fantasy-button"
                    onClick={() => {
                      setEditingPlayer(undefined);
                      setShowPlayerForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Giocatore
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modali */}
        <PlayerForm
          isOpen={showPlayerForm}
          onClose={() => {
            setShowPlayerForm(false);
            setEditingPlayer(undefined);
          }}
          player={editingPlayer}
        />

        {/* Alert Dialog per conferma eliminazione */}
        <AlertDialog
          open={!!playerToDelete}
          onOpenChange={() => setPlayerToDelete(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare il giocatore "
                {playerToDelete?.name}
                "? Questa azione non può essere annullata e rimuoverà anche
                tutti i personaggi associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (playerToDelete) {
                    deletePlayer(playerToDelete.id);
                    setPlayerToDelete(undefined);
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
