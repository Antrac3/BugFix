-- Database Schema Update for Events, Sessions, and Communications
-- Run this in your Supabase SQL Editor

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

-- Organizations table (for future multi-org support)
CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    address TEXT,
    logo_url VARCHAR,
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR NOT NULL DEFAULT 'active'
);

-- Organization memberships table
CREATE TABLE IF NOT EXISTS organization_memberships (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    status VARCHAR NOT NULL DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    UNIQUE(organization_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_event_id ON sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_player_id ON event_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);
CREATE INDEX IF NOT EXISTS idx_communications_author_id ON communications(author_id);

-- Enable RLS on all new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies

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

CREATE POLICY "Event creators and admins can delete events" ON events
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sessions policies
CREATE POLICY "Users can view sessions of viewable events" ON sessions
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM events 
            WHERE visibility = 'public' OR created_by = auth.uid()
        )
    );

CREATE POLICY "GMs and admins can create sessions" ON sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

CREATE POLICY "GMs and admins can update sessions" ON sessions
    FOR UPDATE USING (
        gm_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view their registrations" ON event_registrations
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their registrations" ON event_registrations
    FOR UPDATE USING (player_id = auth.uid());

CREATE POLICY "Users can cancel their registrations" ON event_registrations
    FOR DELETE USING (player_id = auth.uid());

-- Session participants policies
CREATE POLICY "Users can view session participants" ON session_participants
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

CREATE POLICY "Users can join sessions" ON session_participants
    FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "GMs can manage session participants" ON session_participants
    FOR ALL USING (
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

CREATE POLICY "Authors and admins can update communications" ON communications
    FOR UPDATE USING (
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Authors and admins can delete communications" ON communications
    FOR DELETE USING (
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Organizations policies (basic setup for future expansion)
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create organizations" ON organizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Organization memberships policies
CREATE POLICY "Users can view their memberships" ON organization_memberships
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
