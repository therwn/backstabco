-- Update builds table to ensure all required columns exist
-- This script will add missing columns if they don't exist

-- Add consumables column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'builds' AND column_name = 'consumables'
    ) THEN
        ALTER TABLE builds ADD COLUMN consumables JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add spells column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'builds' AND column_name = 'spells'
    ) THEN
        ALTER TABLE builds ADD COLUMN spells JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add equipment column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'builds' AND column_name = 'equipment'
    ) THEN
        ALTER TABLE builds ADD COLUMN equipment JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'builds' AND column_name = 'tags'
    ) THEN
        ALTER TABLE builds ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add creator_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'builds' AND column_name = 'creator_name'
    ) THEN
        ALTER TABLE builds ADD COLUMN creator_name TEXT;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'builds' 
ORDER BY ordinal_position;
