import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Utility function to extract meaningful error information
const extractErrorMessage = (error: any): string => {
  if (!error) return "Unknown error";

  // Try different common error properties
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error?.message) return error.error.message;
  if (error.details) return error.details;
  if (error.hint) return error.hint;
  if (error.code) return `Error code: ${error.code}`;

  // For PostgreSQL errors
  if (error.sqlState)
    return `SQL Error (${error.sqlState}): ${error.message || "Unknown SQL error"}`;

  // Try to stringify but handle circular references
  try {
    return JSON.stringify(
      error,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (key === "stack" || key === "trace") return "[Stack Trace]";
          if (
            typeof value.toString === "function" &&
            value.toString !== Object.prototype.toString
          ) {
            return value.toString();
          }
        }
        return value;
      },
      2,
    );
  } catch {
    return error.toString?.() || String(error) || "Unparseable error object";
  }
};

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: "session" | "convention" | "workshop" | "social";
  start_date: string;
  end_date: string;
  location_id?: number;
  max_participants?: number;
  current_participants: number;
  registration_deadline?: string;
  status:
    | "planning"
    | "open"
    | "full"
    | "in_progress"
    | "completed"
    | "cancelled";
  visibility: "public" | "private" | "members_only";
  requires_approval: boolean;
  entry_fee: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  requirements?: string;
  materials_needed?: string[];
  notes?: string;
  cancellation_reason?: string;
  organization_id?: number;
  location?: {
    id: number;
    name: string;
    address: string;
  };
  registrations?: EventRegistration[];
}

export interface EventRegistration {
  id: number;
  event_id: number;
  player_id: number;
  character_id?: number;
  registration_date: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  notes?: string;
  checked_in: boolean;
  check_in_time?: string;
  player?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  character?: {
    id: number;
    name: string;
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: "session" | "convention" | "workshop" | "social";
  start_date: string;
  end_date: string;
  location_id?: number;
  max_participants?: number;
  registration_deadline?: string;
  visibility: "public" | "private" | "members_only";
  requires_approval: boolean;
  entry_fee: number;
  tags?: string[];
  requirements?: string;
  materials_needed?: string[];
  notes?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?:
    | "planning"
    | "open"
    | "full"
    | "in_progress"
    | "completed"
    | "cancelled";
  cancellation_reason?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage helper
  const EVENTS_STORAGE_KEY = "larp_events";

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn("Could not load events from localStorage:", err);
      return [];
    }
  };

  const saveToStorage = (eventsData: Event[]) => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsData));
    } catch (err) {
      console.warn("Could not save events to localStorage:", err);
    }
  };

  // Cache to prevent excessive API calls
  const [lastEventsFetch, setLastEventsFetch] = useState<number>(0);
  const EVENTS_FETCH_COOLDOWN = 10000; // 10 seconds

  const fetchEvents = async () => {
    try {
      // Prevent excessive calls
      const now = Date.now();
      if (now - lastEventsFetch < EVENTS_FETCH_COOLDOWN) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLastEventsFetch(now);

      // Try to fetch from database with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      console.log("✅ Events fetched from database:", data?.length || 0);
      setEvents(data || []);
      saveToStorage(data || []);
    } catch (err: any) {
      console.warn(
        "⚠️ Database fetch failed, loading from localStorage:",
        err.message,
      );

      // Fallback to localStorage
      const localEvents = loadFromStorage();
      setEvents(localEvents);

      // Only show error if localStorage is also empty
      if (localEvents.length === 0) {
        const errorMessage = err.message?.includes("Failed to fetch")
          ? "Impossibile connettersi al server. Verifica la connessione internet."
          : extractErrorMessage(err);

        setError(errorMessage);
      } else {
        console.log("📱 Loaded events from localStorage:", localEvents.length);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    eventData: CreateEventData,
  ): Promise<Event | null> => {
    try {
      console.log("🔧 Creating event:", eventData.title);

      // Try database first
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
          .from("events")
          .insert([{ ...eventData, created_by: user.id }])
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log("✅ Event created in database");
        await fetchEvents(); // Refresh events list

        toast({
          title: "Successo",
          description: "Evento creato con successo",
          variant: "default",
        });

        return data;
      } catch (dbError: any) {
        console.warn(
          "⚠️ Database creation failed, using localStorage:",
          dbError.message,
        );

        // Fallback to localStorage
        const newEvent: Event = {
          id: Date.now(),
          title: eventData.title,
          description: eventData.description || "",
          event_type: eventData.event_type,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          location_id: eventData.location_id,
          max_participants: eventData.max_participants,
          current_participants: 0,
          registration_deadline: eventData.registration_deadline,
          status: "planning",
          visibility: eventData.visibility,
          requires_approval: eventData.requires_approval,
          entry_fee: eventData.entry_fee,
          tags: eventData.tags || [],
          requirements: eventData.requirements,
          materials_needed: eventData.materials_needed || [],
          notes: eventData.notes,
          created_by: "local-user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const currentEvents = loadFromStorage();
        const updatedEvents = [newEvent, ...currentEvents];

        saveToStorage(updatedEvents);
        setEvents(updatedEvents);

        toast({
          title: "Evento Creato",
          description:
            "Evento salvato localmente. Sarà sincronizzato quando il database sarà disponibile.",
          variant: "default",
        });

        return newEvent;
      }

      if (profileError || !profile) {
        throw new Error(
          "User profile not found. Please contact administrator.",
        );
      }

      if (!["gm", "admin"].includes(profile.role)) {
        throw new Error(
          "You don't have permission to create events. Required role: GM or Admin.",
        );
      }

      // If location_id is provided, verify it exists
      if (eventData.location_id) {
        console.log(
          "Checking location existence for ID:",
          eventData.location_id,
        );
        const { data: location, error: locationError } = await supabase
          .from("locations")
          .select("id")
          .eq("id", eventData.location_id)
          .single();

        if (locationError || !location) {
          console.error("Location check failed:", locationError);
          throw new Error(
            `Selected location not found (ID: ${eventData.location_id})`,
          );
        }
        console.log("Location check passed");
      }

      const insertData = {
        ...eventData,
        created_by: user.id,
        current_participants: 0,
        status: "planning",
      };

      console.log("Final insert data:", insertData);

      const { data, error } = await supabase
        .from("events")
        .insert([insertData])
        .select("*")
        .single();

      console.log("Supabase response data:", data);
      console.log("Supabase response error:", error);

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Evento creato con successo",
      });

      return data;
    } catch (err) {
      console.error("Raw error creating event:", err);
      console.error("Error type:", typeof err);
      console.error("Error constructor:", err?.constructor?.name);

      // Try to extract specific properties
      console.error("Error properties:");
      console.error("- message:", err?.message);
      console.error("- code:", err?.code);
      console.error("- details:", err?.details);
      console.error("- hint:", err?.hint);
      console.error("- error.message:", err?.error?.message);

      const errorMessage = extractErrorMessage(err);
      console.error("Extracted error message:", errorMessage);

      toast({
        title: "Errore",
        description: `Impossibile creare l'evento: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEvent = async (
    id: number,
    eventData: UpdateEventData,
  ): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from("events")
        .update({
          ...eventData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Evento aggiornato con successo",
      });

      return data;
    } catch (err) {
      console.error("Error updating event:", err);
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      toast({
        title: "Errore",
        description: `Impossibile aggiornare l'evento: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteEvent = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Evento eliminato con successo",
      });

      return true;
    } catch (err) {
      console.error("Error deleting event:", err);
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      toast({
        title: "Errore",
        description: `Impossibile eliminare l'evento: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const registerForEvent = async (
    eventId: number,
    characterId?: number,
  ): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("event_registrations").insert([
        {
          event_id: eventId,
          player_id: user.id,
          character_id: characterId,
          status: "pending",
          payment_status: "pending",
        },
      ]);

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Registrazione effettuata con successo",
      });

      return true;
    } catch (err) {
      console.error("Error registering for event:", err);
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      toast({
        title: "Errore",
        description: `Impossibile registrarsi all'evento: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelRegistration = async (eventId: number): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("player_id", user.id);

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Registrazione cancellata con successo",
      });

      return true;
    } catch (err) {
      console.error("Error cancelling registration:", err);
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      toast({
        title: "Errore",
        description: `Impossibile cancellare la registrazione: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const checkInParticipant = async (
    registrationId: number,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({
          checked_in: true,
          check_in_time: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (error) throw error;

      await fetchEvents();

      toast({
        title: "Successo",
        description: "Check-in effettuato con successo",
      });

      return true;
    } catch (err) {
      console.error("Error checking in participant:", err);
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      toast({
        title: "Errore",
        description: `Impossibile effettuare il check-in: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    checkInParticipant,
  };
};
