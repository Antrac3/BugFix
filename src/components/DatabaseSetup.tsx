import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Essential SQL to create plots and notes tables - SIMPLIFIED VERSION
  const sqlToRun = `-- Crea le tabelle per le trame e note (versione semplificata)
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    tags TEXT[],
    category VARCHAR(100),
    is_private BOOLEAN DEFAULT true,
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(50),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plots (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plot_type VARCHAR(50) DEFAULT 'main',
    status VARCHAR(50) DEFAULT 'planning',
    priority INTEGER DEFAULT 3,
    start_date TIMESTAMPTZ,
    target_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    tags TEXT[],
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plot_objectives (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER,
    character_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective_type VARCHAR(50) DEFAULT 'public',
    priority INTEGER DEFAULT 3,
    status VARCHAR(50) DEFAULT 'active',
    completion_condition TEXT,
    reward_description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    reveal_condition TEXT,
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plot_events (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'story',
    scheduled_time TIMESTAMPTZ,
    actual_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location VARCHAR(255),
    participants TEXT[],
    prerequisites TEXT[],
    consequences TEXT,
    status VARCHAR(50) DEFAULT 'planned',
    trigger_condition TEXT,
    is_automatic BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plot_characters (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER,
    character_id INTEGER,
    involvement_type VARCHAR(50) DEFAULT 'participant',
    knowledge_level VARCHAR(50) DEFAULT 'none',
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_characters ENABLE ROW LEVEL SECURITY;

-- Crea le policy di sicurezza semplici
CREATE POLICY "notes_policy" ON notes FOR ALL USING (true);
CREATE POLICY "plots_policy" ON plots FOR ALL USING (true);
CREATE POLICY "plot_objectives_policy" ON plot_objectives FOR ALL USING (true);
CREATE POLICY "plot_events_policy" ON plot_events FOR ALL USING (true);
CREATE POLICY "plot_characters_policy" ON plot_characters FOR ALL USING (true);

-- Crea gli indici per le performance
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_plots_campaign_id ON plots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plot_objectives_plot_id ON plot_objectives(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_plot_id ON plot_events(plot_id);`;

  const setupDatabase = async () => {
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      console.log("🔧 Attempting automatic database setup...");

      // Since automatic setup often fails, provide immediate guidance
      setStatus("error");
      setMessage(
        "🔧 La configurazione automatica non è disponibile su questo server. Segui le istruzioni manuali qui sotto per configurare il database tramite il dashboard di Supabase.",
      );
    } catch (error: any) {
      console.error("Database setup error:", error);
      setStatus("error");
      setMessage(
        "🔧 Utilizza le istruzioni manuali qui sotto per configurare il database tramite il dashboard di Supabase.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // Test both plots and notes tables
      const [plotsResult, notesResult] = await Promise.all([
        supabase.from("plots").select("count", { count: "exact", head: true }),
        supabase.from("notes").select("count", { count: "exact", head: true }),
      ]);

      if (plotsResult.error || notesResult.error) {
        const missingTables = [];
        if (plotsResult.error?.code === "42P01") missingTables.push("plots");
        if (notesResult.error?.code === "42P01") missingTables.push("notes");

        if (missingTables.length > 0) {
          setStatus("error");
          setMessage(
            `Le tabelle ${missingTables.join(", ")} non esistono ancora. Clicca 'Configura Database' per crearle.`,
          );
        } else if (
          plotsResult.error?.message?.includes("Failed to fetch") ||
          notesResult.error?.message?.includes("Failed to fetch")
        ) {
          setStatus("error");
          setMessage(
            "Impossibile connettersi al database. Verifica la connessione internet e le credenziali Supabase.",
          );
        } else {
          throw plotsResult.error || notesResult.error;
        }
        return;
      }

      setStatus("success");
      setMessage(
        "Connessione al database funzionante! Le tabelle delle trame e note sono disponibili.",
      );
    } catch (error: any) {
      setStatus("error");
      setMessage(`Errore di connessione: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configurazione Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            📋 Configurazione Database Richiesta
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Dati salvati localmente. Per usare il database, segui le istruzioni
            qui sotto.
          </p>
        </div>

        {status !== "idle" && (
          <Alert variant={status === "success" ? "default" : "destructive"}>
            {status === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Testa Connessione
          </Button>

          <Button
            onClick={() =>
              window.open("https://supabase.com/dashboard", "_blank")
            }
            variant="default"
          >
            <Database className="h-4 w-4 mr-2" />
            Apri Supabase Dashboard
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Configurazione Manuale Richiesta:</strong> La configurazione
            automatica non è disponibile.
          </p>
          <details className="cursor-pointer" open>
            <summary className="font-medium text-sm">
              📋 Istruzioni Configurazione Manuale
            </summary>
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-muted rounded text-xs">
                <p className="font-medium mb-2">Passaggi da seguire:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Vai al tuo{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      dashboard Supabase
                    </a>
                  </li>
                  <li>Seleziona il tuo progetto</li>
                  <li>Vai a "SQL Editor" nella sidebar</li>
                  <li>Crea una nuova query</li>
                  <li>Copia e incolla il codice SQL qui sotto</li>
                  <li>Clicca "Run" per eseguire</li>
                  <li>Torna qui e clicca "Testa Connessione"</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">SQL da eseguire:</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(sqlToRun)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                  >
                    📋 Copia
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {sqlToRun}
                </pre>
              </div>

              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium text-yellow-800">⚠️ Importante:</p>
                <p className="text-yellow-700">
                  Se ottieni errori sulle foreign key (campaigns, characters),
                  puoi ignorarli per ora. Le tabelle principali verranno
                  comunque create.
                </p>
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
