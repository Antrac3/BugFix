import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export function CampaignsDebug() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    addResult("🚀 Starting database tests...");

    try {
      // Test 1: Check if campaigns table exists
      addResult("📋 Test 1: Checking if campaigns table exists...");
      const { error: tableError } = await supabase
        .from("campaigns")
        .select("id")
        .limit(1);

      if (tableError) {
        if (tableError.code === "42P01") {
          addResult("❌ Campaigns table does not exist");
        } else {
          addResult(`❌ Table error: ${tableError.message}`);
        }
      } else {
        addResult("✅ Campaigns table exists");
      }

      // Test 2: Try simple select without RLS
      addResult("📋 Test 2: Trying simple select...");
      const { data, error: selectError } = await supabase
        .from("campaigns")
        .select("id, name")
        .limit(1);

      if (selectError) {
        addResult(`❌ Select error: ${selectError.message}`);
        addResult(`📊 Error code: ${selectError.code}`);
        addResult(`📊 Error details: ${selectError.details}`);
        addResult(`📊 Error hint: ${selectError.hint}`);
      } else {
        addResult(`✅ Select successful, found ${data?.length || 0} campaigns`);
      }

      // Test 3: Check RLS policies
      addResult("📋 Test 3: Checking RLS policies...");
      const { data: policies, error: policyError } = await supabase.rpc(
        "exec",
        {
          query: `
            SELECT tablename, policyname, cmd, qual 
            FROM pg_policies 
            WHERE tablename IN ('campaigns', 'campaign_players')
          `,
        },
      );

      if (policyError) {
        addResult(`❌ Policy check failed: ${policyError.message}`);
      } else {
        addResult(`✅ Found ${policies?.length || 0} policies`);
      }
    } catch (err: any) {
      addResult(`❌ Unexpected error: ${err.message}`);
      console.error("Debug test error:", err);
    }

    setTesting(false);
    addResult("🏁 Tests completed");
  };

  return (
    <Card className="fantasy-card">
      <CardHeader>
        <CardTitle>Campaigns Database Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? "Running Tests..." : "Run Database Tests"}
        </Button>

        {testResults.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, i) => (
                <div key={i}>{result}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
