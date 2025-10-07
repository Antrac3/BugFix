-- LARP Manager Database Schema for Supabase (SAFE VERSION)
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist (safer approach)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS character_status CASCADE;
DROP TYPE IF EXISTS location_type CASCADE;
DROP TYPE IF EXISTS location_status CASCADE;
DROP TYPE IF EXISTS contact_type CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS rarity_type CASCADE;
DROP TYPE IF EXISTS rule_priority CASCADE;
DROP TYPE IF EXISTS rule_visibility CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('player', 'gm', 'admin');
CREATE TYPE character_status AS ENUM ('active', 'inactive');
CREATE TYPE location_type AS ENUM ('outdoor', 'indoor', 'industrial', 'garden');
CREATE TYPE location_status AS ENUM ('available', 'booked', 'maintenance');
CREATE TYPE contact_type AS ENUM ('vendor', 'actor', 'collaborator', 'supplier');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled');
CREATE TYPE rarity_type AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE rule_priority AS ENUM ('bassa', 'media', 'alta');
CREATE TYPE rule_visibility AS ENUM ('public', 'gm_only');
CREATE TYPE notification_type AS ENUM ('message', 'session', 'alert', 'update', 'approval');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Drop existing tables if they exist (safer approach)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.xp_awards CASCADE;
DROP TABLE IF EXISTS public.rules CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.npcs CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'player',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Characters table
CREATE TABLE public.characters (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status character_status DEFAULT 'active',
    xp INTEGER DEFAULT 0,
    avatar_url TEXT,
    background TEXT NOT NULL,
    last_session DATE NOT NULL,
    abilities TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPCs table
CREATE TABLE public.npcs (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    stats JSONB DEFAULT '{}'::jsonb,
    location TEXT,
    linked_events TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE public.locations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB,
    type location_type NOT NULL,
    capacity INTEGER NOT NULL,
    status location_status DEFAULT 'available',
    description TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    contact TEXT NOT NULL,
    notes TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    upcoming_events JSONB[] DEFAULT '{}',
    last_used DATE,
    rating DECIMAL(2,1) DEFAULT 0,
    price_range TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE public.contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type contact_type NOT NULL,
    category TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    address TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0,
    notes TEXT DEFAULT '',
    last_contact DATE NOT NULL,
    total_interactions INTEGER DEFAULT 0,
    services TEXT[] DEFAULT '{}',
    price_range TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignees TEXT[] DEFAULT '{}',
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    deadline DATE NOT NULL,
    created DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    estimated_hours DECIMAL(5,2) DEFAULT 0,
    actual_hours DECIMAL(5,2) DEFAULT 0,
    completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE public.inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    rarity rarity_type DEFAULT 'common',
    effects TEXT NOT NULL,
    character_id BIGINT REFERENCES public.characters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
    id BIGSERIAL PRIMARY KEY,
    from_character TEXT NOT NULL,
    to_character TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_in_character BOOLEAN DEFAULT TRUE,
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rules table
CREATE TABLE public.rules (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    priority rule_priority DEFAULT 'media',
    visibility rule_visibility DEFAULT 'public',
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- XP Awards table
CREATE TABLE public.xp_awards (
    id BIGSERIAL PRIMARY KEY,
    character_id BIGINT REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
    xp_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    awarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_date DATE
);

-- Notifications table
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    priority notification_priority DEFAULT 'medium',
    category TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    related_data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_characters_player_id ON public.characters(player_id);
CREATE INDEX idx_characters_status ON public.characters(status);
CREATE INDEX idx_npcs_created_by ON public.npcs(created_by);
CREATE INDEX idx_locations_status ON public.locations(status);
CREATE INDEX idx_locations_type ON public.locations(type);
CREATE INDEX idx_tasks_assignees ON public.tasks USING GIN(assignees);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);
CREATE INDEX idx_rules_category ON public.rules(category);
CREATE INDEX idx_rules_visibility ON public.rules(visibility);
CREATE INDEX idx_xp_awards_character ON public.xp_awards(character_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON public.npcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON public.rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins and GMs can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

-- Characters policies
CREATE POLICY "Users can view their own characters" ON public.characters
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "Users can manage their own characters" ON public.characters
    FOR ALL USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON public.messages
    FOR UPDATE USING (to_user_id = auth.uid());

-- Rules policies
CREATE POLICY "Everyone can view public rules" ON public.rules
    FOR SELECT USING (
        visibility = 'public' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage rules" ON public.rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- GM/Admin only tables policies
CREATE POLICY "GMs and admins can manage NPCs" ON public.npcs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage locations" ON public.locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage contacts" ON public.contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage tasks" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage inventory" ON public.inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

CREATE POLICY "GMs and admins can manage XP awards" ON public.xp_awards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'gm')
        )
    );

-- Insert some sample data
INSERT INTO public.rules (title, content, category, priority, visibility, tags, created_by) 
SELECT 
    'Regole Base del LARP', 
    'Le regole fondamentali per partecipare alle sessioni LARP...', 
    'Regole Base', 
    'alta', 
    'public', 
    '{"base", "fondamentali"}', 
    (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users);

INSERT INTO public.rules (title, content, category, priority, visibility, tags, created_by) 
SELECT 
    'Sistema di Combattimento', 
    'Come funziona il combattimento durante le sessioni...', 
    'Combattimento', 
    'alta', 
    'public', 
    '{"combattimento", "sicurezza"}',
    (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users);

-- Create storage bucket for avatars and files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database migration completed successfully!';
    RAISE NOTICE '📊 Created tables: profiles, characters, npcs, locations, contacts, tasks, inventory_items, messages, rules, xp_awards, notifications';
    RAISE NOTICE '🔐 Row Level Security policies applied';
    RAISE NOTICE '🚀 Ready to register users and use the application!';
END $$;
