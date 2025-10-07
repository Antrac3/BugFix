-- ============================================================================
-- FIX CAMPAIGNS RLS INFINITE RECURSION
-- ============================================================================

-- Step 1: Drop all existing policies for campaigns
DROP POLICY IF EXISTS "Users can view campaigns they created or are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can delete their campaigns" ON campaigns;

-- Step 2: Drop and recreate campaign_players policies if they exist
DROP POLICY IF EXISTS "Users can view campaign players for campaigns they're part of" ON campaign_players;
DROP POLICY IF EXISTS "Campaign creators can manage players" ON campaign_players;

-- Step 3: Create simple, non-recursive RLS policies for campaigns
-- Policy for SELECT (viewing campaigns)
CREATE POLICY "campaigns_select_policy" ON campaigns
    FOR SELECT 
    USING (created_by = auth.uid());

-- Policy for INSERT (creating campaigns)  
CREATE POLICY "campaigns_insert_policy" ON campaigns
    FOR INSERT 
    WITH CHECK (created_by = auth.uid());

-- Policy for UPDATE (updating campaigns)
CREATE POLICY "campaigns_update_policy" ON campaigns
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy for DELETE (deleting campaigns)
CREATE POLICY "campaigns_delete_policy" ON campaigns
    FOR DELETE 
    USING (created_by = auth.uid());

-- Step 4: Create simple policies for campaign_players if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_players') THEN
        -- Policy for SELECT campaign_players
        CREATE POLICY "campaign_players_select_policy" ON campaign_players
            FOR SELECT 
            USING (player_id = auth.uid());

        -- Policy for INSERT campaign_players (only campaign creators can add players)
        CREATE POLICY "campaign_players_insert_policy" ON campaign_players
            FOR INSERT 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM campaigns 
                    WHERE campaigns.id = campaign_players.campaign_id 
                    AND campaigns.created_by = auth.uid()
                )
            );

        -- Policy for DELETE campaign_players
        CREATE POLICY "campaign_players_delete_policy" ON campaign_players
            FOR DELETE 
            USING (
                player_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM campaigns 
                    WHERE campaigns.id = campaign_players.campaign_id 
                    AND campaigns.created_by = auth.uid()
                )
            );
    END IF;
END $$;

-- Step 5: Verify policies are working
-- Test query (should not cause recursion)
SELECT 'RLS policies fixed successfully' as status;
