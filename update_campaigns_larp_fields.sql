-- ============================================================================
-- ADD LARP-SPECIFIC FIELDS TO CAMPAIGNS TABLE
-- ============================================================================

-- Add LARP-specific columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS larp_type VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS physical_intensity VARCHAR(20) DEFAULT 'medium' CHECK (physical_intensity IN ('low', 'medium', 'high', 'extreme'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS combat_style VARCHAR(30) DEFAULT 'light_combat' CHECK (combat_style IN ('no_combat', 'light_combat', 'medium_combat', 'full_combat', 'boffer', 'latex'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS costume_requirements VARCHAR(30) DEFAULT 'suggested' CHECK (costume_requirements IN ('none', 'suggested', 'period_appropriate', 'required', 'full_kit'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS props_needed TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS age_rating VARCHAR(20) DEFAULT 'teen' CHECK (age_rating IN ('all_ages', 'teen', 'mature', 'adult'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS accessibility_notes TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS weather_dependency VARCHAR(20) DEFAULT 'indoor' CHECK (weather_dependency IN ('indoor', 'outdoor', 'mixed', 'weather_proof'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS safety_tools JSONB DEFAULT '[]';

-- Add comments for new fields
COMMENT ON COLUMN campaigns.larp_type IS 'Type of LARP: fantasy, chamber, battle, nordic, etc.';
COMMENT ON COLUMN campaigns.physical_intensity IS 'Physical intensity level required for participants';
COMMENT ON COLUMN campaigns.combat_style IS 'Type of combat system used in the LARP';
COMMENT ON COLUMN campaigns.costume_requirements IS 'Level of costume requirements for participants';
COMMENT ON COLUMN campaigns.props_needed IS 'Description of props and materials needed';
COMMENT ON COLUMN campaigns.age_rating IS 'Age rating and content appropriateness';
COMMENT ON COLUMN campaigns.accessibility_notes IS 'Accessibility considerations and accommodations';
COMMENT ON COLUMN campaigns.weather_dependency IS 'Dependency on weather conditions';
COMMENT ON COLUMN campaigns.safety_tools IS 'Safety tools and mechanisms used (JSON array)';

-- Update existing campaigns with default values if needed
UPDATE campaigns SET 
    larp_type = 'fantasy',
    physical_intensity = 'medium',
    combat_style = 'light_combat',
    costume_requirements = 'suggested',
    age_rating = 'teen',
    weather_dependency = 'indoor',
    safety_tools = '[]'
WHERE larp_type IS NULL;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_campaigns_larp_type ON campaigns(larp_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_physical_intensity ON campaigns(physical_intensity);
CREATE INDEX IF NOT EXISTS idx_campaigns_combat_style ON campaigns(combat_style);
CREATE INDEX IF NOT EXISTS idx_campaigns_age_rating ON campaigns(age_rating);

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN ('larp_type', 'physical_intensity', 'combat_style', 'costume_requirements', 'age_rating')
ORDER BY ordinal_position;

SELECT 'LARP fields added successfully!' as status;
