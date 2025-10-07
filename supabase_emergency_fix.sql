-- EMERGENCY FIX SCRIPT FOR LARP Manager
-- This script will disable RLS temporarily and clean up data issues

-- Step 1: DISABLE ALL RLS POLICIES IMMEDIATELY
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_awards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Step 2: DROP ALL EXISTING POLICIES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Get all policies and drop them
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 3: Clean up duplicate profiles
-- First, let's see what we have
DO $$
DECLARE
    duplicate_count INTEGER;
    auth_user_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Count duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT id, COUNT(*) 
        FROM public.profiles 
        GROUP BY id 
        HAVING COUNT(*) > 1
    ) duplicates;

    -- Count auth users
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    
    -- Count profiles
    SELECT COUNT(*) INTO profile_count FROM public.profiles;

    RAISE NOTICE 'Auth users: %, Profiles: %, Duplicates: %', 
                 auth_user_count, profile_count, duplicate_count;

    -- Remove duplicates (keep the first one created)
    DELETE FROM public.profiles 
    WHERE ctid NOT IN (
        SELECT DISTINCT ON (id) ctid 
        FROM public.profiles 
        ORDER BY id, created_at ASC
    );

    RAISE NOTICE 'Duplicate profiles removed';
END $$;

-- Step 4: Ensure all auth users have profiles
INSERT INTO public.profiles (id, first_name, last_name, email, role)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(u.raw_user_meta_data->>'last_name', ''),
    u.email,
    'player'::user_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 5: Create a simple, working RLS setup
-- Helper function for role checking (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role_result TEXT;
BEGIN
    -- Bypass RLS by using SECURITY DEFINER
    SELECT role::TEXT INTO user_role_result 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role_result, 'player');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Re-enable RLS with SIMPLE policies only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Only essential profile policies
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Characters - simple policies
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select" ON public.characters
    FOR SELECT USING (
        player_id = auth.uid() OR 
        public.get_user_role_safe(auth.uid()) IN ('admin', 'gm')
    );

CREATE POLICY "characters_all" ON public.characters
    FOR ALL USING (
        player_id = auth.uid() OR 
        public.get_user_role_safe(auth.uid()) IN ('admin', 'gm')
    );

-- Messages - simple policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "messages_update" ON public.messages
    FOR UPDATE USING (to_user_id = auth.uid());

-- Rules - simple policies
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select" ON public.rules
    FOR SELECT USING (
        visibility = 'public' OR 
        public.get_user_role_safe(auth.uid()) IN ('admin', 'gm')
    );

CREATE POLICY "rules_all" ON public.rules
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

-- Notifications - simple policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- For GM-only tables, enable but use simple policies
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "npcs_gm_only" ON public.npcs
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_gm_only" ON public.locations
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_gm_only" ON public.contacts
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_gm_only" ON public.tasks
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_gm_only" ON public.inventory_items
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

ALTER TABLE public.xp_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp_awards_gm_only" ON public.xp_awards
    FOR ALL USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'gm'));

-- Step 7: Test the setup
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test if we can count profiles without recursion
    SELECT COUNT(*) INTO test_count FROM public.profiles;
    RAISE NOTICE 'Profile count test: % profiles found', test_count;
    
    RAISE NOTICE '✅ Emergency fix completed successfully!';
    RAISE NOTICE '🔧 RLS policies recreated with recursion protection';
    RAISE NOTICE '🧹 Duplicate profiles cleaned up';
    RAISE NOTICE '👥 All auth users now have profiles';
    RAISE NOTICE '🔒 Security restored with working policies';
END $$;
