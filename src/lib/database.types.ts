export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: "player" | "gm" | "admin" | "super_admin";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
          preferences: Json | null;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role?: "player" | "gm" | "admin" | "super_admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role?: "player" | "gm" | "admin" | "super_admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          preferences?: Json | null;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          id: number;
          name: string;
          role: string;
          player_id: string;
          campaign_id: number | null;
          status: "active" | "inactive";
          xp: number;
          avatar_url: string | null;
          background: string;
          last_session: string;
          abilities: string[];
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          role: string;
          player_id: string;
          campaign_id?: number | null;
          status?: "active" | "inactive";
          xp?: number;
          avatar_url?: string | null;
          background: string;
          last_session: string;
          abilities?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          role?: string;
          player_id?: string;
          status?: "active" | "inactive";
          xp?: number;
          avatar_url?: string | null;
          background?: string;
          last_session?: string;
          abilities?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      npcs: {
        Row: {
          id: number;
          name: string;
          role: string;
          description: string;
          stats: Json | null;
          location: string | null;
          linked_events: string[];
          notes: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          role: string;
          description: string;
          stats?: Json | null;
          location?: string | null;
          linked_events?: string[];
          notes?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          role?: string;
          description?: string;
          stats?: Json | null;
          location?: string | null;
          linked_events?: string[];
          notes?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "npcs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          id: number;
          name: string;
          address: string;
          coordinates: Json | null;
          type: "outdoor" | "indoor" | "industrial" | "garden";
          capacity: number;
          status: "available" | "booked" | "maintenance";
          description: string;
          amenities: string[];
          contact: string;
          notes: string;
          images: string[];
          upcoming_events: Json[];
          last_used: string | null;
          rating: number;
          price_range: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          address: string;
          coordinates?: Json | null;
          type: "outdoor" | "indoor" | "industrial" | "garden";
          capacity: number;
          status?: "available" | "booked" | "maintenance";
          description: string;
          amenities?: string[];
          contact: string;
          notes?: string;
          images?: string[];
          upcoming_events?: Json[];
          last_used?: string | null;
          rating?: number;
          price_range?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          address?: string;
          coordinates?: Json | null;
          type?: "outdoor" | "indoor" | "industrial" | "garden";
          capacity?: number;
          status?: "available" | "booked" | "maintenance";
          description?: string;
          amenities?: string[];
          contact?: string;
          notes?: string;
          images?: string[];
          upcoming_events?: Json[];
          last_used?: string | null;
          rating?: number;
          price_range?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: number;
          name: string;
          type: "vendor" | "actor" | "collaborator" | "supplier";
          category: string;
          contact_person: string;
          email: string;
          phone: string;
          website: string | null;
          address: string;
          tags: string[];
          rating: number;
          notes: string;
          last_contact: string;
          total_interactions: number;
          services: string[];
          price_range: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          type: "vendor" | "actor" | "collaborator" | "supplier";
          category: string;
          contact_person: string;
          email: string;
          phone: string;
          website?: string | null;
          address: string;
          tags?: string[];
          rating?: number;
          notes?: string;
          last_contact: string;
          total_interactions?: number;
          services?: string[];
          price_range?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          type?: "vendor" | "actor" | "collaborator" | "supplier";
          category?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          website?: string | null;
          address?: string;
          tags?: string[];
          rating?: number;
          notes?: string;
          last_contact?: string;
          total_interactions?: number;
          services?: string[];
          price_range?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: number;
          title: string;
          description: string;
          assignees: string[];
          priority: "low" | "medium" | "high" | "urgent";
          status: "pending" | "in-progress" | "completed" | "cancelled";
          deadline: string;
          created: string;
          category: string;
          tags: string[];
          estimated_hours: number;
          actual_hours: number;
          completed_by: string | null;
          created_by: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          assignees?: string[];
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "pending" | "in-progress" | "completed" | "cancelled";
          deadline: string;
          created?: string;
          category: string;
          tags?: string[];
          estimated_hours?: number;
          actual_hours?: number;
          completed_by?: string | null;
          created_by: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          assignees?: string[];
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "pending" | "in-progress" | "completed" | "cancelled";
          deadline?: string;
          created?: string;
          category?: string;
          tags?: string[];
          estimated_hours?: number;
          actual_hours?: number;
          completed_by?: string | null;
          created_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_items: {
        Row: {
          id: number;
          name: string;
          description: string;
          quantity: number;
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          effects: string;
          character_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          quantity?: number;
          rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
          effects: string;
          character_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          quantity?: number;
          rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
          effects?: string;
          character_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_items_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: number;
          from_character: string;
          to_character: string;
          content: string;
          timestamp: string;
          is_read: boolean;
          is_in_character: boolean;
          from_user_id: string;
          to_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          from_character: string;
          to_character: string;
          content: string;
          timestamp?: string;
          is_read?: boolean;
          is_in_character?: boolean;
          from_user_id: string;
          to_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          from_character?: string;
          to_character?: string;
          content?: string;
          timestamp?: string;
          is_read?: boolean;
          is_in_character?: boolean;
          from_user_id?: string;
          to_user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rules: {
        Row: {
          id: number;
          title: string;
          content: string;
          category: string;
          priority: "bassa" | "media" | "alta";
          visibility: "public" | "gm_only";
          tags: string[];
          created_by: string;
          created_at: string;
          last_modified: string;
          version: number;
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          category: string;
          priority?: "bassa" | "media" | "alta";
          visibility?: "public" | "gm_only";
          tags?: string[];
          created_by: string;
          created_at?: string;
          last_modified?: string;
          version?: number;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          category?: string;
          priority?: "bassa" | "media" | "alta";
          visibility?: "public" | "gm_only";
          tags?: string[];
          created_by?: string;
          created_at?: string;
          last_modified?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "rules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      xp_awards: {
        Row: {
          id: number;
          character_id: number;
          xp_amount: number;
          reason: string;
          awarded_by: string;
          awarded_at: string;
          session_date: string | null;
        };
        Insert: {
          id?: number;
          character_id: number;
          xp_amount: number;
          reason: string;
          awarded_by: string;
          awarded_at?: string;
          session_date?: string | null;
        };
        Update: {
          id?: number;
          character_id?: number;
          xp_amount?: number;
          reason?: string;
          awarded_by?: string;
          awarded_at?: string;
          session_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "xp_awards_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "xp_awards_awarded_by_fkey";
            columns: ["awarded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: "message" | "session" | "alert" | "update" | "approval";
          title: string;
          content: string;
          sender: string;
          priority: "low" | "medium" | "high" | "urgent";
          category: string;
          action_required: boolean;
          related_data: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: "message" | "session" | "alert" | "update" | "approval";
          title: string;
          content: string;
          sender: string;
          priority?: "low" | "medium" | "high" | "urgent";
          category: string;
          action_required?: boolean;
          related_data?: Json | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          type?: "message" | "session" | "alert" | "update" | "approval";
          title?: string;
          content?: string;
          sender?: string;
          priority?: "low" | "medium" | "high" | "urgent";
          category?: string;
          action_required?: boolean;
          related_data?: Json | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          genre: string | null;
          setting: string | null;
          max_players: number;
          difficulty: "beginner" | "easy" | "medium" | "hard" | "expert";
          start_date: string | null;
          location: string | null;
          game_system: string | null;
          session_frequency:
            | "weekly"
            | "biweekly"
            | "monthly"
            | "irregular"
            | "oneshot";
          duration: number;
          notes: string | null;
          status: "planning" | "active" | "paused" | "completed" | "cancelled";
          created_by: string | null;
          created_at: string;
          updated_at: string;
          organization_id: number | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          genre?: string | null;
          setting?: string | null;
          max_players?: number;
          difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
          start_date?: string | null;
          location?: string | null;
          game_system?: string | null;
          session_frequency?:
            | "weekly"
            | "biweekly"
            | "monthly"
            | "irregular"
            | "oneshot";
          duration?: number;
          notes?: string | null;
          status?: "planning" | "active" | "paused" | "completed" | "cancelled";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          organization_id?: number | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          genre?: string | null;
          setting?: string | null;
          max_players?: number;
          difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
          start_date?: string | null;
          location?: string | null;
          game_system?: string | null;
          session_frequency?:
            | "weekly"
            | "biweekly"
            | "monthly"
            | "irregular"
            | "oneshot";
          duration?: number;
          notes?: string | null;
          status?: "planning" | "active" | "paused" | "completed" | "cancelled";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          organization_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_players: {
        Row: {
          id: number;
          campaign_id: number;
          player_id: string;
          role: "player" | "gm" | "co_gm";
          joined_at: string;
          status: "invited" | "active" | "inactive" | "left";
        };
        Insert: {
          id?: number;
          campaign_id: number;
          player_id: string;
          role?: "player" | "gm" | "co_gm";
          joined_at?: string;
          status?: "invited" | "active" | "inactive" | "left";
        };
        Update: {
          id?: number;
          campaign_id?: number;
          player_id?: string;
          role?: "player" | "gm" | "co_gm";
          joined_at?: string;
          status?: "invited" | "active" | "inactive" | "left";
        };
        Relationships: [
          {
            foreignKeyName: "campaign_players_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "player" | "gm" | "admin" | "super_admin";
      character_status: "active" | "inactive";
      location_type: "outdoor" | "indoor" | "industrial" | "garden";
      location_status: "available" | "booked" | "maintenance";
      contact_type: "vendor" | "actor" | "collaborator" | "supplier";
      task_priority: "low" | "medium" | "high" | "urgent";
      task_status: "pending" | "in-progress" | "completed" | "cancelled";
      rarity_type: "common" | "uncommon" | "rare" | "epic" | "legendary";
      rule_priority: "bassa" | "media" | "alta";
      rule_visibility: "public" | "gm_only";
      notification_type:
        | "message"
        | "session"
        | "alert"
        | "update"
        | "approval";
      notification_priority: "low" | "medium" | "high" | "urgent";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
