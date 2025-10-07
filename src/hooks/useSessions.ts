import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export interface Session {
  id: number;
  event_id: number;
  session_name: string;
  session_number?: number;
  start_time: string;
  end_time: string;
  location?: string;
  gm_id?: number;
  max_players?: number;
  current_players: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  session_type: "main" | "side" | "workshop" | "prologue" | "epilogue";
  description?: string;
  recap?: string;
  xp_awarded: number;
  created_at: string;
  updated_at: string;
  event?: {
    id: number;
    title: string;
  };
  gm?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: number;
  session_id: number;
  character_id: number;
  player_id: number;
  joined_at: string;
  status: "active" | "inactive" | "absent";
  role: "player" | "guest" | "npc";
  xp_earned: number;
  performance_notes?: string;
  character?: {
    id: number;
    name: string;
  };
  player?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface CreateSessionData {
  event_id: number;
  session_name: string;
  session_number?: number;
  start_time: string;
  end_time: string;
  location?: string;
  gm_id?: number;
  max_players?: number;
  session_type: "main" | "side" | "workshop" | "prologue" | "epilogue";
  description?: string;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  recap?: string;
  xp_awarded?: number;
}

export const useSessions = (eventId?: number) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("sessions")
        .select(
          `
          *,
          event:events(id, title),
          gm:profiles(id, first_name, last_name),
          participants:session_participants(
            id,
            character_id,
            player_id,
            joined_at,
            status,
            role,
            xp_earned,
            performance_notes,
            character:characters(id, name),
            player:profiles(id, first_name, last_name)
          )
        `,
        )
        .order("start_time", { ascending: true });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSessions(data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
      toast({
        title: "Errore",
        description: "Impossibile caricare le sessioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    sessionData: CreateSessionData,
  ): Promise<Session | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sessions")
        .insert([
          {
            ...sessionData,
            current_players: 0,
            status: "scheduled",
            xp_awarded: 0,
          },
        ])
        .select(
          `
          *,
          event:events(id, title),
          gm:profiles(id, first_name, last_name)
        `,
        )
        .single();

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Sessione creata con successo",
      });

      return data;
    } catch (err) {
      console.error("Error creating session:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error ? err.message : "Impossibile creare la sessione",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSession = async (
    id: number,
    sessionData: UpdateSessionData,
  ): Promise<Session | null> => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .update({
          ...sessionData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          event:events(id, title),
          gm:profiles(id, first_name, last_name)
        `,
        )
        .single();

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Sessione aggiornata con successo",
      });

      return data;
    } catch (err) {
      console.error("Error updating session:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile aggiornare la sessione",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSession = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Sessione eliminata con successo",
      });

      return true;
    } catch (err) {
      console.error("Error deleting session:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile eliminare la sessione",
        variant: "destructive",
      });
      return false;
    }
  };

  const joinSession = async (
    sessionId: number,
    characterId: number,
  ): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("session_participants").insert([
        {
          session_id: sessionId,
          character_id: characterId,
          player_id: user.id,
          status: "active",
          role: "player",
          xp_earned: 0,
        },
      ]);

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Partecipazione confermata",
      });

      return true;
    } catch (err) {
      console.error("Error joining session:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile unirsi alla sessione",
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveSession = async (sessionId: number): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("session_participants")
        .delete()
        .eq("session_id", sessionId)
        .eq("player_id", user.id);

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Hai lasciato la sessione",
      });

      return true;
    } catch (err) {
      console.error("Error leaving session:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile lasciare la sessione",
        variant: "destructive",
      });
      return false;
    }
  };

  const awardXP = async (
    participantId: number,
    xpAmount: number,
    notes?: string,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("session_participants")
        .update({
          xp_earned: xpAmount,
          performance_notes: notes,
        })
        .eq("id", participantId);

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: `${xpAmount} XP assegnati`,
      });

      return true;
    } catch (err) {
      console.error("Error awarding XP:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error ? err.message : "Impossibile assegnare XP",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateParticipantStatus = async (
    participantId: number,
    status: "active" | "inactive" | "absent",
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("session_participants")
        .update({ status })
        .eq("id", participantId);

      if (error) throw error;

      await fetchSessions();

      toast({
        title: "Successo",
        description: "Stato partecipante aggiornato",
      });

      return true;
    } catch (err) {
      console.error("Error updating participant status:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [eventId]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
    leaveSession,
    awardXP,
    updateParticipantStatus,
  };
};
