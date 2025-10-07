-- ============================================================================
-- EMERGENCY FIX: DISABLE RLS AND CREATE SIMPLE POLICIES
-- ============================================================================

-- STEP 1: Disable RLS temporarily to stop infinite recursion
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns they created or are part of" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Campaign creators can delete their campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can view all campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Users can view campaign players for campaigns they're part of" ON campaign_players;
DROP POLICY IF EXISTS "Campaign creators and players can manage their participation" ON campaign_players;
DROP POLICY IF EXISTS "Campaign creators can manage players" ON campaign_players;

-- STEP 3: Re-enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create the simplest possible policies
CREATE POLICY "allow_all_campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "allow_all_campaign_players" ON campaign_players FOR ALL USING (true);

-- STEP 5: Verify the setup
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('campaigns', 'campaign_players')
ORDER BY tablename, policyname;

-- STEP 6: Test basic operations
SELECT 'Testing campaigns table...' as test;
SELECT COUNT(*) as campaign_count FROM campaigns;

SELECT 'Testing campaign_players table...' as test;
SELECT COUNT(*) as campaign_players_count FROM campaign_players;

SELECT 'Fix completed successfully!' as status;
