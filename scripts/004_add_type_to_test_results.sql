-- Migration 004: Add type to test_results and create simulator_results structure
-- Run in Supabase SQL Editor

-- Add type column to test_results to distinguish Stage 1 and Stage 2
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'stage1';

-- Update existing results to stage1 (just in case)
UPDATE test_results SET type = 'stage1' WHERE type IS NULL;
