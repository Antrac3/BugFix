-- Quick Database Fix for Events and Communications
-- Copy and paste this entire script into Supabase SQL Editor

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    event_type VARCHAR NOT NULL DEFAULT 'session',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location_id BIGINT REFERENCES locations(id),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_deadline TIMESTAMPTZ,
    status VARCHAR NOT NULL DEFAULT 'planning',
    visibility VARCHAR NOT NULL DEFAULT 'public',
    requires_approval BOOLEAN DEFAULT false,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tags TEXT[],
    requirements TEXT,
    materials_needed TEXT[],
    notes TEXT,
    cancellation_reason TEXT,
    organization_id BIGINT
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR NOT NULL DEFAULT 'announcement',
    priority VARCHAR NOT NULL DEFAULT 'normal',
    target_audience VARCHAR NOT NULL DEFAULT 'all',
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR NOT NULL DEFAULT 'draft',
    tags TEXT[],
    event_id BIGINT REFERENCES events(id),
    organization_id BIGINT,
    read_by UUID[]
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id BIGINT REFERENCES characters(id),
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR NOT NULL DEFAULT 'pending',
    payment_status VARCHAR DEFAULT 'pending',
    notes TEXT,
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMPTZ,
    UNIQUE(event_id, player_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    session_name VARCHAR NOT NULL,
    session_number INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location VARCHAR,
    gm_id UUID REFERENCES auth.users(id),
    max_players INTEGER,
    current_players INTEGER DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'scheduled',
    session_type VARCHAR NOT NULL DEFAULT 'main',
    description TEXT,
    recap TEXT,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE,
    character_id BIGINT REFERENCES characters(id) ON DELETE CASCADE,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR NOT NULL DEFAULT 'active',
    role VARCHAR DEFAULT 'player',
    xp_earned INTEGER DEFAULT 0,
    performance_notes TEXT,
    UNIQUE(session_id, character_id)
);

-- Enable RLS on new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies

-- Events policies
CREATE POLICY "Users can view public events" ON events
    FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "GMs and admins can create events" ON events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

CREATE POLICY "Event creators and GMs can update events" ON events
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

-- Communications policies
CREATE POLICY "Users can view published communications" ON communications
    FOR SELECT USING (
        status = 'published' OR
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

CREATE POLICY "GMs and admins can create communications" ON communications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can view their registrations" ON event_registrations
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);
CREATE INDEX IF NOT EXISTS idx_communications_author_id ON communications(author_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_player_id ON event_registrations(player_id);
