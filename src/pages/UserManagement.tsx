import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Shield,
  Crown,
  User,
  Mail,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "player" | "gm" | "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  avatar_url: string | null;
}

const roleConfig = {
  player: {
    label: "Giocatore",
    icon: User,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Partecipa agli eventi LARP",
  },
  gm: {
    label: "Game Master",
    icon: Shield,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Gestisce eventi e giocatori",
  },
  admin: {
    label: "Amministratore",
    icon: Crown,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Accesso completo al sistema",
  },
  super_admin: {
    label: "Super Admin",
    icon: Crown,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Accesso totale e gestione utenti",
  },
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load users from database
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log("Loading all users from both profiles and auth...");

      // Prima carica i profili esistenti
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        // Continua comunque per provare a caricare tutti gli utenti
      }

      console.log("Loaded profiles:", profilesData || []);

      // Usa una funzione SQL per ottenere tutti gli utenti auth
      const { data: allUsersData, error: usersError } = await supabase.rpc(
        "get_all_users_with_profiles",
      );

      if (usersError) {
        console.warn(
          "Could not load auth users, using only profiles:",
          usersError,
        );
        // Fallback: usa solo i profili
        setUsers(profilesData || []);
        return;
      }

      console.log("Loaded all users:", allUsersData);
      setUsers(allUsersData || profilesData || []);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && user.is_active) ||
      (selectedStatus === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Update user role
  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? { ...user, role: newRole as any }
            : user,
        ),
      );

      toast({
        title: "Successo",
        description: `Ruolo aggiornato a ${roleConfig[newRole as keyof typeof roleConfig].label}`,
      });

      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole("");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.is_active;

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: newStatus } : u,
        ),
      );

      toast({
        title: "Successo",
        description: `Utente ${newStatus ? "attivato" : "disattivato"}`,
      });
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo status dell'utente",
        variant: "destructive",
      });
    }
  };

  const openRoleDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleDialog(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
    gms: users.filter((u) => u.role === "gm").length,
    players: users.filter((u) => u.role === "player").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fantasy-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento utenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-primary" />
              Gestione Utenti
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestisci ruoli e permessi degli utenti registrati
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <Card className="fantasy-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Totale Utenti
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Attivi
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Admin
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {stats.admins}
                  </p>
                </div>
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    GM
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {stats.gms}
                  </p>
                </div>
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Giocatori
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {stats.players}
                  </p>
                </div>
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="fantasy-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i ruoli</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gm">GM</SelectItem>
                    <SelectItem value="player">Giocatori</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="active">Attivi</SelectItem>
                    <SelectItem value="inactive">Inattivi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="fantasy-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Utenti ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const roleData = roleConfig[user.role];
                  if (!roleData) {
                    console.warn(
                      `Unknown role: ${user.role} for user: ${user.email}`,
                    );
                    return null;
                  }
                  const RoleIcon = roleData.icon;

                  return (
                    <div
                      key={user.id}
                      className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Avatar & Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-fantasy-primary/10 text-fantasy-primary">
                              {user.first_name.charAt(0)}
                              {user.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground truncate">
                                {user.first_name} {user.last_name}
                              </h3>
                              {!user.is_active && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Inattivo
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Registrato{" "}
                                  {formatDistanceToNow(
                                    new Date(user.created_at),
                                    {
                                      addSuffix: true,
                                      locale: it,
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${roleData.color} text-xs sm:text-sm`}
                          >
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleData.label}
                          </Badge>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                              disabled={user.id === currentUser?.id}
                              title="Cambia ruolo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user)}
                              disabled={user.id === currentUser?.id}
                              title={
                                user.is_active
                                  ? "Disattiva utente"
                                  : "Attiva utente"
                              }
                            >
                              {user.is_active ? (
                                <Lock className="h-4 w-4 text-orange-600" />
                              ) : (
                                <Unlock className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nessun utente trovato con i filtri selezionati
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Change Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambia Ruolo Utente</DialogTitle>
              <DialogDescription>
                Stai per cambiare il ruolo di{" "}
                <strong>
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </strong>
                . Questa azione modificherà i permessi dell'utente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Seleziona nuovo ruolo:
                </label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => {
                      if (!config) return null;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{config.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRoleDialog(false)}
                disabled={isUpdating}
              >
                Annulla
              </Button>
              <Button
                onClick={updateUserRole}
                disabled={isUpdating || !newRole}
                className="fantasy-button"
              >
                {isUpdating ? "Aggiornamento..." : "Aggiorna Ruolo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
