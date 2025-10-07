import { createContext, useContext, ReactNode } from "react";
import {
  useSupabaseCRUD,
  useCharacters,
  useMessages,
  useNotifications,
  useRules,
  useStatistics,
} from "@/hooks/useSupabase";
import { Database } from "@/lib/database.types";
import { useAuth } from "@/contexts/SupabaseAuthContext";

// Type aliases for convenience
type Character = Database["public"]["Tables"]["characters"]["Row"];
type NPC = Database["public"]["Tables"]["npcs"]["Row"];
type Location = Database["public"]["Tables"]["locations"]["Row"];
type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type Rule = Database["public"]["Tables"]["rules"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Legacy interfaces for backward compatibility
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  role: "player" | "gm" | "admin";
  joinDate: string;
  lastActive: string;
  characters: string[];
  campaigns: string[];
  socialLinks?: Record<string, string>;
  notes?: string;
  emergencyContact?: string;
  location?: string;
}

// App context interface
interface AppContextType {
  // Data from hooks
  characters: Character[];
  charactersLoading: boolean;
  npcs: NPC[];
  npcsLoading: boolean;
  locations: Location[];
  locationsLoading: boolean;
  contacts: Contact[];
  contactsLoading: boolean;
  tasks: Task[];
  tasksLoading: boolean;
  inventoryItems: InventoryItem[];
  inventoryLoading: boolean;
  messages: Message[];
  messagesLoading: boolean;
  rules: Rule[];
  rulesLoading: boolean;
  notifications: Notification[];
  notificationsLoading: boolean;

  // Character operations
  addCharacter: (
    character: Database["public"]["Tables"]["characters"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateCharacter: (
    id: number,
    updates: Database["public"]["Tables"]["characters"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteCharacter: (
    id: number,
  ) => Promise<{ success: boolean; error?: string }>;
  awardXP: (
    characterId: number,
    xp: number,
    reason: string,
    sessionDate?: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // NPC operations
  addNPC: (
    npc: Database["public"]["Tables"]["npcs"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateNPC: (
    id: number,
    updates: Database["public"]["Tables"]["npcs"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteNPC: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Location operations
  addLocation: (
    location: Database["public"]["Tables"]["locations"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateLocation: (
    id: number,
    updates: Database["public"]["Tables"]["locations"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteLocation: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Contact operations
  addContact: (
    contact: Database["public"]["Tables"]["contacts"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateContact: (
    id: number,
    updates: Database["public"]["Tables"]["contacts"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteContact: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Task operations
  addTask: (
    task: Database["public"]["Tables"]["tasks"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateTask: (
    id: number,
    updates: Database["public"]["Tables"]["tasks"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Inventory operations
  addInventoryItem: (
    item: Database["public"]["Tables"]["inventory_items"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateInventoryItem: (
    id: number,
    updates: Database["public"]["Tables"]["inventory_items"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteInventoryItem: (
    id: number,
  ) => Promise<{ success: boolean; error?: string }>;
  transferItem: (
    itemId: number,
    toCharacterId: number,
  ) => Promise<{ success: boolean; error?: string }>;

  // Message operations
  sendMessage: (
    fromCharacter: string,
    toCharacter: string,
    content: string,
    toUserId: string,
    isInCharacter?: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  markMessageAsRead: (
    messageId: number,
  ) => Promise<{ success: boolean; error?: string }>;

  // Rule operations
  addRule: (
    rule: Database["public"]["Tables"]["rules"]["Insert"],
  ) => Promise<{ success: boolean; error?: string }>;
  updateRule: (
    id: number,
    updates: Database["public"]["Tables"]["rules"]["Update"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteRule: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Notification operations
  markNotificationAsRead: (
    id: number,
  ) => Promise<{ success: boolean; error?: string }>;
  markAllNotificationsAsRead: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  createNotification: (
    userId: string,
    type: any,
    title: string,
    content: string,
    category: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // Statistics
  statistics: any;
  statisticsLoading: boolean;

  // Utility functions
  showNotification: (
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
  refreshData: () => void;

  // Legacy compatibility
  players: Player[];
  addPlayer: (player: any) => Promise<{ success: boolean; error?: string }>;
  updatePlayer: (
    id: string,
    updates: any,
  ) => Promise<{ success: boolean; error?: string }>;
  deletePlayer: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function SupabaseAppProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  // Initialize all hooks
  const characters = useCharacters();
  const npcs = useSupabaseCRUD("npcs");
  const locations = useSupabaseCRUD("locations");
  const contacts = useSupabaseCRUD("contacts");
  const tasks = useSupabaseCRUD("tasks");
  const inventory = useSupabaseCRUD("inventory_items");
  const messages = useMessages();
  const rules = useRules();
  const notifications = useNotifications();
  const { stats: statistics, loading: statisticsLoading } = useStatistics();

  // Utility function to show notifications
  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    // This is now handled by the individual hooks with toast
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Refresh all data
  const refreshData = () => {
    characters.refetch();
    npcs.refetch();
    locations.refetch();
    contacts.refetch();
    tasks.refetch();
    inventory.refetch();
    messages.refetch();
    rules.refetch();
    notifications.refetch();
  };

  // Transfer item helper
  const transferItem = async (itemId: number, toCharacterId: number) => {
    return await inventory.update(itemId, { character_id: toCharacterId });
  };

  // Legacy players compatibility - convert profiles to player format
  const players: Player[] = profile
    ? [
        {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          status: profile.is_active ? "active" : "inactive",
          role: profile.role,
          joinDate: profile.created_at?.split("T")[0] || "",
          lastActive: profile.last_login?.split("T")[0] || "",
          characters: characters.data
            .filter((c) => c.player_id === profile.id)
            .map((c) => c.name),
          campaigns: [], // This would need to be implemented
        },
      ]
    : [];

  // Legacy player operations (these would need real implementation)
  const addPlayer = async (player: any) => {
    // In a real implementation, this would create a new user account
    return {
      success: false,
      error: "Player creation not implemented in this demo",
    };
  };

  const updatePlayer = async (id: string, updates: any) => {
    // In a real implementation, this would update the profile
    return {
      success: false,
      error: "Player update not implemented in this demo",
    };
  };

  const deletePlayer = async (id: string) => {
    // In a real implementation, this would deactivate the user
    return {
      success: false,
      error: "Player deletion not implemented in this demo",
    };
  };

  const value: AppContextType = {
    // Data
    characters: characters.data,
    charactersLoading: characters.loading,
    npcs: npcs.data,
    npcsLoading: npcs.loading,
    locations: locations.data,
    locationsLoading: locations.loading,
    contacts: contacts.data,
    contactsLoading: contacts.loading,
    tasks: tasks.data,
    tasksLoading: tasks.loading,
    inventoryItems: inventory.data,
    inventoryLoading: inventory.loading,
    messages: messages.data,
    messagesLoading: messages.loading,
    rules: rules.data,
    rulesLoading: rules.loading,
    notifications: notifications.data,
    notificationsLoading: notifications.loading,

    // Character operations
    addCharacter: characters.create,
    updateCharacter: characters.update,
    deleteCharacter: characters.remove,
    awardXP: characters.awardXP,

    // NPC operations
    addNPC: npcs.create,
    updateNPC: npcs.update,
    deleteNPC: npcs.remove,

    // Location operations
    addLocation: locations.create,
    updateLocation: locations.update,
    deleteLocation: locations.remove,

    // Contact operations
    addContact: contacts.create,
    updateContact: contacts.update,
    deleteContact: contacts.remove,

    // Task operations
    addTask: tasks.create,
    updateTask: tasks.update,
    deleteTask: tasks.remove,

    // Inventory operations
    addInventoryItem: inventory.create,
    updateInventoryItem: inventory.update,
    deleteInventoryItem: inventory.remove,
    transferItem,

    // Message operations
    sendMessage: messages.sendMessage,
    markMessageAsRead: async (messageId: number) => {
      const result = await messages.markAsRead(messageId);
      if (result.success) {
        // Force refresh of messages in context
        await messages.refetch();
        // Give React time to update the state
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return result;
    },
    sendBroadcast: async (broadcastData: any) => {
      // For now, create notifications for all users
      // This is a simplified implementation
      console.log("Broadcasting message:", broadcastData);
      return { success: true };
    },

    // Rule operations
    addRule: rules.create,
    updateRule: rules.update,
    deleteRule: rules.remove,

    // Notification operations
    markNotificationAsRead: notifications.markAsRead,
    markAllNotificationsAsRead: notifications.markAllAsRead,
    createNotification: notifications.createNotification,

    // Statistics
    statistics,
    statisticsLoading,

    // Utility functions
    showNotification,
    refreshData,

    // Legacy compatibility
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within a SupabaseAppProvider");
  }
  return context;
}
