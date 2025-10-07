import { supabase } from "@/lib/supabase";

export const checkAndSetupCampaignsTable = async () => {
  try {
    console.log("🔍 Checking if campaigns table exists...");

    // First check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log(
      "🔧 Supabase URL:",
      supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
    );
    console.log(
      "🔧 Supabase Key:",
      supabaseKey ? `${supabaseKey.substring(0, 30)}...` : "MISSING",
    );

    if (!supabaseUrl || !supabaseKey || supabaseUrl === "YOUR_SUPABASE_URL") {
      return {
        success: false,
        error: "CONFIG_ERROR",
        message:
          "Supabase non è configurato correttamente. Controlla le variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env",
      };
    }

    // Test basic HTTP connectivity to Supabase with timeout and fallback
    console.log("🌐 Testing HTTP connectivity to Supabase...");

    try {
      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("🌐 HTTP response status:", response.status);
      console.log("🌐 HTTP response ok:", response.ok);

      if (!response.ok) {
        console.warn(
          "⚠️ HTTP request failed, but continuing with database check:",
          response.status,
          response.statusText,
        );
        // Don't return error here - continue with database check
      }
    } catch (httpError: any) {
      console.warn(
        "⚠️ HTTP connectivity test failed, but continuing:",
        httpError.message,
      );
      // Don't return error here - the app should work offline with localStorage
      // Just log the issue and continue with the database check
    }

    // Test basic Supabase client connectivity
    console.log("🔍 Testing Supabase client connectivity...");

    // Note: Skip auth check here as this function may be called before user is authenticated
    // Database structure checks don't require authentication

    // Test basic connection first with a simpler query
    console.log("🔍 Testing basic database connection...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    console.log("🏥 Health check result:", healthCheck);
    console.log("🏥 Health check error:", healthError);

    if (healthError) {
      console.error("❌ Basic database connection failed:", healthError);
      return {
        success: false,
        error: "CONNECTION_ERROR",
        message: `Database non raggiungibile: ${healthError.message || "Connessione fallita"}`,
      };
    }

    // Now test if campaigns table exists by trying to query it
    console.log("🔍 Testing campaigns table access...");
    const { data, error } = await supabase
      .from("campaigns")
      .select("count", { count: "exact", head: true });

    console.log("📊 Campaigns query result:", data);
    console.log("📊 Campaigns query error:", error);

    if (error) {
      console.error("❌ Database error details:", error);
      console.error("Error JSON:", JSON.stringify(error, null, 2));
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error || {}));
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);

      if (error.code === "42P01") {
        console.error("❌ Campaigns table does not exist!");
        return {
          success: false,
          error: "MISSING_TABLE",
          message:
            "La tabella 'campaigns' non esiste nel database. Devi eseguire lo script campaigns_database_schema.sql in Supabase SQL Editor.",
        };
      } else if (error.code === "42P17") {
        console.error("❌ RLS policies have infinite recursion!");
        return {
          success: false,
          error: "RLS_RECURSION",
          message:
            "Le politiche RLS della tabella campaigns hanno ricorsione infinita. Esegui lo script fix_campaigns_rls_infinite_recursion.sql in Supabase SQL Editor.",
        };
      } else if (error.message === "") {
        // Empty message often means authentication/permission issue
        return {
          success: false,
          error: "PERMISSION_ERROR",
          message:
            "Errore di permessi. Verifica di essere autenticato e di avere accesso al database.",
        };
      } else {
        const errorMessage =
          error.message || error.details || error.hint || JSON.stringify(error);
        console.error("❌ Database error:", errorMessage);
        return {
          success: false,
          error: "DATABASE_ERROR",
          message: `Errore database: ${errorMessage}`,
        };
      }
    }

    console.log("✅ Campaigns table exists and is accessible");
    return { success: true };
  } catch (err: any) {
    console.error("❌ Failed to check campaigns table:", err);
    console.error("Catch error JSON:", JSON.stringify(err, null, 2));

    const errorMessage = err.message || err.details || String(err);
    return {
      success: false,
      error: "CONNECTION_ERROR",
      message: `Errore di connessione: ${errorMessage}`,
    };
  }
};

export const getDatabaseSetupInstructions = () => {
  return `
Per configurare il database correttamente:

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su "SQL Editor" nel menu laterale
4. Crea una nuova query
5. Copia e incolla il contenuto del file "fix_campaigns_rls_infinite_recursion.sql"
6. Esegui la query
7. Ricarica l'applicazione

Il file fix_campaigns_rls_infinite_recursion.sql si trova nella root del progetto.
  `;
};
