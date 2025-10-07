-- Supabase Schema Fix - Update all column names to match expected camelCase format
-- This script ensures the database schema matches what the application expects

-- First, let's ensure all tables exist with correct columns
-- Note: This script assumes the main tables already exist from previous migrations

-- Update any tables that might have incorrect column names
-- The application expects camelCase but database typically uses snake_case

-- Check if we need to add any missing columns or fix existing ones

-- Add any missing columns that might cause the "column not found" errors
-- For NPCs table
DO $$
BEGIN
    -- Check if created_at column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='npcs' AND column_name='created_at') THEN
        ALTER TABLE npcs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- For locations table
DO $$
BEGIN
    -- Check if last_used column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='locations' AND column_name='last_used') THEN
        ALTER TABLE locations ADD COLUMN last_used DATE;
    END IF;
END $$;

-- For contacts table
DO $$
BEGIN
    -- Check if contact_person column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='contacts' AND column_name='contact_person') THEN
        ALTER TABLE contacts ADD COLUMN contact_person TEXT;
    END IF;
END $$;

-- For tasks table
DO $$
BEGIN
    -- Check if actual_hours column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tasks' AND column_name='actual_hours') THEN
        ALTER TABLE tasks ADD COLUMN actual_hours NUMERIC DEFAULT 0;
    END IF;

    -- Note: attachments column was removed from application code as it's not in the schema
    -- The application no longer expects this column
END $$;

-- For inventory_items table
DO $$
BEGIN
    -- Check if character_id column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='inventory_items' AND column_name='character_id') THEN
        ALTER TABLE inventory_items ADD COLUMN character_id INTEGER REFERENCES characters(id);
    END IF;
END $$;

-- Update any NULL values in required columns
UPDATE npcs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE locations SET last_used = NOW()::DATE WHERE last_used IS NULL;
UPDATE contacts SET contact_person = name WHERE contact_person IS NULL OR contact_person = '';
UPDATE tasks SET actual_hours = 0 WHERE actual_hours IS NULL;

-- Note: For created_by fields in NPCs, the application now uses the actual user UUID
-- instead of hardcoded "Game Master" string, which should prevent UUID syntax errors

-- Ensure all tables have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_npcs_created_at ON npcs(created_at);
CREATE INDEX IF NOT EXISTS idx_locations_last_used ON locations(last_used);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_person ON contacts(contact_person);
CREATE INDEX IF NOT EXISTS idx_tasks_actual_hours ON tasks(actual_hours);
CREATE INDEX IF NOT EXISTS idx_inventory_character_id ON inventory_items(character_id);

-- Enable RLS on all tables if not already enabled
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create or update RLS policies for authenticated users
-- Note: These are permissive policies for development - should be restricted in production

-- NPCs policies
DROP POLICY IF EXISTS "npcs_select_policy" ON npcs;
CREATE POLICY "npcs_select_policy" ON npcs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "npcs_insert_policy" ON npcs;
CREATE POLICY "npcs_insert_policy" ON npcs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "npcs_update_policy" ON npcs;
CREATE POLICY "npcs_update_policy" ON npcs FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "npcs_delete_policy" ON npcs;
CREATE POLICY "npcs_delete_policy" ON npcs FOR DELETE TO authenticated USING (true);

-- Locations policies
DROP POLICY IF EXISTS "locations_select_policy" ON locations;
CREATE POLICY "locations_select_policy" ON locations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "locations_insert_policy" ON locations;
CREATE POLICY "locations_insert_policy" ON locations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "locations_update_policy" ON locations;
CREATE POLICY "locations_update_policy" ON locations FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "locations_delete_policy" ON locations;
CREATE POLICY "locations_delete_policy" ON locations FOR DELETE TO authenticated USING (true);

-- Contacts policies
DROP POLICY IF EXISTS "contacts_select_policy" ON contacts;
CREATE POLICY "contacts_select_policy" ON contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "contacts_insert_policy" ON contacts;
CREATE POLICY "contacts_insert_policy" ON contacts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contacts_update_policy" ON contacts;
CREATE POLICY "contacts_update_policy" ON contacts FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "contacts_delete_policy" ON contacts;
CREATE POLICY "contacts_delete_policy" ON contacts FOR DELETE TO authenticated USING (true);

-- Tasks policies
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
CREATE POLICY "tasks_select_policy" ON tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
CREATE POLICY "tasks_insert_policy" ON tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
CREATE POLICY "tasks_update_policy" ON tasks FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;
CREATE POLICY "tasks_delete_policy" ON tasks FOR DELETE TO authenticated USING (true);

-- Inventory items policies
DROP POLICY IF EXISTS "inventory_items_select_policy" ON inventory_items;
CREATE POLICY "inventory_items_select_policy" ON inventory_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "inventory_items_insert_policy" ON inventory_items;
CREATE POLICY "inventory_items_insert_policy" ON inventory_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inventory_items_update_policy" ON inventory_items;
CREATE POLICY "inventory_items_update_policy" ON inventory_items FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "inventory_items_delete_policy" ON inventory_items;
CREATE POLICY "inventory_items_delete_policy" ON inventory_items FOR DELETE TO authenticated USING (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Add some sample data if tables are empty (optional - for testing)
-- INSERT INTO npcs (name, role, description, stats, location, linked_events, notes, created_by)
-- SELECT 'Test NPC', 'Vendor', 'A test NPC for verification', '{}', 'Town Square', '{}', 'Test notes', (SELECT id FROM profiles LIMIT 1)
-- WHERE NOT EXISTS (SELECT 1 FROM npcs LIMIT 1);

-- INSERT INTO locations (name, address, type, capacity, status, description, amenities, contact, notes, images, upcoming_events, rating, price_range)
-- SELECT 'Test Location', 'Test Address', 'indoor', 50, 'available', 'A test location', '{}', 'Test Contact', 'Test notes', '{}', '{}', 4.0, '€50-100'
-- WHERE NOT EXISTS (SELECT 1 FROM locations LIMIT 1);
