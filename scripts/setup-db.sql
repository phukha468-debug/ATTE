-- =============================================================
-- 66AI Platform — Полная инициализация базы данных
-- Запускать в Supabase SQL Editor (целиком)
-- Безопасно повторно запускать: использует IF NOT EXISTS / OR REPLACE
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. COMPANIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  industry      TEXT NOT NULL DEFAULT 'other',
  size_total    INTEGER NOT NULL DEFAULT 1,
  size_office   INTEGER NOT NULL DEFAULT 1,
  tariff        TEXT NOT NULL DEFAULT 'free'
                  CHECK (tariff IN ('free', 'standard', 'premium')),
  hourly_rate   INTEGER NOT NULL DEFAULT 1000,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. PROFILES (привязан к auth.users по id)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('employee', 'manager', 'admin')),
  department    TEXT,
  job_title     TEXT,
  profile_id    TEXT,   -- код специализации (sales_b2b, hr, marketing...)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. INVITES — система приглашений сотрудников в компанию
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  max_uses      INTEGER NOT NULL DEFAULT 50,
  used_count    INTEGER NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id),
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. QUESTIONS — банк вопросов Этапа 1
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL,   -- routine | prompting | limitations | legal
  text          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('mcq', 'open')),
  options       JSONB,            -- [{ text, is_correct }] для MCQ
  llm_rubric    TEXT,             -- критерии для open-вопросов
  max_score     INTEGER NOT NULL DEFAULT 4,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 5. STAGE 1 RESULTS — результаты теста знаний
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stage1_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  total_score   INTEGER NOT NULL DEFAULT 0,  -- 0-100
  passed        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 6. ROUTINE MAP ITEMS — карта рутины сотрудника (из Этапа 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routine_map_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id            UUID REFERENCES companies(id) ON DELETE SET NULL,
  stage1_result_id      UUID REFERENCES stage1_results(id) ON DELETE SET NULL,
  task_name             TEXT NOT NULL,
  task_category         TEXT,
  claimed_monthly_hours NUMERIC(6,1) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 7. STAGE 2 RESULTS — результаты симулятора
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stage2_results (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id                UUID REFERENCES companies(id) ON DELETE SET NULL,
  profile_id                TEXT,     -- код профиля (sales_b2b, hr...)
  task_id                   TEXT,     -- id задачи из simulatorData (M-1, S-1...)
  acceleration_x            NUMERIC(5,2),  -- множитель ускорения от LLM-судьи
  score_total               NUMERIC(5,1),  -- итоговый балл 0-100
  score_prompting           NUMERIC(5,1),  -- качество промптов
  score_iterativeness       NUMERIC(5,1),  -- итеративность
  validated_hours_per_month NUMERIC(6,1),  -- подтверждённая экономия ч/мес
  passed                    BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 8. STAGE 3 RESULTS — результаты микро-проектов
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stage3_results (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id                UUID REFERENCES companies(id) ON DELETE SET NULL,
  project_name              TEXT,
  linked_routine_task       TEXT,
  verdict                   TEXT NOT NULL DEFAULT 'pending'
                              CHECK (verdict IN ('pending', 'approved', 'rejected')),
  confirmed_hours_per_month NUMERIC(6,1),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 9. ASSESSMENT RESULTS — итоговая аттестация (авто-заполняется)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_results (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id                UUID REFERENCES companies(id) ON DELETE SET NULL,
  stage1_result_id          UUID REFERENCES stage1_results(id) ON DELETE SET NULL,
  stage2_result_id          UUID REFERENCES stage2_results(id) ON DELETE SET NULL,
  stage3_result_id          UUID REFERENCES stage3_results(id) ON DELETE SET NULL,
  final_grade               INTEGER CHECK (final_grade BETWEEN 1 AND 5),
  grade_name                TEXT,
  is_champion               BOOLEAN DEFAULT false,
  needs_training            BOOLEAN DEFAULT false,
  validated_hours_per_month NUMERIC(6,1),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 10. ТРИГГЕР: авто-заполнение assessment_results
--     Срабатывает при INSERT/UPDATE на stage3_results
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_compute_assessment()
RETURNS TRIGGER AS $$
DECLARE
  v_s1        stage1_results%ROWTYPE;
  v_s2        stage2_results%ROWTYPE;
  v_grade     INTEGER;
  v_name      TEXT;
  v_hours     NUMERIC;
BEGIN
  -- Берём последние результаты этапов 1 и 2 для этого пользователя
  SELECT * INTO v_s1
    FROM stage1_results WHERE user_id = NEW.user_id
    ORDER BY created_at DESC LIMIT 1;

  SELECT * INTO v_s2
    FROM stage2_results WHERE user_id = NEW.user_id
    ORDER BY created_at DESC LIMIT 1;

  -- Рассчитываем итоговый грейд (1–5)
  IF COALESCE(v_s1.total_score, 0) >= 80 AND COALESCE(v_s2.score_total, 0) >= 80 THEN
    v_grade := 5;
  ELSIF COALESCE(v_s1.total_score, 0) >= 65 AND COALESCE(v_s2.score_total, 0) >= 65 THEN
    v_grade := 4;
  ELSIF COALESCE(v_s1.total_score, 0) >= 50 AND COALESCE(v_s2.score_total, 0) >= 50 THEN
    v_grade := 3;
  ELSIF COALESCE(v_s1.total_score, 0) >= 35 OR COALESCE(v_s2.score_total, 0) >= 35 THEN
    v_grade := 2;
  ELSE
    v_grade := 1;
  END IF;

  -- Название грейда
  CASE v_grade
    WHEN 5 THEN v_name := 'Эксперт';
    WHEN 4 THEN v_name := 'Продвинутый';
    WHEN 3 THEN v_name := 'Практик';
    WHEN 2 THEN v_name := 'Начинающий';
    ELSE        v_name := 'Новичок';
  END CASE;

  -- Экономия часов: из stage2 или из stage3
  v_hours := COALESCE(v_s2.validated_hours_per_month, NEW.confirmed_hours_per_month);

  -- Upsert в assessment_results
  INSERT INTO assessment_results (
    user_id, company_id,
    stage1_result_id, stage2_result_id, stage3_result_id,
    final_grade, grade_name, is_champion, needs_training,
    validated_hours_per_month, updated_at
  ) VALUES (
    NEW.user_id, NEW.company_id,
    v_s1.id, v_s2.id, NEW.id,
    v_grade, v_name, (v_grade = 5), (v_grade <= 2),
    v_hours, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stage3_result_id          = EXCLUDED.stage3_result_id,
    final_grade               = EXCLUDED.final_grade,
    grade_name                = EXCLUDED.grade_name,
    is_champion               = EXCLUDED.is_champion,
    needs_training            = EXCLUDED.needs_training,
    validated_hours_per_month = EXCLUDED.validated_hours_per_month,
    updated_at                = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Вешаем триггер (пересоздаём если уже есть)
DROP TRIGGER IF EXISTS trg_assessment_on_stage3 ON stage3_results;
CREATE TRIGGER trg_assessment_on_stage3
  AFTER INSERT OR UPDATE ON stage3_results
  FOR EACH ROW EXECUTE FUNCTION fn_compute_assessment();

-- ─────────────────────────────────────────────────────────────
-- 11. RLS — Row Level Security
-- ─────────────────────────────────────────────────────────────

-- Включаем RLS на всех таблицах
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage1_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_map_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage2_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage3_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results  ENABLE ROW LEVEL SECURITY;

-- COMPANIES: видишь только свою компанию
DROP POLICY IF EXISTS "companies_select_own" ON companies;
CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "companies_service_role" ON companies;
CREATE POLICY "companies_service_role" ON companies
  FOR ALL USING (auth.role() = 'service_role');

-- PROFILES: видишь свою строку + коллег по компании (для дашборда)
DROP POLICY IF EXISTS "profiles_select_own_company" ON profiles;
CREATE POLICY "profiles_select_own_company" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "profiles_service_role" ON profiles;
CREATE POLICY "profiles_service_role" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- QUESTIONS: читают все авторизованные пользователи
DROP POLICY IF EXISTS "questions_select_all_auth" ON questions;
CREATE POLICY "questions_select_all_auth" ON questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "questions_service_role" ON questions;
CREATE POLICY "questions_service_role" ON questions
  FOR ALL USING (auth.role() = 'service_role');

-- STAGE1_RESULTS: видишь только свои
DROP POLICY IF EXISTS "s1_select_own" ON stage1_results;
CREATE POLICY "s1_select_own" ON stage1_results
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "s1_service_role" ON stage1_results;
CREATE POLICY "s1_service_role" ON stage1_results
  FOR ALL USING (auth.role() = 'service_role');

-- ROUTINE_MAP_ITEMS: видишь только свои
DROP POLICY IF EXISTS "rmi_select_own" ON routine_map_items;
CREATE POLICY "rmi_select_own" ON routine_map_items
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "rmi_service_role" ON routine_map_items;
CREATE POLICY "rmi_service_role" ON routine_map_items
  FOR ALL USING (auth.role() = 'service_role');

-- STAGE2_RESULTS: видишь только свои
DROP POLICY IF EXISTS "s2_select_own" ON stage2_results;
CREATE POLICY "s2_select_own" ON stage2_results
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "s2_service_role" ON stage2_results;
CREATE POLICY "s2_service_role" ON stage2_results
  FOR ALL USING (auth.role() = 'service_role');

-- STAGE3_RESULTS: своя строка + менеджер компании
DROP POLICY IF EXISTS "s3_select_own_or_manager" ON stage3_results;
CREATE POLICY "s3_select_own_or_manager" ON stage3_results
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

DROP POLICY IF EXISTS "s3_service_role" ON stage3_results;
CREATE POLICY "s3_service_role" ON stage3_results
  FOR ALL USING (auth.role() = 'service_role');

-- ASSESSMENT_RESULTS: своя строка + менеджер видит всю компанию
DROP POLICY IF EXISTS "ar_select_own_or_manager" ON assessment_results;
CREATE POLICY "ar_select_own_or_manager" ON assessment_results
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

DROP POLICY IF EXISTS "ar_service_role" ON assessment_results;
CREATE POLICY "ar_service_role" ON assessment_results
  FOR ALL USING (auth.role() = 'service_role');

-- INVITES: менеджер видит инвайты своей компании
DROP POLICY IF EXISTS "invites_manager" ON invites;
CREATE POLICY "invites_manager" ON invites
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

DROP POLICY IF EXISTS "invites_service_role" ON invites;
CREATE POLICY "invites_service_role" ON invites
  FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- ГОТОВО. Запусти этот скрипт один раз в SQL Editor Supabase.
-- После запуска проверь что все 9 таблиц появились в Database > Tables
-- ─────────────────────────────────────────────────────────────
