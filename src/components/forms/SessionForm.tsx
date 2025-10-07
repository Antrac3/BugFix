import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Users, User, MapPin, BookOpen } from "lucide-react";
import {
  CreateSessionData,
  UpdateSessionData,
  Session,
} from "@/hooks/useSessions";
import { supabase } from "@/lib/supabase";

interface SessionFormProps {
  eventId?: number;
  session?: Session;
  onSubmit: (data: CreateSessionData | UpdateSessionData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Event {
  id: number;
  title: string;
}

interface Profile {
  id: number;
  first_name: string;
  last_name: string;
}

export const SessionForm = ({
  eventId,
  session,
  onSubmit,
  onCancel,
  isLoading = false,
}: SessionFormProps) => {
  const [formData, setFormData] = useState<CreateSessionData>({
    event_id: eventId || session?.event_id || 0,
    session_name: session?.session_name || "",
    session_number: session?.session_number || undefined,
    start_time: session?.start_time?.slice(0, 16) || "",
    end_time: session?.end_time?.slice(0, 16) || "",
    location: session?.location || "",
    gm_id: session?.gm_id || undefined,
    max_players: session?.max_players || undefined,
    session_type: session?.session_type || "main",
    description: session?.description || "",
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [gameMasters, setGameMasters] = useState<Profile[]>([]);

  useEffect(() => {
    if (!eventId) {
      fetchEvents();
    }
    fetchGameMasters();
  }, [eventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .in("status", ["planning", "open", "in_progress"])
        .order("start_date");

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchGameMasters = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("role", ["gm", "admin"])
        .order("first_name");

      if (error) throw error;
      setGameMasters(data || []);
    } catch (error) {
      console.error("Error fetching game masters:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateSessionData,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.session_name.trim()) {
      return;
    }

    if (!formData.event_id) {
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="session_name" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Nome Sessione *
            </Label>
            <Input
              id="session_name"
              value={formData.session_name}
              onChange={(e) =>
                handleInputChange("session_name", e.target.value)
              }
              placeholder="Nome della sessione"
              required
            />
          </div>

          {!eventId && (
            <div>
              <Label htmlFor="event_id">Evento *</Label>
              <Select
                value={formData.event_id.toString()}
                onValueChange={(value) =>
                  handleInputChange("event_id", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_number">Numero Sessione</Label>
              <Input
                id="session_number"
                type="number"
                min="1"
                value={formData.session_number || ""}
                onChange={(e) =>
                  handleInputChange(
                    "session_number",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                placeholder="Es. 1"
              />
            </div>

            <div>
              <Label htmlFor="session_type">Tipo Sessione</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) =>
                  handleInputChange(
                    "session_type",
                    value as
                      | "main"
                      | "side"
                      | "workshop"
                      | "prologue"
                      | "epilogue",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Principale</SelectItem>
                  <SelectItem value="side">Secondaria</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="prologue">Prologo</SelectItem>
                  <SelectItem value="epilogue">Epilogo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrizione della sessione..."
              rows={4}
            />
          </div>
        </div>

        {/* Time and Location */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ora Inizio *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  handleInputChange("start_time", e.target.value)
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="end_time">Ora Fine *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Dove si svolge la sessione"
            />
          </div>

          <div>
            <Label htmlFor="gm_id" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Game Master
            </Label>
            <Select
              value={formData.gm_id?.toString() || ""}
              onValueChange={(value) =>
                handleInputChange("gm_id", value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un GM" />
              </SelectTrigger>
              <SelectContent>
                {gameMasters.map((gm) => (
                  <SelectItem key={gm.id} value={gm.id.toString()}>
                    {gm.first_name} {gm.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="max_players" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Massimo Giocatori
            </Label>
            <Input
              id="max_players"
              type="number"
              min="1"
              max="20"
              value={formData.max_players || ""}
              onChange={(e) =>
                handleInputChange(
                  "max_players",
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              placeholder="Nessun limite"
            />
          </div>
        </div>
      </div>

      {/* Additional Fields for Updates */}
      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <Label htmlFor="status">Stato Sessione</Label>
            <Select
              value={session.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programmata</SelectItem>
                <SelectItem value="in_progress">In Corso</SelectItem>
                <SelectItem value="completed">Completata</SelectItem>
                <SelectItem value="cancelled">Cancellata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="xp_awarded">XP Assegnati</Label>
            <Input
              id="xp_awarded"
              type="number"
              min="0"
              value={(formData as any).xp_awarded || session.xp_awarded || 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  xp_awarded: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="lg:col-span-2">
            <Label htmlFor="recap">Recap Sessione</Label>
            <Textarea
              id="recap"
              value={(formData as any).recap || session.recap || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recap: e.target.value,
                }))
              }
              placeholder="Riassunto di quello che è successo nella sessione..."
              rows={6}
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Salvando..."
            : session
              ? "Aggiorna Sessione"
              : "Crea Sessione"}
        </Button>
      </div>
    </form>
  );
};
