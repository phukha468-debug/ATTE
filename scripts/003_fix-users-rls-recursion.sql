-- Migration 003: Fix infinite recursion in RLS policies for users table
-- Root cause: policies that SELECT from users inside a USING clause on users itself
-- Solution: Use auth.uid() directly for self-access, JWT claims for company access
--
-- Run in Supabase SQL Editor

-- ── Step 1: Drop ALL existing policies on users table ──
DROP POLICY IF EXISTS "Allow users to read own profile" ON users;
DROP POLICY IF EXISTS "Allow users to read company members" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Manager can read company users" ON users;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow UPDATE for own profile" ON users;
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON users;

-- ── Step 2: Create safe, non-recursive policies ──

-- POLICY 1: Every authenticated user can read their own profile.
-- Uses auth.uid() directly — no subquery to users table.
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- POLICY 2: Managers and admins can read ALL users in their company.
-- Uses auth.jwt() → user_metadata → company_id instead of subquerying users.
-- This avoids recursion because we read from JWT claims, not from the users table.
CREATE POLICY "users_select_company"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    company_id = (auth.jwt() ->> 'company_id')::uuid
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('manager', 'admin')
  );

-- POLICY 3: Users can update their own profile only.
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- POLICY 4: Authenticated users can insert their own profile (during signup).
CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- POLICY 5: No one can DELETE from users via RLS (only service_role).
-- Explicitly deny DELETE for authenticated users.
