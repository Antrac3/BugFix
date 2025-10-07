import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";
import {
  checkAndSetupCampaignsTable,
  getDatabaseSetupInstructions,
} from "@/utils/database-setup";

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  genre?: string;
  setting?: string;
  max_players: number;
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert";
  start_date?: string;
  location?: string;
  game_system?: string;
  session_frequency:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "irregular"
    | "oneshot";
  duration: number;
  notes?: string;
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  created_by?: string;
  created_at: string;
  updated_at: string;
  organization_id?: number;
  // Derived/joined data
  player_count?: number;
  character_count?: number;
  event_count?: number;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  genre?: string;
  setting?: string;
  max_players?: number;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  start_date?: string;
  location?: string;
  game_system?: string;
  session_frequency?:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "irregular"
    | "oneshot";
  duration?: number;
  notes?: string;
  status?: "planning" | "active" | "paused" | "completed" | "cancelled";
}

const STORAGE_KEY = "larp_campaigns";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save to localStorage
  const saveToStorage = (data: Campaign[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  };

  // Cache to prevent excessive API calls
  const [lastFetch, setLastFetch] = useState<number>(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds

  const fetchCampaigns = async () => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    // Prevent excessive calls
    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetch(now);

      // Check if database is properly set up
      const setupCheck = await checkAndSetupCampaignsTable();
      if (!setupCheck.success) {
        // Handle different types of errors
        if (setupCheck.error === "NETWORK_ERROR") {
          // Network error - use localStorage immediately
          console.warn(
            "🌐 Network error detected, using localStorage fallback",
          );
          const localCampaigns = loadFromStorage();
          setCampaigns(localCampaigns);
          setError(null); // Don't show error for network issues
          return;
        }

        setError(setupCheck.message);
        setCampaigns([]);

        if (setupCheck.error === "MISSING_TABLE") {
          toast({
            title: "Database Non Configurato",
            description:
              "La tabella campaigns non esiste. Segui le istruzioni nella console.",
            variant: "destructive",
          });
          console.error("📋 ISTRUZIONI SETUP DATABASE:");
          console.error(getDatabaseSetupInstructions());
        }
        return;
      }

      // Try database first with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const { data, error: fetchError } = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error("❌ Database fetch failed:", fetchError);
          console.error("Error details:", JSON.stringify(fetchError, null, 2));

          const errorMessage =
            fetchError.message || fetchError.details || String(fetchError);
          console.error("Processed error message:", errorMessage);

          setError(`Errore database: ${errorMessage}`);
          setCampaigns([]);
          return;
        }

        console.log("✅ Campaigns fetched from database:", data?.length || 0);
        const processedCampaigns = (data || []).map((campaign) => ({
          ...campaign,
          player_count: 1, // Default for now
          character_count: 0,
          event_count: 0,
        }));

        setCampaigns(processedCampaigns);

        // Also save to localStorage as backup
        saveToStorage(processedCampaigns);
      } catch (timeoutError: any) {
        clearTimeout(timeoutId);
        console.warn(
          "❌ Database query timeout, using localStorage fallback:",
          timeoutError.message,
        );

        // Use localStorage on timeout
        const localCampaigns = loadFromStorage();
        setCampaigns(localCampaigns);
        setError(null);
        return;
      }
    } catch (err: any) {
      console.warn(
        "❌ Error fetching campaigns, using localStorage fallback:",
        err.message,
      );
      // Fallback to localStorage
      const localCampaigns = loadFromStorage();
      setCampaigns(localCampaigns);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (
    campaignData: CreateCampaignData,
  ): Promise<{ success: boolean; data?: Campaign; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const newCampaign: Campaign = {
        id: Date.now(),
        name: campaignData.name,
        description: campaignData.description || "",
        genre: campaignData.genre || "",
        setting: campaignData.setting || "",
        max_players: campaignData.max_players || 8,
        difficulty: campaignData.difficulty || "medium",
        start_date: campaignData.start_date || "",
        location: campaignData.location || "",
        game_system: campaignData.game_system || "",
        session_frequency: campaignData.session_frequency || "weekly",
        duration: campaignData.duration || 4,
        notes: campaignData.notes || "",
        status: "planning",
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization_id: undefined,
        player_count: 1,
        character_count: 0,
        event_count: 0,
      };

      // Try database first
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .insert([
            {
              ...campaignData,
              created_by: user.id,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          console.log("✅ Campaign created in database");
          await fetchCampaigns();

          toast({
            title: "Successo",
            description: "Campagna creata con successo nel database",
            variant: "default",
          });

          return {
            success: true,
            data: {
              ...data,
              player_count: 1,
              character_count: 0,
              event_count: 0,
            },
          };
        } else {
          throw error;
        }
      } catch (dbError: any) {
        console.error("❌ Database creation failed:", dbError);
        console.error("Full error details:", JSON.stringify(dbError, null, 2));
        console.error("Error type:", typeof dbError);
        console.error("Error keys:", Object.keys(dbError || {}));

        let errorMessage = "Errore sconosciuto";

        if (dbError.code === "42P01") {
          errorMessage =
            "La tabella 'campaigns' non esiste nel database. Esegui lo script campaigns_database_schema.sql in Supabase.";
        } else if (dbError.message) {
          errorMessage = `Errore database: ${dbError.message}`;
        } else if (dbError.details) {
          errorMessage = `Errore database: ${dbError.details}`;
        } else if (typeof dbError === "string") {
          errorMessage = `Errore database: ${dbError}`;
        } else {
          errorMessage = `Errore database: ${JSON.stringify(dbError)}`;
        }

        console.error("Final error message:", errorMessage);

        toast({
          title: "Errore Database",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error("❌ Error creating campaign:", errorMessage);

      toast({
        title: "Errore",
        description: `Impossibile creare la campagna: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const updateCampaign = async (
    id: number,
    updates: Partial<CreateCampaignData>,
  ): Promise<{ success: boolean; data?: Campaign; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Try database first
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .update(updateData)
          .eq("id", id)
          .eq("created_by", user.id)
          .select()
          .single();

        if (!error && data) {
          console.log("✅ Campaign updated in database");
          await fetchCampaigns();

          toast({
            title: "Successo",
            description: "Campagna aggiornata con successo nel database",
            variant: "default",
          });

          return {
            success: true,
            data: {
              ...data,
              player_count: data.player_count || 1,
              character_count: data.character_count || 0,
              event_count: data.event_count || 0,
            },
          };
        } else {
          throw error;
        }
      } catch (dbError: any) {
        console.error("❌ Database update failed:", dbError);
        console.error("Full error details:", JSON.stringify(dbError, null, 2));
        console.error("Error type:", typeof dbError);
        console.error("Error keys:", Object.keys(dbError || {}));

        let errorMessage = "Errore sconosciuto";

        if (dbError.code === "42P01") {
          errorMessage =
            "La tabella 'campaigns' non esiste nel database. Esegui lo script campaigns_database_schema.sql in Supabase.";
        } else if (dbError.message) {
          errorMessage = `Errore database: ${dbError.message}`;
        } else if (dbError.details) {
          errorMessage = `Errore database: ${dbError.details}`;
        } else if (typeof dbError === "string") {
          errorMessage = `Errore database: ${dbError}`;
        } else {
          errorMessage = `Errore database: ${JSON.stringify(dbError)}`;
        }

        console.error("Final error message:", errorMessage);

        toast({
          title: "Errore Database",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error("❌ Error updating campaign:", errorMessage);

      toast({
        title: "Errore",
        description: `Impossibile aggiornare la campagna: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const deleteCampaign = async (
    id: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingCampaigns = loadFromStorage();
      const updatedCampaigns = existingCampaigns.filter(
        (campaign: Campaign) => campaign.id !== id,
      );

      saveToStorage(updatedCampaigns);
      setCampaigns(updatedCampaigns);

      toast({
        title: "Successo",
        description: "Campagna eliminata con successo",
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      toast({
        title: "Errore",
        description: `Impossibile eliminare la campagna: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Placeholder functions for missing functionality
  const addPlayerToCampaign = async () => ({
    success: false,
    error: "Not implemented",
  });
  const removePlayerFromCampaign = async () => ({
    success: false,
    error: "Not implemented",
  });
  const getCampaignPlayers = async () => [];

  // Load campaigns on mount and user change
  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addPlayerToCampaign,
    removePlayerFromCampaign,
    getCampaignPlayers,
    refetch: fetchCampaigns,
  };
}
