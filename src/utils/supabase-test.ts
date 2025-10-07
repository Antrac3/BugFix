import { supabase } from "@/lib/supabase";

export const testSupabaseConnection = async () => {
  console.log("🧪 === SUPABASE CONNECTION TEST ===");

  // Test 1: Configuration
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("1️⃣ Configuration check:");
  console.log("   URL configured:", !!url);
  console.log("   Key configured:", !!key);
  console.log(
    "   URL format:",
    url?.includes("supabase.co") ? "✅ Valid" : "❌ Invalid",
  );

  if (!url || !key) {
    console.error("❌ Supabase not configured properly");
    return false;
  }

  // Test 2: Basic HTTP connectivity
  console.log("2️��� HTTP connectivity test:");
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: key,
      },
    });
    console.log("   HTTP Status:", response.status);
    console.log("   HTTP OK:", response.ok ? "✅" : "❌");

    if (!response.ok) {
      console.error("❌ HTTP connectivity failed");
      return false;
    }
  } catch (httpError) {
    console.error("❌ HTTP request failed:", httpError);
    return false;
  }

  // Test 3: Supabase client authentication
  console.log("3️⃣ Auth client test:");
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log("   Auth response data:", !!data);
    console.log(
      "   Auth error:",
      error ? "❌ " + error.message : "✅ No error",
    );
    console.log("   User authenticated:", data?.user ? "✅ Yes" : "⚠️ No");
  } catch (authError) {
    console.error("❌ Auth client failed:", authError);
    return false;
  }

  // Test 4: Simple table query (profiles should exist)
  console.log("4️⃣ Database query test:");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    console.log("   Query data:", data);
    console.log(
      "   Query error:",
      error ? "❌ " + JSON.stringify(error) : "✅ No error",
    );

    if (error) {
      console.error("❌ Database query failed");
      return false;
    }
  } catch (queryError) {
    console.error("❌ Database query exception:", queryError);
    return false;
  }

  // Test 5: Campaigns table specific test
  console.log("5️⃣ Campaigns table test:");
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("count", { count: "exact", head: true });

    console.log("   Campaigns query data:", data);
    console.log(
      "   Campaigns query error:",
      error ? "❌ " + JSON.stringify(error) : "✅ No error",
    );

    if (error) {
      if (error.code === "42P01") {
        console.warn(
          "⚠️ Campaigns table does not exist - need to run SQL script",
        );
      } else {
        console.error("❌ Unexpected campaigns table error");
      }
    } else {
      console.log("✅ Campaigns table exists and accessible");
    }
  } catch (campaignsError) {
    console.error("❌ Campaigns query exception:", campaignsError);
  }

  console.log("🧪 === END SUPABASE TEST ===");
  return true;
};
