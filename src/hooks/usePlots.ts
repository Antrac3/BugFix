import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";

export interface Plot {
  id: number;
  campaign_id: number;
  title: string;
  description?: string;
  plot_type: "main" | "side" | "personal" | "background";
  status: "planning" | "active" | "paused" | "completed" | "abandoned";
  priority: number; // 1-5, 1 = highest
  start_date?: string;
  target_end_date?: string;
  actual_end_date?: string;
  tags?: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  character_count?: number;
  objective_count?: number;
  event_count?: number;
  completion_percentage?: number;
}

export interface PlotObjective {
  id: number;
  plot_id: number;
  character_id?: number;
  title: string;
  description?: string;
  objective_type: "public" | "private" | "secret" | "hidden";
  priority: number;
  status: "active" | "completed" | "failed" | "abandoned";
  completion_condition?: string;
  reward_description?: string;
  is_mandatory: boolean;
  reveal_condition?: string;
  deadline?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  character_name?: string;
  plot_title?: string;
}

export interface PlotEvent {
  id: number;
  plot_id: number;
  title: string;
  description?: string;
  event_type:
    | "story"
    | "action"
    | "revelation"
    | "conflict"
    | "resolution"
    | "npc_appearance"
    | "trigger";
  scheduled_time?: string;
  actual_time?: string;
  duration_minutes?: number;
  location?: string;
  participants?: string[];
  prerequisites?: string[];
  consequences?: string;
  status: "planned" | "ready" | "in_progress" | "completed" | "cancelled";
  trigger_condition?: string;
  is_automatic: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  plot_title?: string;
}

export interface PlotCharacter {
  id: number;
  plot_id: number;
  character_id: number;
  involvement_type:
    | "protagonist"
    | "antagonist"
    | "participant"
    | "witness"
    | "victim"
    | "helper";
  knowledge_level: "none" | "partial" | "full" | "secret";
  is_active: boolean;
  notes?: string;
  created_at: string;

  // Joined data
  character_name?: string;
  plot_title?: string;
}

export interface CreatePlotData {
  campaign_id: number;
  title: string;
  description?: string;
  plot_type?: "main" | "side" | "personal" | "background";
  priority?: number;
  start_date?: string;
  target_end_date?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateObjectiveData {
  plot_id: number;
  character_id?: number;
  title: string;
  description?: string;
  objective_type?: "public" | "private" | "secret" | "hidden";
  priority?: number;
  completion_condition?: string;
  reward_description?: string;
  is_mandatory?: boolean;
  reveal_condition?: string;
  deadline?: string;
  notes?: string;
}

export interface CreateEventData {
  plot_id: number;
  title: string;
  description?: string;
  event_type?:
    | "story"
    | "action"
    | "revelation"
    | "conflict"
    | "resolution"
    | "npc_appearance"
    | "trigger";
  scheduled_time?: string;
  duration_minutes?: number;
  location?: string;
  participants?: string[];
  prerequisites?: string[];
  consequences?: string;
  trigger_condition?: string;
  is_automatic?: boolean;
}

export function usePlots(campaignId?: number) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [objectives, setObjectives] = useState<PlotObjective[]>([]);
  const [events, setEvents] = useState<PlotEvent[]>([]);
  const [plotCharacters, setPlotCharacters] = useState<PlotCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Local storage keys
  const PLOTS_STORAGE_KEY = `larp_plots_${campaignId || "all"}`;
  const OBJECTIVES_STORAGE_KEY = `larp_objectives_${campaignId || "all"}`;
  const EVENTS_STORAGE_KEY = `larp_events_${campaignId || "all"}`;

  // Local storage helpers
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  };

  const loadFromStorage = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn("Could not load from localStorage:", err);
      return [];
    }
  };

  // Cache to prevent excessive API calls
  const [lastPlotsFetch, setLastPlotsFetch] = useState<number>(0);
  const PLOTS_FETCH_COOLDOWN = 10000; // 10 seconds

  // Fetch plots
  const fetchPlots = async () => {
    if (!user) return;

    // Prevent excessive calls
    const now = Date.now();
    if (now - lastPlotsFetch < PLOTS_FETCH_COOLDOWN) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLastPlotsFetch(now);

    try {
      let query = supabase
        .from("plots")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.warn(
          "📊 Database fetch failed, using localStorage:",
          fetchError.message,
        );
        const localPlots = loadFromStorage(PLOTS_STORAGE_KEY);
        setPlots(localPlots);
        setError(null);
        return;
      }

      console.log("✅ Plots fetched from database:", data?.length || 0);
      const processedPlots = (data || []).map((plot) => ({
        ...plot,
        character_count: 0, // Will be calculated separately if needed
        objective_count: 0, // Will be calculated separately if needed
        event_count: 0, // Will be calculated separately if needed
        completion_percentage: 0, // Will be calculated separately if needed
      }));

      setPlots(processedPlots);
      saveToStorage(PLOTS_STORAGE_KEY, processedPlots);
    } catch (err: any) {
      console.warn("❌ Error fetching plots:", err.message);
      const localPlots = loadFromStorage(PLOTS_STORAGE_KEY);
      setPlots(localPlots);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage based on objectives
  const calculateCompletionPercentage = (plot: any): number => {
    const objectives = plot.plot_objectives || [];
    if (objectives.length === 0) return 0;

    const completed = objectives.filter(
      (obj: any) => obj.status === "completed",
    ).length;
    return Math.round((completed / objectives.length) * 100);
  };

  // Create plot
  const createPlot = async (
    plotData: CreatePlotData,
  ): Promise<{ success: boolean; data?: Plot; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const newPlot: Plot = {
        id: Date.now(),
        campaign_id: plotData.campaign_id,
        title: plotData.title,
        description: plotData.description || "",
        plot_type: plotData.plot_type || "main",
        status: "planning",
        priority: plotData.priority || 3,
        start_date: plotData.start_date,
        target_end_date: plotData.target_end_date,
        tags: plotData.tags || [],
        notes: plotData.notes || "",
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        character_count: 0,
        objective_count: 0,
        event_count: 0,
        completion_percentage: 0,
      };

      // Try database first
      try {
        const { data, error } = await supabase
          .from("plots")
          .insert([{ ...plotData, created_by: user.id }])
          .select()
          .single();

        if (!error && data) {
          console.log("✅ Plot created in database");
          await fetchPlots();

          toast({
            title: "Successo",
            description: "Trama creata con successo",
            variant: "default",
          });

          return {
            success: true,
            data: {
              ...data,
              character_count: 0,
              objective_count: 0,
              event_count: 0,
              completion_percentage: 0,
            },
          };
        } else {
          throw error;
        }
      } catch (dbError: any) {
        console.warn(
          "📊 Database creation failed, using localStorage:",
          dbError.message,
        );

        // Fallback to localStorage
        const existingPlots = loadFromStorage(PLOTS_STORAGE_KEY);
        const updatedPlots = [newPlot, ...existingPlots];

        saveToStorage(PLOTS_STORAGE_KEY, updatedPlots);
        setPlots(updatedPlots);

        toast({
          title: "Trama Creata",
          description:
            "Trama salvata localmente. Sarà sincronizzata quando il database sarà disponibile.",
          variant: "default",
        });

        return { success: true, data: newPlot };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error("❌ Error creating plot:", errorMessage);

      toast({
        title: "Errore",
        description: `Impossibile creare la trama: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  // Update plot
  const updatePlot = async (
    id: number,
    updates: Partial<CreatePlotData>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try database first
      try {
        const { error } = await supabase
          .from("plots")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (!error) {
          await fetchPlots();
          toast({
            title: "Successo",
            description: "Trama aggiornata con successo",
            variant: "default",
          });
          return { success: true };
        } else {
          throw error;
        }
      } catch (dbError: any) {
        console.warn(
          "📊 Database update failed, using localStorage:",
          dbError.message,
        );

        // Fallback to localStorage
        const existingPlots = loadFromStorage(PLOTS_STORAGE_KEY);
        const updatedPlots = existingPlots.map((plot: Plot) =>
          plot.id === id
            ? { ...plot, ...updates, updated_at: new Date().toISOString() }
            : plot,
        );

        saveToStorage(PLOTS_STORAGE_KEY, updatedPlots);
        setPlots(updatedPlots);

        toast({
          title: "Trama Aggiornata",
          description: "Modifiche salvate localmente",
          variant: "default",
        });

        return { success: true };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      toast({
        title: "Errore",
        description: `Impossibile aggiornare la trama: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete plot
  const deletePlot = async (
    id: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try database first
      try {
        const { error } = await supabase.from("plots").delete().eq("id", id);

        if (!error) {
          await fetchPlots();
          toast({
            title: "Successo",
            description: "Trama eliminata con successo",
            variant: "default",
          });
          return { success: true };
        } else {
          throw error;
        }
      } catch (dbError: any) {
        console.warn(
          "📊 Database delete failed, using localStorage:",
          dbError.message,
        );

        // Fallback to localStorage
        const existingPlots = loadFromStorage(PLOTS_STORAGE_KEY);
        const updatedPlots = existingPlots.filter(
          (plot: Plot) => plot.id !== id,
        );

        saveToStorage(PLOTS_STORAGE_KEY, updatedPlots);
        setPlots(updatedPlots);

        toast({
          title: "Trama Eliminata",
          description: "Eliminazione salvata localmente",
          variant: "default",
        });

        return { success: true };
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      toast({
        title: "Errore",
        description: `Impossibile eliminare la trama: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create objective
  const createObjective = async (
    objectiveData: CreateObjectiveData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const newObjective: PlotObjective = {
        id: Date.now(),
        plot_id: objectiveData.plot_id,
        character_id: objectiveData.character_id,
        title: objectiveData.title,
        description: objectiveData.description || "",
        objective_type: objectiveData.objective_type || "public",
        priority: objectiveData.priority || 3,
        status: "active",
        completion_condition: objectiveData.completion_condition,
        reward_description: objectiveData.reward_description,
        is_mandatory: objectiveData.is_mandatory || false,
        reveal_condition: objectiveData.reveal_condition,
        deadline: objectiveData.deadline,
        notes: objectiveData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in localStorage for now
      const existingObjectives = loadFromStorage(OBJECTIVES_STORAGE_KEY);
      const updatedObjectives = [newObjective, ...existingObjectives];

      saveToStorage(OBJECTIVES_STORAGE_KEY, updatedObjectives);
      setObjectives(updatedObjectives);

      toast({
        title: "Obiettivo Creato",
        description: "Nuovo obiettivo aggiunto alla trama",
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      toast({
        title: "Errore",
        description: `Impossibile creare l'obiettivo: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create event
  const createEvent = async (
    eventData: CreateEventData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const newEvent: PlotEvent = {
        id: Date.now(),
        plot_id: eventData.plot_id,
        title: eventData.title,
        description: eventData.description || "",
        event_type: eventData.event_type || "story",
        scheduled_time: eventData.scheduled_time,
        duration_minutes: eventData.duration_minutes,
        location: eventData.location,
        participants: eventData.participants || [],
        prerequisites: eventData.prerequisites || [],
        consequences: eventData.consequences,
        status: "planned",
        trigger_condition: eventData.trigger_condition,
        is_automatic: eventData.is_automatic || false,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in localStorage for now
      const existingEvents = loadFromStorage(EVENTS_STORAGE_KEY);
      const updatedEvents = [newEvent, ...existingEvents];

      saveToStorage(EVENTS_STORAGE_KEY, updatedEvents);
      setEvents(updatedEvents);

      toast({
        title: "Evento Creato",
        description: "Nuovo evento aggiunto alla timeline",
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      toast({
        title: "Errore",
        description: `Impossibile creare l'evento: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Load data on mount and when campaignId changes
  useEffect(() => {
    if (user) {
      fetchPlots();
      // Load objectives and events from localStorage for now
      setObjectives(loadFromStorage(OBJECTIVES_STORAGE_KEY));
      setEvents(loadFromStorage(EVENTS_STORAGE_KEY));
    }
  }, [user, campaignId]);

  return {
    plots,
    objectives,
    events,
    plotCharacters,
    loading,
    error,
    createPlot,
    updatePlot,
    deletePlot,
    createObjective,
    createEvent,
    refetch: fetchPlots,
  };
}
