// Debug component - only in development for performance
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  testSupabaseConnection,
  quickSupabaseTest,
} from "@/utils/testSupabaseConnection";

export const SupabaseDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testSupabaseConnection();
      setResults(testResults);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      const quickResults = await quickSupabaseTest();
      console.log("Quick test results:", quickResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>🔧 Supabase Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runQuickTest} disabled={isLoading} variant="outline">
            Quick Test
          </Button>
          <Button onClick={runFullTest} disabled={isLoading}>
            {isLoading ? "Testing..." : "Full Connection Test"}
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span>Basic Connection:</span>
                <Badge
                  variant={results.basicConnection ? "default" : "destructive"}
                >
                  {results.basicConnection ? "✅ OK" : "❌ Failed"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Auth Status:</span>
                <Badge variant={results.authStatus ? "default" : "destructive"}>
                  {results.authStatus ? "✅ OK" : "❌ Failed"}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Table Status:</h4>
              <div className="grid grid-cols-3 gap-1 text-sm">
                {Object.entries(results.tables).map(([table, status]) => (
                  <Badge
                    key={table}
                    variant={status ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {table}: {status ? "✅" : "❌"}
                  </Badge>
                ))}
              </div>
            </div>

            {results.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Errors:</h4>
                <div className="space-y-1">
                  {results.errors.map((error: string, index: number) => (
                    <div
                      key={index}
                      className="text-sm text-red-600 bg-red-50 p-2 rounded"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>• Check browser console for detailed logs</p>
          <p>• This component should be removed in production</p>
        </div>
      </CardContent>
    </Card>
  );
};
