-- Fix Foreign Key Relationships for Communications Table
-- Run this in your Supabase SQL Editor

-- First, check if the communications table exists and its structure
-- (This is just for reference, don't need to run these SELECT statements)
-- SELECT * FROM information_schema.tables WHERE table_name = 'communications';
-- SELECT * FROM information_schema.columns WHERE table_name = 'communications';

-- Fix the author_id foreign key if it doesn't exist
-- First, try to add the foreign key constraint
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'communications_author_id_fkey' 
        AND table_name = 'communications'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE communications 
        ADD CONSTRAINT communications_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for author_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for author_id already exists';
    END IF;
END $$;

-- Also fix the event_id foreign key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'communications_event_id_fkey' 
        AND table_name = 'communications'
    ) THEN
        -- Add the foreign key constraint for event_id
        ALTER TABLE communications 
        ADD CONSTRAINT communications_event_id_fkey 
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for event_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for event_id already exists';
    END IF;
END $$;

-- Update the RLS policy to ensure it works properly
DROP POLICY IF EXISTS "GMs and admins can create communications" ON communications;

CREATE POLICY "GMs and admins can create communications" ON communications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('gm', 'admin')
        )
    );

-- Ensure profiles table has the right structure for the relationship
-- Check if profiles.id is actually UUID type to match auth.users.id
DO $$
BEGIN
    -- Update profiles table to ensure id column is UUID if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- This would need manual intervention as it might break existing data
        RAISE NOTICE 'WARNING: profiles.id column is not UUID type. Manual fix needed.';
    END IF;
END $$;

-- Refresh the PostgREST schema cache to recognize the new relationships
NOTIFY pgrst, 'reload schema';
