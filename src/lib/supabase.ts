import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Supabase configuration - Replace with your actual project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "YOUR_SUPABASE_URL") {
  console.warn(
    "⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file",
  );
}

// Create Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "larp-manager@1.0.0",
    },
  },
});

// Auth helpers
export const getSession = () => supabase.auth.getSession();
export const getUser = () => supabase.auth.getUser();

// Database helpers
export const from = (table: keyof Database["public"]["Tables"]) =>
  supabase.from(table);

// Real-time subscriptions helper
export const subscribe = (
  table: keyof Database["public"]["Tables"],
  callback: (payload: any) => void,
  filter?: string,
) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
        filter: filter,
      },
      callback,
    )
    .subscribe();

  return subscription;
};

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  return await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
};

export const getPublicUrl = (bucket: string, path: string) => {
  return supabase.storage.from(bucket).getPublicUrl(path);
};

// Error handling helper
export const handleSupabaseError = (error: any) => {
  console.error("Supabase Error:", error);

  if (error.code === "PGRST301") {
    return "Record not found";
  }

  if (error.code === "23505") {
    return "This record already exists";
  }

  if (error.code === "42P01") {
    return "Database table not found. Please check your database setup.";
  }

  if (error.code === "PGRST116") {
    return "No rows found";
  }

  return error.message || "An unexpected error occurred";
};

// Enhanced error handler that provides better network error feedback
export const handleNetworkError = (
  error: any,
  operation: string = "operation",
) => {
  console.error(`❌ ${operation} failed:`, error);

  // Check for network connectivity issues
  if (
    error?.message?.includes("Failed to fetch") ||
    error?.name === "TypeError" ||
    error?.cause?.message?.includes("Failed to fetch")
  ) {
    console.error("🌐 Network connectivity issue detected");
    return {
      success: false,
      error:
        "Unable to connect to the server. Please check your internet connection and try again.",
      isNetworkError: true,
    };
  }

  // Check for auth errors
  if (error?.code === "40X" || error?.message?.includes("JWT")) {
    return {
      success: false,
      error: "Authentication expired. Please log in again.",
      isAuthError: true,
    };
  }

  // Check for database/table errors
  if (error?.code === "42P01") {
    return {
      success: false,
      error: "Database tables not found. Please set up the database.",
      isDatabaseError: true,
    };
  }

  return {
    success: false,
    error: error?.message || error?.details || "An unexpected error occurred",
    isUnknownError: true,
  };
};

// Cache for database check results
let lastDbCheck: { timestamp: number; result: any } | null = null;
const DB_CHECK_CACHE_DURATION = 30000; // 30 seconds

// Database connectivity and setup check with caching and debouncing
export const checkDatabaseSetup = async () => {
  // Return cached result if still valid
  if (
    lastDbCheck &&
    Date.now() - lastDbCheck.timestamp < DB_CHECK_CACHE_DURATION
  ) {
    return lastDbCheck.result;
  }

  try {
    // Check if credentials are configured
    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === "YOUR_SUPABASE_URL"
    ) {
      const result = { success: false, error: "Supabase credentials missing" };
      lastDbCheck = { timestamp: Date.now(), result };
      return result;
    }

    // Test basic connectivity with reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const { data: testData, error: testError } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (testError) {
        const result = handleNetworkError(
          testError,
          "Database connectivity test",
        );
        lastDbCheck = { timestamp: Date.now(), result };
        return result;
      }

      const result = { success: true };
      lastDbCheck = { timestamp: Date.now(), result };
      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const result = handleNetworkError(
        fetchError,
        "Database connectivity test",
      );
      lastDbCheck = { timestamp: Date.now(), result };
      return result;
    }
  } catch (error: any) {
    const result = handleNetworkError(error, "Database setup check");
    lastDbCheck = { timestamp: Date.now(), result };
    return result;
  }
};

export default supabase;
