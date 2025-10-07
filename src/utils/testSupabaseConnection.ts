import { supabase } from "@/lib/supabase";

export const testSupabaseConnection = async () => {
  console.log("🔍 Starting comprehensive Supabase connection test...");

  const results = {
    basicConnection: false,
    authStatus: false,
    tables: {} as Record<string, boolean>,
    errors: [] as string[],
  };

  try {
    // Test 1: Basic connection with a simple query
    console.log("1️⃣ Testing basic connection...");
    const { data: basicTest, error: basicError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (basicError) {
      console.error("❌ Basic connection failed:", basicError);
      results.errors.push(`Basic connection: ${basicError.message}`);
    } else {
      console.log("✅ Basic connection successful");
      results.basicConnection = true;
    }

    // Test 2: Authentication status
    console.log("2️⃣ Testing authentication...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      console.error("❌ Auth test failed:", authError);
      results.errors.push(`Auth: ${authError.message}`);
    } else {
      console.log(
        "✅ Auth test successful, session:",
        authData.session ? "Active" : "None",
      );
      results.authStatus = true;
    }

    // Test 3: Individual table access
    const tables = [
      "profiles",
      "characters",
      "messages",
      "notifications",
      "tasks",
      "contacts",
      "npcs",
      "locations",
      "inventory_items",
      "events",
      "communications",
    ];

    console.log("3️⃣ Testing individual table access...");
    for (const table of tables) {
      try {
        console.log(`   Testing ${table}...`);
        const { error: tableError } = await supabase
          .from(table)
          .select("*")
          .limit(1);

        if (tableError) {
          console.error(`   ❌ ${table}: ${tableError.message}`);
          results.tables[table] = false;
          results.errors.push(`Table ${table}: ${tableError.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
          results.tables[table] = true;
        }
      } catch (err) {
        console.error(`   🚨 ${table}: Critical error:`, err);
        results.tables[table] = false;
        results.errors.push(`Table ${table}: Critical error`);
      }
    }

    // Test 4: Network connectivity
    console.log("4️⃣ Testing network connectivity...");
    try {
      const response = await fetch(
        import.meta.env.VITE_SUPABASE_URL + "/rest/v1/",
        {
          method: "HEAD",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (response.ok) {
        console.log("✅ Network connectivity: OK");
      } else {
        console.error(
          "❌ Network connectivity failed:",
          response.status,
          response.statusText,
        );
        results.errors.push(
          `Network: ${response.status} ${response.statusText}`,
        );
      }
    } catch (netErr) {
      console.error("🚨 Network test failed:", netErr);
      results.errors.push(`Network: ${netErr}`);
    }
  } catch (criticalErr) {
    console.error("🚨 Critical error during connection test:", criticalErr);
    results.errors.push(`Critical: ${criticalErr}`);
  }

  // Summary
  console.log("\n📊 Connection Test Results:");
  console.log("Basic Connection:", results.basicConnection ? "✅" : "❌");
  console.log("Auth Status:", results.authStatus ? "✅" : "❌");
  console.log(
    "Tables:",
    Object.entries(results.tables)
      .map(([table, status]) => `${table}: ${status ? "✅" : "❌"}`)
      .join(", "),
  );

  if (results.errors.length > 0) {
    console.log("\n🚨 Errors found:");
    results.errors.forEach((error) => console.log(`   - ${error}`));
  }

  return results;
};

// Quick test function for immediate use
export const quickSupabaseTest = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Quick test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Quick test successful");
    return { success: true };
  } catch (err) {
    console.error("🚨 Quick test critical error:", err);
    return { success: false, error: String(err) };
  }
};
