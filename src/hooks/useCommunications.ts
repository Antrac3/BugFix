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

export interface Communication {
  id: number;
  title: string;
  content: string;
  type: "announcement" | "news" | "event" | "rule_update" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  target_audience:
    | "all"
    | "players"
    | "gms"
    | "admins"
    | "event_participants"
    | "custom";
  author_id?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  status: "draft" | "published" | "scheduled" | "expired";
  tags?: string[];
  event_id?: number;
  organization_id?: number;
  read_by?: string[];
  author?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  event?: {
    id: number;
    title: string;
  };
}

export interface CreateCommunicationData {
  title: string;
  content: string;
  type: "announcement" | "news" | "event" | "rule_update" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  target_audience:
    | "all"
    | "players"
    | "gms"
    | "admins"
    | "event_participants"
    | "custom";
  published_at?: string;
  expires_at?: string;
  tags?: string[];
  event_id?: number;
}

export interface UpdateCommunicationData
  extends Partial<CreateCommunicationData> {
  status?: "draft" | "published" | "scheduled" | "expired";
}

export const useCommunications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage helper
  const COMMUNICATIONS_STORAGE_KEY = "larp_communications";

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(COMMUNICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn("Could not load communications from localStorage:", err);
      return [];
    }
  };

  const saveToStorage = (commsData: Communication[]) => {
    try {
      localStorage.setItem(
        COMMUNICATIONS_STORAGE_KEY,
        JSON.stringify(commsData),
      );
    } catch (err) {
      console.warn("Could not save communications to localStorage:", err);
    }
  };

  // Cache to prevent excessive API calls
  const [lastCommsFetch, setLastCommsFetch] = useState<number>(0);
  const COMMS_FETCH_COOLDOWN = 15000; // 15 seconds

  const fetchCommunications = async () => {
    try {
      // Prevent excessive calls
      const now = Date.now();
      if (now - lastCommsFetch < COMMS_FETCH_COOLDOWN) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLastCommsFetch(now);

      // Try to fetch from database with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      console.log(
        "�� Communications fetched from database:",
        data?.length || 0,
      );
      setCommunications(data || []);
      saveToStorage(data || []);
    } catch (err: any) {
      console.warn(
        "⚠️ Database fetch failed, loading from localStorage:",
        err.message,
      );

      // Fallback to localStorage
      const localComms = loadFromStorage();
      setCommunications(localComms);

      // Only show error if localStorage is also empty
      if (localComms.length === 0) {
        const errorMessage = err.message?.includes("Failed to fetch")
          ? "Impossibile connettersi al server. Verifica la connessione internet."
          : extractErrorMessage(err);

        setError(errorMessage);
      } else {
        console.log(
          "📱 Loaded communications from localStorage:",
          localComms.length,
        );
        setError(null);
      }

      console.log("Communications query result:", { data, error });

      if (error) {
        console.error("Communications fetch error details:", error);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const createCommunication = async (
    commData: CreateCommunicationData,
  ): Promise<Communication | null> => {
    try {
      console.log("Creating communication with data:", commData);

      // Test database connection first
      console.log("Testing database connection...");
      const { error: testError } = await supabase
        .from("communications")
        .select("id")
        .limit(1);

      if (testError) {
        console.error("Database connection test failed:", testError);
        throw new Error(
          `Database connection failed: ${extractErrorMessage(testError)}`,
        );
      }

      console.log("Database connection test passed");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Current user:", user);

      if (!user) throw new Error("User not authenticated");

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      console.log("User profile:", profile, "Profile error:", profileError);

      if (profileError || !profile) {
        throw new Error(
          "User profile not found. Please contact administrator.",
        );
      }

      if (!["gm", "admin"].includes(profile.role)) {
        throw new Error("You don't have permission to create communications.");
      }

      const isPublished = commData.published_at
        ? new Date(commData.published_at) <= new Date()
        : false;

      const insertData = {
        ...commData,
        author_id: user.id,
        status: isPublished
          ? "published"
          : commData.published_at
            ? "scheduled"
            : "draft",
        read_by: [],
      };

      console.log("Insert data:", insertData);

      const { data, error } = await supabase
        .from("communications")
        .insert([insertData])
        .select("*")
        .single();

      console.log("Supabase response data:", data);
      console.log("Supabase response error:", error);

      if (error) throw error;

      await fetchCommunications();

      toast({
        title: "Successo",
        description: "Comunicazione creata con successo",
      });

      return data;
    } catch (err) {
      console.error("Raw error creating communication:", err);
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
        description: `Impossibile creare la comunicazione: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCommunication = async (
    id: number,
    commData: UpdateCommunicationData,
  ): Promise<Communication | null> => {
    try {
      const { data, error } = await supabase
        .from("communications")
        .update({
          ...commData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      await fetchCommunications();

      toast({
        title: "Successo",
        description: "Comunicazione aggiornata con successo",
      });

      return data;
    } catch (err) {
      console.error("Error updating communication:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile aggiornare la comunicazione",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteCommunication = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("communications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchCommunications();

      toast({
        title: "Successo",
        description: "Comunicazione eliminata con successo",
      });

      return true;
    } catch (err) {
      console.error("Error deleting communication:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile eliminare la comunicazione",
        variant: "destructive",
      });
      return false;
    }
  };

  const publishCommunication = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("communications")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await fetchCommunications();

      toast({
        title: "Successo",
        description: "Comunicazione pubblicata con successo",
      });

      return true;
    } catch (err) {
      console.error("Error publishing communication:", err);
      toast({
        title: "Errore",
        description:
          err instanceof Error
            ? err.message
            : "Impossibile pubblicare la comunicazione",
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsRead = async (id: number): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log(`📖 Marking communication ${id} as read for user ${user.id}`);

      // Get current communication
      const { data: comm, error: fetchError } = await supabase
        .from("communications")
        .select("read_by")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching communication:", fetchError);
        throw fetchError;
      }

      const readBy = comm.read_by || [];

      // Use user.id as UUID string instead of parsing to int
      if (!readBy.includes(user.id)) {
        const { error } = await supabase
          .from("communications")
          .update({
            read_by: [...readBy, user.id],
          })
          .eq("id", id);

        if (error) {
          console.error("Error updating read_by:", error);
          throw error;
        }

        console.log(`✅ Communication ${id} marked as read`);
        await fetchCommunications();
      } else {
        console.log(`ℹ️ Communication ${id} already marked as read`);
      }

      return true;
    } catch (err) {
      console.error("❌ Error marking communication as read:", err);
      return false;
    }
  };

  const getUnreadCount = (userId: string): number => {
    return communications.filter(
      (comm) =>
        comm.status === "published" &&
        (!comm.read_by || !comm.read_by.includes(userId)),
    ).length;
  };

  const getPublishedCommunications = (): Communication[] => {
    return communications.filter(
      (comm) =>
        comm.status === "published" &&
        (!comm.expires_at || new Date(comm.expires_at) > new Date()),
    );
  };

  const getCommunicationsByType = (
    type: Communication["type"],
  ): Communication[] => {
    return getPublishedCommunications().filter((comm) => comm.type === type);
  };

  const getCommunicationsByPriority = (
    priority: Communication["priority"],
  ): Communication[] => {
    return getPublishedCommunications().filter(
      (comm) => comm.priority === priority,
    );
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  return {
    communications,
    loading,
    error,
    fetchCommunications,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    publishCommunication,
    markAsRead,
    getUnreadCount,
    getPublishedCommunications,
    getCommunicationsByType,
    getCommunicationsByPriority,
  };
};
