-- Add settings column to profiles table for user preferences
-- This script safely adds the settings column if it doesn't exist

-- Add settings column as JSONB for flexible user preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add index for better performance on settings queries
CREATE INDEX IF NOT EXISTS idx_profiles_settings ON profiles USING gin(settings);

-- Add comment to document the column
COMMENT ON COLUMN profiles.settings IS 'User preferences and settings stored as JSON object';

-- Example of how settings might be structured:
-- {
--   "name": "LARP Manager",
--   "description": "Sistema di gestione LARP",
--   "theme": "dark",
--   "language": "it",
--   "emailNotifications": true,
--   "sessionReminders": true,
--   "characterUpdates": false,
--   "systemMaintenance": false,
--   "autoBackup": false,
--   "backupFrequency": "weekly",
--   "retentionPeriod": "30",
--   "accentColor": "fantasy",
--   "compactMode": false,
--   "animationEffects": true,
--   "timezone": "Europe/Rome"
-- }
