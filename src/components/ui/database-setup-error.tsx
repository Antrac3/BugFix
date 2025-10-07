import { AlertTriangle, Database, Copy, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

interface DatabaseSetupErrorProps {
  error: string;
}

export function DatabaseSetupError({ error }: DatabaseSetupErrorProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- CAMPAIGNS DATABASE SCHEMA
-- Esegui questo script in Supabase SQL Editor

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    setting TEXT,
    max_players INTEGER DEFAULT 8,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('beginner', 'easy', 'medium', 'hard', 'expert')),
    start_date DATE,
    location TEXT,
    game_system VARCHAR(100),
    session_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (session_frequency IN ('weekly', 'biweekly', 'monthly', 'irregular', 'oneshot')),
    duration INTEGER DEFAULT 4,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    organization_id BIGINT
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their campaigns" ON campaigns
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their campaigns" ON campaigns
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their campaigns" ON campaigns
    FOR DELETE USING (created_by = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Non Configurato</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Setup Database Richiesto
          </CardTitle>
          <CardDescription>
            Per utilizzare le campagne, devi eseguire lo script SQL nel tuo
            database Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">
              Passaggi per configurare il database:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Vai su{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Seleziona il tuo progetto</li>
              <li>Clicca su "SQL Editor" nel menu laterale</li>
              <li>Crea una nuova query</li>
              <li>Copia e incolla lo script SQL qui sotto</li>
              <li>Esegui la query</li>
              <li>Ricarica questa pagina</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Script SQL da eseguire:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copia Script
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{sqlScript}</code>
            </pre>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Assicurati di essere autenticato in Supabase e di avere i permessi
              per creare tabelle nel database.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
