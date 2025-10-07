-- Plot Management Database Schema for LARP ERP

-- Main plots table (trame principali e secondarie)
CREATE TABLE IF NOT EXISTS plots (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character involvement in plots
CREATE TABLE IF NOT EXISTS plot_characters (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    involvement_type VARCHAR(50) DEFAULT 'participant' CHECK (involvement_type IN ('protagonist', 'antagonist', 'participant', 'witness', 'victim', 'helper')),
    knowledge_level VARCHAR(50) DEFAULT 'none' CHECK (knowledge_level IN ('none', 'partial', 'full', 'secret')),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plot_id, character_id)
);

-- Plot objectives and secrets
CREATE TABLE IF NOT EXISTS plot_objectives (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL, -- NULL = general objective
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

-- Plot events and timeline
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPCs involved in plots
CREATE TABLE IF NOT EXISTS plot_npcs (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    npc_id INTEGER REFERENCES npcs(id) ON DELETE CASCADE,
    role VARCHAR(255), -- their role in this specific plot
    appearance_schedule TEXT, -- when they should appear
    interaction_goals TEXT, -- what they want to achieve
    secrets_known TEXT[], -- what secrets they know
    plot_importance VARCHAR(50) DEFAULT 'minor' CHECK (plot_importance IN ('critical', 'major', 'minor', 'background')),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plot_id, npc_id)
);

-- Plot interconnections (how plots relate to each other)
CREATE TABLE IF NOT EXISTS plot_connections (
    id SERIAL PRIMARY KEY,
    parent_plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    child_plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) DEFAULT 'leads_to' CHECK (connection_type IN ('leads_to', 'blocks', 'enables', 'parallel', 'conflicts_with', 'supports')),
    description TEXT,
    strength INTEGER DEFAULT 3 CHECK (strength BETWEEN 1 AND 5), -- how strong the connection is
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (parent_plot_id != child_plot_id),
    UNIQUE(parent_plot_id, child_plot_id)
);

-- Plot resources (items, documents, etc. related to plots)
CREATE TABLE IF NOT EXISTS plot_resources (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('document', 'item', 'location', 'handout', 'prop', 'costume', 'audio', 'video')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT, -- for digital resources
    physical_location TEXT, -- where physical items are stored
    access_level VARCHAR(50) DEFAULT 'gm_only' CHECK (access_level IN ('public', 'players', 'gm_only', 'specific_characters')),
    accessible_to TEXT[], -- specific character IDs if access_level is 'specific_characters'
    is_consumed BOOLEAN DEFAULT false, -- if it's used up after use
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plots_campaign_id ON plots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plot_characters_plot_id ON plot_characters(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_characters_character_id ON plot_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_plot_objectives_plot_id ON plot_objectives(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_objectives_character_id ON plot_objectives(character_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_plot_id ON plot_events(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_scheduled_time ON plot_events(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_plot_npcs_plot_id ON plot_npcs(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_connections_parent ON plot_connections(parent_plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_connections_child ON plot_connections(child_plot_id);

-- Row Level Security
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON plots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON plots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for plot creators" ON plots FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Enable delete for plot creators" ON plots FOR DELETE USING (created_by = auth.uid());

-- Similar policies for other tables
CREATE POLICY "Enable all for authenticated users" ON plot_characters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON plot_objectives FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON plot_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON plot_npcs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON plot_connections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON plot_resources FOR ALL USING (auth.role() = 'authenticated');

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plots_updated_at BEFORE UPDATE ON plots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plot_objectives_updated_at BEFORE UPDATE ON plot_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plot_events_updated_at BEFORE UPDATE ON plot_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
