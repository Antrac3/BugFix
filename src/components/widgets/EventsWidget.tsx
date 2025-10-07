import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus, ArrowRight } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "react-router-dom";

export const EventsWidget = () => {
  const { events, loading, error } = useEvents();
  const { profile } = useAuth();

  const upcomingEvents = events
    .filter((event) => new Date(event.start_date) > new Date())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "full":
        return "bg-orange-100 text-orange-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      case "planning":
        return "Pianificazione";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prossimi Eventi</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle className="text-sm font-medium">Prossimi Eventi</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Errore nel caricamento eventi
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
    <Card className="fantasy-card fantasy-border-glow border-teal-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-teal-400" />
            <span>Prossimi Eventi</span>
            {upcomingEvents.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs border-teal-500/50 text-teal-400"
              >
                {upcomingEvents.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nessun evento in programma
            </p>
            {(profile?.role === "gm" || profile?.role === "admin") && (
              <Button size="sm" asChild>
                <Link to="/events">
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Evento
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-3 p-4 rounded-xl bg-slate-700/50 border border-slate-600/30 hover:bg-slate-700/70 hover:shadow-lg hover:border-emerald-500/40 transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-white text-sm line-clamp-1">
                    {event.title}
                  </h4>
                  <Badge className={`${getStatusColor(event.status)} text-xs`}>
                    {getStatusLabel(event.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>
                      {format(new Date(event.start_date), "PPP 'alle' HH:mm", {
                        locale: it,
                      })}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span className="truncate">{event.location.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>
                      {event.current_participants}
                      {event.max_participants &&
                        ` / ${event.max_participants}`}{" "}
                      partecipanti
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))}

            <Button
              size="sm"
              asChild
              className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border-0 shadow-lg"
            >
              <Link to="/events">
                Vedi Tutti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
