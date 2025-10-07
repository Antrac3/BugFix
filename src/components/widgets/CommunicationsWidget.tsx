import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Plus,
  ArrowRight,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "react-router-dom";

export const CommunicationsWidget = () => {
  const { communications, loading, error, markAsRead } = useCommunications();
  const { profile } = useAuth();
  const [updateKey, setUpdateKey] = useState(0);

  const userId = profile?.id || "";

  const recentCommunications = communications
    .filter((comm) => comm.status === "published")
    .filter(
      (comm) => !comm.expires_at || new Date(comm.expires_at) > new Date(),
    )
    .slice(0, 3);

  const unreadCount =
    userId && communications.length > 0
      ? communications.filter((comm) => {
          // Must be published
          if (comm.status !== "published") return false;

          // Must not be expired
          if (comm.expires_at && new Date(comm.expires_at) <= new Date())
            return false;

          // If read_by is null, undefined, or empty array, it's unread
          if (
            !comm.read_by ||
            !Array.isArray(comm.read_by) ||
            comm.read_by.length === 0
          )
            return true;

          // Check if user is in the read_by array
          return !comm.read_by.includes(userId);
        }).length
      : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "normal":
        return "Normale";
      case "low":
        return "Bassa";
      default:
        return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "Annuncio";
      case "news":
        return "Notizia";
      case "event":
        return "Evento";
      case "rule_update":
        return "Regole";
      case "system":
        return "Sistema";
      default:
        return type;
    }
  };

  const isUserRead = (comm: any) => {
    return comm.read_by?.includes(userId) || false;
  };

  const handleMarkAsRead = async (id: number) => {
    const success = await markAsRead(id);
    if (success) {
      if (import.meta.env.DEV) {
        console.log("✅ Communication marked as read, forcing re-render");
      }
      // Force re-render by updating the key
      setUpdateKey((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comunicazioni</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comunicazioni</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Megaphone className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Errore nel caricamento comunicazioni
            </p>
            <p className="text-xs text-muted-foreground">
              {error.includes("Database tables not set up")
                ? "Database non configurato"
                : "Errore di connessione"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      key={updateKey}
      className="fantasy-card fantasy-border-glow border-pink-500/30"
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-pink-400" />
            <span>Comunicazioni</span>
            {!loading && !error && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentCommunications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Megaphone className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nessuna comunicazione recente
            </p>
            {(profile?.role === "gm" || profile?.role === "admin") && (
              <Button size="sm" asChild>
                <Link to="/communications">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Comunicazione
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentCommunications.map((comm) => (
              <div
                key={comm.id}
                className="p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-clamp-1 flex-1 mr-2">
                    {comm.title}
                  </h4>
                  <div className="flex gap-1">
                    <Badge
                      className={`${getPriorityColor(comm.priority)} text-xs`}
                    >
                      {getPriorityLabel(comm.priority)}
                    </Badge>
                    {comm.priority === "urgent" && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {comm.content}
                </p>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(comm.type)}
                    </Badge>
                    {comm.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {comm.author.first_name} {comm.author.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {format(new Date(comm.created_at), "dd/MM", {
                        locale: it,
                      })}
                    </span>
                  </div>
                </div>

                {!isUserRead(comm) && (
                  <Button
                    size="sm"
                    className="text-xs h-7 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md"
                    onClick={() => handleMarkAsRead(comm.id)}
                  >
                    Segna come Letto
                  </Button>
                )}
              </div>
            ))}

            <Button
              size="sm"
              asChild
              className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border-0 shadow-lg"
            >
              <Link to="/communications">
                Vedi Tutte
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
