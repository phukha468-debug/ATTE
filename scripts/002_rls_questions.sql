-- RLS Policies for ATTE questions table
-- Run in Supabase SQL Editor
-- Goal: authenticated users can SELECT questions, but only Service Role can INSERT/UPDATE/DELETE

-- 1. Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 2. Allow SELECT for all authenticated users
CREATE POLICY "Allow SELECT for authenticated users"
ON questions
FOR SELECT
TO authenticated
USING (true);

-- 3. Deny INSERT/UPDATE/DELETE for non-admin roles (only service_role can write)
-- By default, no policies = deny. So we only create the SELECT policy above.
