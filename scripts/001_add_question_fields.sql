-- Migration: Add llm_rubric and max_score to questions table
-- Required for task 005 (test-engine-and-real-data)
-- Run in Supabase SQL Editor before seeding.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS llm_rubric TEXT,
  ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 4;
