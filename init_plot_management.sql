-- Initialize Plot Management System for LARP ERP
-- This script creates all necessary tables for comprehensive plot/story management

-- First, ensure we have the campaigns table (should already exist)
-- If not, we'll create a basic version

-- Create plots table for main plot/story management
CREATE TABLE IF NOT EXISTS plots (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER, -- Will be linked to campaigns when that table is properly set up
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plot_type VARCHAR(50) DEFAULT 'main' CHECK (plot_type IN ('main', 'side', 'personal', 'background')),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'abandoned')),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1=highest, 5=lowest
    start_date TIMESTAMPTZ,
    target_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    tags TEXT[], -- for categorization
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plot_objectives table for tracking goals and secrets
CREATE TABLE IF NOT EXISTS plot_objectives (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    character_id INTEGER, -- Will be linked to characters table when available
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective_type VARCHAR(50) DEFAULT 'public' CHECK (objective_type IN ('public', 'private', 'secret', 'hidden')),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
    completion_condition TEXT,
    reward_description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    reveal_condition TEXT, -- quando rivelare l'obiettivo
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plot_events table for timeline management
CREATE TABLE IF NOT EXISTS plot_events (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'story' CHECK (event_type IN ('story', 'action', 'revelation', 'conflict', 'resolution', 'npc_appearance', 'trigger')),
    scheduled_time TIMESTAMPTZ,
    actual_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location VARCHAR(255),
    participants TEXT[], -- array of character IDs or names
    prerequisites TEXT[], -- conditions that must be met
    consequences TEXT, -- what happens after this event
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'ready', 'in_progress', 'completed', 'cancelled')),
    trigger_condition TEXT, -- automatic trigger conditions
    is_automatic BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plot_characters table for character involvement
CREATE TABLE IF NOT EXISTS plot_characters (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    character_id INTEGER, -- Will link to characters table
    involvement_type VARCHAR(50) DEFAULT 'participant' CHECK (involvement_type IN ('protagonist', 'antagonist', 'participant', 'witness', 'victim', 'helper')),
    knowledge_level VARCHAR(50) DEFAULT 'none' CHECK (knowledge_level IN ('none', 'partial', 'full', 'secret')),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plot_id, character_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plots_campaign_id ON plots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_priority ON plots(priority);
CREATE INDEX IF NOT EXISTS idx_plot_objectives_plot_id ON plot_objectives(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_objectives_character_id ON plot_objectives(character_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_plot_id ON plot_events(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_scheduled_time ON plot_events(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_plot_characters_plot_id ON plot_characters(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_characters_character_id ON plot_characters(character_id);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_plots_updated_at ON plots;
CREATE TRIGGER update_plots_updated_at BEFORE UPDATE ON plots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plot_objectives_updated_at ON plot_objectives;
CREATE TRIGGER update_plot_objectives_updated_at BEFORE UPDATE ON plot_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plot_events_updated_at ON plot_events;
CREATE TRIGGER update_plot_events_updated_at BEFORE UPDATE ON plot_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO plots (title, description, plot_type, priority, status, tags, notes) VALUES 
(
    'Il Segreto del Re Perduto',
    'Una trama principale che coinvolge la ricerca del vero erede al trono, nascosto anni fa per proteggerlo da una cospirazione di corte.',
    'main',
    1,
    'active',
    ARRAY['mistero', 'politica', 'famiglia reale'],
    'Trama centrale della campagna, coinvolge tutti i personaggi principali'
),
(
    'Il Mercante Corrotto',
    'Una trama secondaria che vede i personaggi indagare su un mercante che vende armi ai nemici del regno.',
    'side',
    2,
    'planning',
    ARRAY['intrigo', 'commercio', 'tradimento'],
    'Può essere sviluppata in parallelo alla trama principale'
),
(
    'La Vendetta di Lady Blackthorne',
    'Una trama personale di vendetta che coinvolge il passato di uno dei personaggi principali.',
    'personal',
    3,
    'active',
    ARRAY['vendetta', 'passato', 'famiglia'],
    'Specifica per il personaggio di Lord Ashford'
);

-- Insert sample objectives
INSERT INTO plot_objectives (plot_id, title, description, objective_type, priority, is_mandatory) VALUES
(1, 'Scoprire l''identità del vero erede', 'I personaggi devono raccogliere indizi per identificare chi sia il legittimo erede al trono.', 'public', 1, true),
(1, 'Infiltrarsi nel palazzo reale', 'Ottenere accesso alle camere private del re per cercare documenti segreti.', 'secret', 2, false),
(2, 'Seguire il mercante', 'Pedinare discretamente il mercante per scoprire i suoi contatti.', 'private', 2, true),
(3, 'Confrontarsi con il nemico del passato', 'Lord Ashford deve affrontare colui che ha ucciso sua sorella.', 'personal', 1, true);

-- Insert sample events
INSERT INTO plot_events (plot_id, title, description, event_type, duration_minutes, location) VALUES
(1, 'L''arrivo del messaggero misterioso', 'Un messaggero incappucciato porta una lettera che contiene il primo indizio sull''erede.', 'story', 30, 'Taverna del Drago Rosso'),
(1, 'Lo scontro con le guardie corrotte', 'I personaggi vengono attaccati da guardie che vogliono impedire le loro ricerche.', 'action', 45, 'Vicoli del quartiere povero'),
(2, 'L''incontro segreto al porto', 'Il mercante incontra i suoi contatti criminali per organizzare una consegna.', 'revelation', 60, 'Molo 7 del porto'),
(3, 'La sfida all''alba', 'Lord Ashford sfida a duello l''assassino di sua sorella.', 'conflict', 90, 'Campo d''onore fuori città');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Plot Management System inizializzato con successo!';
    RAISE NOTICE 'Tabelle create: plots, plot_objectives, plot_events, plot_characters';
    RAISE NOTICE 'Dati di esempio inseriti per 3 trame, 4 obiettivi e 4 eventi';
END $$;
