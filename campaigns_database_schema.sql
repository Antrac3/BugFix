-- ============================================================================
-- CAMPAIGNS DATABASE SCHEMA
-- ============================================================================

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
    duration INTEGER DEFAULT 4, -- hours
    notes TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    organization_id BIGINT
);

-- Add campaign_id to existing tables
ALTER TABLE characters ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL;

-- Create campaign_players junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS campaign_players (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'gm', 'co_gm')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive', 'left')),
    UNIQUE(campaign_id, player_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);

CREATE INDEX IF NOT EXISTS idx_characters_campaign ON characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_npcs_campaign ON npcs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_campaign ON events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_locations_campaign ON locations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_rules_campaign ON rules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_communications_campaign ON communications(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign ON campaign_players(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_players_player ON campaign_players(player_id);

-- Enable RLS on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns they created or are part of" ON campaigns
    FOR SELECT USING (
        created_by = auth.uid() OR 
        id IN (SELECT campaign_id FROM campaign_players WHERE player_id = auth.uid())
    );

CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Campaign creators can update their campaigns" ON campaigns
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Campaign creators can delete their campaigns" ON campaigns
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for campaign_players
CREATE POLICY "Users can view campaign players for campaigns they're part of" ON campaign_players
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE created_by = auth.uid()
            UNION
            SELECT campaign_id FROM campaign_players WHERE player_id = auth.uid()
        )
    );

CREATE POLICY "Campaign creators can manage players" ON campaign_players
    FOR ALL USING (
        campaign_id IN (SELECT id FROM campaigns WHERE created_by = auth.uid())
    );

-- Update existing data to support campaigns (optional - run manually if needed)
-- UPDATE characters SET campaign_id = 1 WHERE campaign_id IS NULL; -- Assign to default campaign
-- UPDATE npcs SET campaign_id = 1 WHERE campaign_id IS NULL;
-- UPDATE events SET campaign_id = 1 WHERE campaign_id IS NULL;

-- Comments for documentation
COMMENT ON TABLE campaigns IS 'Main campaigns table storing LARP campaign information';
COMMENT ON TABLE campaign_players IS 'Junction table for many-to-many relationship between campaigns and players';
COMMENT ON COLUMN campaigns.duration IS 'Session duration in hours';
COMMENT ON COLUMN campaigns.max_players IS 'Maximum number of players allowed in the campaign';
COMMENT ON COLUMN campaign_players.role IS 'Role of the player in the campaign (player, gm, co_gm)';
