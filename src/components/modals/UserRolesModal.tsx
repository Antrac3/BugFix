import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Crown,
  Shield,
  Search,
  Edit,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useApp } from "@/contexts/SupabaseAppContext";

interface UserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserRolesModal({ isOpen, onClose }: UserRolesModalProps) {
  const { players, updatePlayer } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<"player" | "gm">("player");

  const filteredPlayers = players.filter(
    (player) =>
      `${player.firstName} ${player.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRoleChange = (userId: number, role: "player" | "gm") => {
    updatePlayer(userId, { role });
    setEditingUserId(null);
    setNewRole("player");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "gm":
        return <Crown className="h-4 w-4 text-fantasy-gold" />;
      case "player":
        return <Users className="h-4 w-4 text-fantasy-primary" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "gm":
        return (
          <Badge className="bg-fantasy-gold text-white">Game Master</Badge>
        );
      case "player":
        return <Badge variant="outline">Giocatore</Badge>;
      default:
        return <Badge variant="secondary">Sconosciuto</Badge>;
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "gm":
        return [
          "Gestione completa personaggi",
          "Assegnazione PE",
          "Moderazione messaggi",
          "Gestione PNG",
          "Accesso analytics",
        ];
      case "player":
        return [
          "Visualizzazione proprio personaggio",
          "Invio messaggi in-character",
          "Partecipazione eventi",
          "Accesso regolamento pubblico",
        ];
      default:
        return [];
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestisci Ruoli Utenti"
      description="Modifica i ruoli e i permessi degli utenti nella campagna"
      size="large"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca utenti per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="fantasy-card">
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 text-fantasy-gold mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {players.filter((p) => p.role === "gm").length}
              </div>
              <div className="text-sm text-muted-foreground">Game Masters</div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-fantasy-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {players.filter((p) => p.role === "player").length}
              </div>
              <div className="text-sm text-muted-foreground">Giocatori</div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-fantasy-success mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {players.filter((p) => p.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Utenti Attivi</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="fantasy-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-fantasy-primary/10 flex items-center justify-center">
                      {getRoleIcon(player.role)}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {player.firstName} {player.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {player.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(player.role)}
                        <Badge
                          variant={
                            player.status === "active" ? "default" : "secondary"
                          }
                        >
                          {player.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {editingUserId === player.id ? (
                      <div className="flex items-center space-x-2">
                        <Select
                          value={newRole}
                          onValueChange={(value) =>
                            setNewRole(value as "player" | "gm")
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="player">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>Giocatore</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="gm">
                              <div className="flex items-center space-x-2">
                                <Crown className="h-4 w-4" />
                                <span>Game Master</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleRoleChange(player.id, newRole)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUserId(null);
                            setNewRole("player");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(player.id);
                          setNewRole(player.role);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifica
                      </Button>
                    )}
                  </div>
                </div>

                {/* Permissions Display */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">
                    Permessi{" "}
                    {player.role === "gm" ? "Game Master" : "Giocatore"}:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {getRolePermissions(player.role).map(
                      (permission, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{permission}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? "Nessun utente trovato" : "Nessun utente"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Prova ad aggiustare i criteri di ricerca"
                : "Non ci sono utenti registrati"}
            </p>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-yellow-800">
              Attenzione alle modifiche dei ruoli
            </div>
            <div className="text-yellow-700 mt-1">
              Modificare i ruoli utente può influenzare l'accesso alle
              funzionalità. I Game Master hanno accesso completo al sistema.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6">
          <Button onClick={onClose} className="fantasy-button">
            <Shield className="h-4 w-4 mr-2" />
            Chiudi Gestione
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
