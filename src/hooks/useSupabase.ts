import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";

type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;

// Generic hook for CRUD operations
export function useSupabaseCRUD<T extends TableName>(tableName: T) {
  const [data, setData] = useState<Tables[T]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Use different order columns based on table
      const orderColumn = tableName === "tasks" ? "created" : "created_at";

      const { data: result, error } = await supabase
        .from(tableName)
        .select("*")
        .order(orderColumn, { ascending: false });

      if (error) {
        throw error;
      }

      setData(result || []);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error(`Error fetching ${tableName}:`, errorMessage);
      console.error("Full error object:", err);
      setError(errorMessage);
      toast({
        title: "Errore",
        description: `Impossibile caricare i dati: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [tableName, user]);

  // Create item
  const create = async (
    item: Tables[T]["Insert"],
  ): Promise<{ success: boolean; data?: Tables[T]["Row"]; error?: string }> => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setData((prev) => [result, ...prev]);

      toast({
        title: "Successo",
        description: "Elemento creato con successo",
        variant: "default",
      });

      return { success: true, data: result };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error(`Error creating ${tableName}:`, errorMessage);
      console.error("Full error object:", err);

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  // Update item
  const update = async (
    id: number | string,
    updates: Tables[T]["Update"],
  ): Promise<{ success: boolean; data?: Tables[T]["Row"]; error?: string }> => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setData((prev) => prev.map((item) => (item.id === id ? result : item)));

      toast({
        title: "Successo",
        description: "Elemento aggiornato con successo",
        variant: "default",
      });

      return { success: true, data: result };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error(`Error updating ${tableName}:`, errorMessage);
      console.error("Full error object:", err);

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  // Delete item
  const remove = async (
    id: number | string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) {
        throw error;
      }

      setData((prev) => prev.filter((item) => item.id !== id));

      toast({
        title: "Successo",
        description: "Elemento eliminato con successo",
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error(`Error deleting ${tableName}:`, errorMessage);
      console.error("Full error object:", err);

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchData,
  };
}

// Specific hooks for each entity
export function useCharacters() {
  const crud = useSupabaseCRUD("characters");
  const { user } = useAuth();

  const awardXP = async (
    characterId: number,
    xpAmount: number,
    reason: string,
    sessionDate?: string,
  ) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Create XP award record
      const { error: xpError } = await supabase.from("xp_awards").insert({
        character_id: characterId,
        xp_amount: xpAmount,
        reason,
        awarded_by: user.id,
        session_date: sessionDate || null,
      });

      if (xpError) throw xpError;

      // Update character's total XP
      const character = crud.data.find((c) => c.id === characterId);
      if (character) {
        await crud.update(characterId, {
          xp: character.xp + xpAmount,
        });
      }

      toast({
        title: "PE Assegnati",
        description: `${xpAmount} PE assegnati per: ${reason}`,
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error awarding XP:", err);
      toast({
        title: "Errore",
        description: "Errore durante l'assegnazione PE",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    ...crud,
    awardXP,
  };
}

export function useMessages() {
  const crud = useSupabaseCRUD("messages");

  const markAsRead = async (messageId: number) => {
    try {
      const result = await crud.update(messageId, {
        is_read: true,
        read_at: new Date().toISOString(),
      });

      if (result.success) {
        console.log(`✅ Message ${messageId} marked as read`);
        // Forza il refresh dei dati
        await crud.refetch();
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to mark message ${messageId} as read:`, error);
      return { success: false, error: String(error) };
    }
  };

  const sendMessage = async (
    fromCharacter: string,
    toCharacter: string,
    content: string,
    toUserId: string,
    isInCharacter: boolean = true,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    // Validate required fields
    if (!fromCharacter?.trim()) {
      return { success: false, error: "From character is required" };
    }
    if (!toCharacter?.trim()) {
      return { success: false, error: "To character is required" };
    }
    if (!content?.trim()) {
      return { success: false, error: "Message content is required" };
    }
    if (!toUserId?.trim()) {
      return { success: false, error: "To user ID is required" };
    }

    return await crud.create({
      from_character: fromCharacter.trim(),
      to_character: toCharacter.trim(),
      content: content.trim(),
      from_user_id: user.id,
      to_user_id: toUserId.trim(),
      is_in_character: isInCharacter,
    });
  };

  return {
    ...crud,
    markAsRead,
    sendMessage,
  };
}

export function useNotifications() {
  const crud = useSupabaseCRUD("notifications");

  const markAsRead = async (notificationId: number) => {
    return await crud.update(notificationId, { read: true });
  };

  const markAllAsRead = async () => {
    const { user } = useAuth();
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      // Refetch data
      await crud.refetch();

      toast({
        title: "Successo",
        description: "Tutte le notifiche sono state segnate come lette",
        variant: "default",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const createNotification = async (
    userId: string,
    type: Database["public"]["Enums"]["notification_type"],
    title: string,
    content: string,
    category: string,
    priority: Database["public"]["Enums"]["notification_priority"] = "medium",
    actionRequired: boolean = false,
    relatedData?: any,
  ) => {
    return await crud.create({
      user_id: userId,
      type,
      title,
      content,
      sender: "Sistema",
      category,
      priority,
      action_required: actionRequired,
      related_data: relatedData,
    });
  };

  return {
    ...crud,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
}

export function useRules() {
  const crud = useSupabaseCRUD("rules");
  const { user } = useAuth();

  // Filter rules based on user permissions
  const visibleRules = crud.data.filter((rule) => {
    if (rule.visibility === "public") return true;
    if (user && ["admin", "gm"].includes(user.role)) return true;
    return false;
  });

  return {
    ...crud,
    data: visibleRules,
  };
}

// Real-time subscription hook
export function useRealtimeSubscription<T extends TableName>(
  tableName: T,
  callback?: (payload: any) => void,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload) => {
          console.log(`${tableName} changed:`, payload);
          if (callback) {
            callback(payload);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, callback]);
}

// Statistics hook
export function useStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch various statistics in parallel
        const [charactersCount, playersCount, messagesCount, rulesCount] =
          await Promise.all([
            supabase
              .from("characters")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("messages")
              .select("*", { count: "exact", head: true }),
            supabase.from("rules").select("*", { count: "exact", head: true }),
          ]);

        setStats({
          totalCharacters: charactersCount.count || 0,
          totalPlayers: playersCount.count || 0,
          totalMessages: messagesCount.count || 0,
          totalRules: rulesCount.count || 0,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
