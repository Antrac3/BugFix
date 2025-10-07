-- ============================================================================
-- FIX RLS POLICIES FOR CAMPAIGNS - REMOVE INFINITE RECURSION
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view campaigns they created or are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can delete their campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can view campaign players for campaigns they're part of" ON campaign_players;
DROP POLICY IF EXISTS "Campaign creators can manage players" ON campaign_players;

-- Recreate simpler, non-recursive policies for campaigns
CREATE POLICY "Users can view all campaigns" ON campaigns
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Campaign creators can update their campaigns" ON campaigns
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Campaign creators can delete their campaigns" ON campaigns
    FOR DELETE USING (created_by = auth.uid());

-- Recreate simpler policies for campaign_players  
CREATE POLICY "Users can view all campaign players" ON campaign_players
    FOR SELECT USING (true);

CREATE POLICY "Campaign creators and players can manage their participation" ON campaign_players
    FOR ALL USING (
        player_id = auth.uid() OR 
        campaign_id IN (SELECT id FROM campaigns WHERE created_by = auth.uid())
    );

-- Alternative: If you want more restrictive access, use these instead:
-- (Comment out the policies above and uncomment these)

/*
-- More restrictive: Users can only see campaigns they created or are explicitly part of
CREATE POLICY "Users can view their campaigns" ON campaigns
    FOR SELECT USING (
        created_by = auth.uid() OR 
        EXISTS (SELECT 1 FROM campaign_players WHERE campaign_id = campaigns.id AND player_id = auth.uid())
    );

-- More restrictive: Users can only see campaign players for campaigns they're involved with
CREATE POLICY "Users can view relevant campaign players" ON campaign_players
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_players.campaign_id AND created_by = auth.uid())
    );
*/

-- Verify policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('campaigns', 'campaign_players')
ORDER BY tablename, policyname;
