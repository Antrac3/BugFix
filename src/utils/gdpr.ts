import { supabase } from "@/lib/supabase";

export interface GDPRDataExport {
  user: {
    profile: any;
    preferences: any;
    privacy_settings: any;
  };
  game_data: {
    characters: any[];
    plots: any[];
    notes: any[];
    communications: any[];
    events: any[];
  };
  metadata: {
    export_date: string;
    export_version: string;
    user_id: string;
  };
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<GDPRDataExport> {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Get user's characters
    const { data: characters } = await supabase
      .from("characters")
      .select("*")
      .eq("created_by", userId);

    // Get user's plots
    const { data: plots } = await supabase
      .from("plots")
      .select("*")
      .eq("created_by", userId);

    // Get user's notes
    const { data: notes } = await supabase
      .from("notes")
      .select("*")
      .eq("created_by", userId);

    // Get user's communications
    const { data: communications } = await supabase
      .from("communications")
      .select("*")
      .eq("created_by", userId);

    // Get user's events
    const { data: events } = await supabase
      .from("plot_events")
      .select("*")
      .eq("created_by", userId);

    // Get privacy settings from localStorage
    const privacySettings = localStorage.getItem(
      `larp_manager_privacy_consent`,
    );

    return {
      user: {
        profile: profile || {},
        preferences: {},
        privacy_settings: privacySettings ? JSON.parse(privacySettings) : {},
      },
      game_data: {
        characters: characters || [],
        plots: plots || [],
        notes: notes || [],
        communications: communications || [],
        events: events || [],
      },
      metadata: {
        export_date: new Date().toISOString(),
        export_version: "1.0",
        user_id: userId,
      },
    };
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw new Error("Failed to export user data");
  }
}

/**
 * Download user data as JSON file
 */
export function downloadUserData(data: GDPRDataExport, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `larp-manager-data-${data.metadata.user_id}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Request account deletion (GDPR right to erasure)
 */
export async function requestAccountDeletion(userId: string, reason?: string) {
  try {
    // In a real implementation, this would:
    // 1. Mark account for deletion
    // 2. Send notification to admin
    // 3. Start deletion process after grace period
    // 4. Send confirmation email

    console.log("Account deletion requested for user:", userId);
    console.log("Reason:", reason);

    // For now, just log the request
    // In production, this would call an API endpoint
    return {
      success: true,
      message: "Account deletion request submitted successfully",
      estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    throw new Error("Failed to submit account deletion request");
  }
}

/**
 * Anonymize user data (alternative to full deletion)
 */
export async function anonymizeUserData(userId: string) {
  try {
    // Replace personally identifiable information with anonymous values
    const anonymousData = {
      email: `anonymous_${userId.slice(-8)}@example.com`,
      first_name: "Anonymous",
      last_name: "User",
      // Keep non-personal game data but remove identifying information
    };

    const { error } = await supabase
      .from("profiles")
      .update(anonymousData)
      .eq("id", userId);

    if (error) throw error;

    return {
      success: true,
      message: "User data anonymized successfully",
    };
  } catch (error) {
    console.error("Error anonymizing user data:", error);
    throw new Error("Failed to anonymize user data");
  }
}

/**
 * Get data retention policy information
 */
export function getDataRetentionPolicy() {
  return {
    account_data: "Until account deletion",
    game_data:
      "According to campaign policy (typically 2 years after campaign end)",
    technical_logs: "12 months maximum",
    communications: "According to user settings (1-5 years)",
    backup_data: "30 days for incremental, 1 year for full backups",
    anonymous_analytics: "3 years maximum",
  };
}

/**
 * Check if user has pending GDPR requests
 */
export async function checkPendingGDPRRequests(userId: string) {
  // In a real implementation, this would check a database table
  // for pending data export or deletion requests
  return {
    pending_export: false,
    pending_deletion: false,
    last_export_date: null,
    deletion_scheduled_date: null,
  };
}
