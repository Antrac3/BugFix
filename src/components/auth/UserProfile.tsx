import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  LogOut,
  Crown,
  Users,
  Shield,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";

export function UserProfile() {
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
      // Continue with closing dropdown even if logout has issues
    } finally {
      setIsOpen(false);
    }
  };

  const handleProfileClick = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "gm":
        return <Crown className="h-4 w-4" />;
      case "player":
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "gm":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "player":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Amministratore";
      case "gm":
        return "Game Master";
      case "player":
        return "Giocatore";
      default:
        return role;
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-fantasy-primary/20"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="bg-fantasy-primary text-white font-semibold">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
        forceMount
      >
        {/* User Info Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-fantasy-primary to-fantasy-accent">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-white/10 text-white font-semibold">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">
                {user.name}
              </div>
              <div className="text-sm text-white/80 truncate">{user.email}</div>
              <div className="mt-1">
                <Badge className={`${getRoleColor(user.role)} text-xs`}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="py-2">
          <DropdownMenuLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="px-4 py-2 cursor-pointer focus:bg-fantasy-primary/5"
            onClick={handleProfileClick}
          >
            <User className="h-4 w-4 mr-3" />
            <span>Profilo e Impostazioni</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="px-4 py-2 cursor-pointer focus:bg-fantasy-primary/5"
            onClick={handleNotificationsClick}
          >
            <Bell className="h-4 w-4 mr-3" />
            <span>Notifiche</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Admin/GM specific items */}
          {hasRole(["admin", "gm"]) && (
            <>
              <DropdownMenuLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Gestione
              </DropdownMenuLabel>

              {hasRole("admin") && (
                <DropdownMenuItem
                  className="px-4 py-2 cursor-pointer focus:bg-fantasy-primary/5"
                  onClick={() => {
                    navigate("/director");
                    setIsOpen(false);
                  }}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  <span>Pannello Admin</span>
                </DropdownMenuItem>
              )}

              {hasRole(["admin", "gm"]) && (
                <DropdownMenuItem
                  className="px-4 py-2 cursor-pointer focus:bg-fantasy-primary/5"
                  onClick={() => {
                    navigate("/analytics");
                    setIsOpen(false);
                  }}
                >
                  <Crown className="h-4 w-4 mr-3" />
                  <span>Analisi e Report</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
            </>
          )}

          {/* Account Info */}
          <DropdownMenuLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Informazioni
          </DropdownMenuLabel>

          <div className="px-4 py-2 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Membro dal:</span>
                <div className="font-medium">
                  {new Date(user.created_at).toLocaleDateString("it-IT")}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Ultimo accesso:</span>
                <div className="font-medium">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString("it-IT")
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            className="px-4 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Esci</span>
          </DropdownMenuItem>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-muted/30 border-t">
          <div className="text-xs text-muted-foreground text-center">
            LARP Manager v1.0.0
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
