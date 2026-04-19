# DB Schema Map — Карта всех точек входа/выхода в БД

> **Цель:** Единый документ для проверки соответствия кода и схемы БД.
> При изменении схемы — сначала обновить этот файл, потом менять код.
> **Обновлён:** 2026-04-19

---

## Легенда

| Символ | Значение |
|--------|----------|
| ✅ OK | Код соответствует схеме |
| 🔴 РАСХОЖДЕНИЕ | Код не соответствует схеме — нужно исправить |
| 🟡 НЕ РЕАЛИЗОВАНО | Таблица есть, код не написан |
| 🔵 PLANNED | Таблица ещё не создана, запланирована |
| `service_role` | Запрос идёт через service role key (обходит RLS) |
| `anon+jwt` | Запрос через anon key + Bearer токен пользователя (RLS активен) |

---

## Таблицы и все точки входа/выхода

---

### `companies`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| INSERT | `api/auth/telegram.ts` | ~84 | `id, name, industry, size_total, size_office, tariff, hourly_rate` | service_role | ✅ OK |
| UPDATE | `api/company/setup.ts` | — | `name` | service_role | 🔵 PLANNED (онбординг названия) |
| SELECT | `api/manager/dashboard/summary.ts` | ~31 | `*` | service_role | ✅ OK |
| SELECT | `api/manager/dashboard/automation.ts` | ~31 | `hourly_rate` | service_role | ✅ OK |

**Ожидаемые поля:** `id, name, industry, size_total, size_office, tariff, hourly_rate, created_at`

---

### `profiles`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| INSERT | `api/auth/telegram.ts` | ~105 | `id, full_name, role, company_id` | service_role | ✅ OK |
| SELECT | `api/auth/telegram.ts` | ~147 | `id, company_id` | service_role | ✅ OK |
| SELECT | `api/_lib/auth.ts` | ~41 | `id, company_id, role` | service_role | ✅ OK |
| SELECT | `api/ai/evaluate.ts` | ~182 | `company_id` | service_role | ✅ OK |
| SELECT | `api/ai/judge.ts` | ~120 | `company_id` | service_role | ✅ OK |
| SELECT | `api/company/setup.ts` | — | `company_id` | service_role | 🔵 PLANNED |
| SELECT | `src/lib/api.ts` | ~147 | `*` | anon+jwt | ✅ OK |
| SELECT | `src/pages/SandboxPage.tsx` | ~106 | `company_id` | anon+jwt | ✅ OK |

**Ожидаемые поля:** `id, full_name, role, company_id, job_title, department, profile_id, created_at`

**Роли:** `employee` | `manager` | `admin`

> ⚠️ При создании компании (первый вход) → `role = 'manager'` (PLANNED, сейчас `'employee'`)

---

### `questions`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| SELECT | `api/ai/evaluate.ts` | ~96 | `id, category, text, type, max_score, llm_rubric` | service_role | ✅ OK |
| SELECT | `src/lib/api.ts` | ~16 | `*` | anon+jwt | ✅ OK |

**Ожидаемые поля:** `id, category, text, type, options(json), max_score, llm_rubric, created_at`

---

### `stage1_results`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| INSERT | `api/ai/evaluate.ts` | ~190 | `user_id, company_id, total_score, passed` | service_role | ✅ OK |
| SELECT | `src/lib/api.ts` | ~40 | `*` | anon+jwt | ✅ OK |

**Ожидаемые поля:** `id, user_id, company_id, total_score, passed, created_at`

> Порог прохождения: `passed = total_score >= 60`

---

### `stage2_results`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| INSERT | `api/ai/judge.ts` | ~131 | `user_id, company_id, profile_id, task_id, acceleration_x, score_total, score_prompting, score_iterativeness, validated_hours_per_month, passed` | service_role | ✅ OK |
| SELECT | `src/lib/api.ts` | ~73 | `*` | anon+jwt | ✅ OK |

**Ожидаемые поля:** `id, user_id, company_id, profile_id, task_id, acceleration_x, score_total, score_prompting, score_iterativeness, validated_hours_per_month, passed, created_at`

> `profile_id` сейчас всегда `null` — `SimulatorTask` не содержит поля `profileId`
> `score_prompting` и `score_iterativeness` сейчас равны `score_total` — раздельная оценка не реализована

---

### `stage3_results`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| INSERT | `src/lib/api.ts` | ~181 | `user_id, company_id, project_name, linked_routine_task, verdict, confirmed_hours_per_month` | anon+jwt | ✅ OK |
| SELECT | `src/lib/api.ts` | ~102 | `*` | anon+jwt | ✅ OK |
| UPDATE | `src/lib/api.ts` | ~195 | `verdict` | anon+jwt | ✅ OK |

**Ожидаемые поля:** `id, user_id, company_id, project_name, linked_routine_task, verdict, confirmed_hours_per_month, created_at`

> `verdict` значения: `'pending'` | `'approved'` | `'rejected'`
> INSERT через anon+jwt — требует RLS политику на `stage3_results`

---

### `assessment_results`

| Операция | Файл | Строка | Поля | Ключ | Статус |
|----------|------|--------|------|------|--------|
| SELECT | `src/lib/api.ts` | ~132 | `*, profiles(full_name, role)` | anon+jwt | ✅ OK |
| INSERT | — | — | ❌ только через DB триггер | триггер БД | 🟡 НЕ РЕАЛИЗОВАНО в коде |

**Ожидаемые поля:** `id, user_id, company_id, stage1_result_id, stage2_result_id, stage3_result_id, final_level, level_name, is_champion, needs_training, validated_hours_per_month`

> Заполняется триггером `trg_assessment_on_stage3` после INSERT в `stage3_results`
> **Требует**: запустить `scripts/setup-db.sql` в Supabase SQL Editor

---

### `routine_map_items`

| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | — | ❌ не реализовано | 🟡 НЕ РЕАЛИЗОВАНО |
| SELECT | — | ❌ не реализовано | 🟡 НЕ РЕАЛИЗОВАНО |

---

### `invites` (не существует)

| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | — | `id, company_id, token, role, max_uses, used_count, expires_at` | 🔵 PLANNED |
| SELECT | `api/auth/telegram.ts` | `company_id, role, used_count, max_uses` | 🔵 PLANNED |
| UPDATE | `api/auth/telegram.ts` | `used_count` | 🔵 PLANNED |

---

## RPC функции (хранимые процедуры в Supabase)

| Функция | Вызывается из | Параметры | Статус |
|---------|--------------|-----------|--------|
| `avg_grade_by_company` | `api/manager/dashboard/summary.ts:50` | `p_company_id` | ✅ OK |
| `grade_distribution` | `api/manager/dashboard/summary.ts:51` | `p_company_id` | ✅ OK |
| `total_savings` | `api/manager/dashboard/summary.ts:52` | `p_company_id` | ✅ OK |
| `avg_stage2_scores` | `api/manager/dashboard/summary.ts:53` | `p_company_id` | ✅ OK |
| `automation_map` | `api/manager/dashboard/automation.ts:44` | `p_company_id` | ✅ OK |

> Все RPC функции должны быть созданы через `scripts/setup-db.sql`

---

## Цепочки запросов по флоу

### Флоу: Первый вход (новый пользователь)
```
POST /api/auth/telegram
  → companies.INSERT (id, name="...'s Workspace", role=manager)  ← PLANNED: name вводит пользователь
  → profiles.INSERT (id, full_name, role='manager', company_id)  ← PLANNED: было 'employee'
  → auth.signInWithPassword → session
→ PATCH /api/company/setup                                        ← PLANNED: обновляет name
  → profiles.SELECT (company_id)
  → companies.UPDATE (name)
```

### Флоу: Повторный вход (существующий пользователь)
```
POST /api/auth/telegram
  → auth.signInWithPassword (fast path)
  → profiles.SELECT (id, company_id)
  → session возвращается
```

### Флоу: Этап 1 (тест)
```
GET /api → questions.SELECT (id, category, text, type, max_score, llm_rubric)
POST /api/ai/evaluate
  → auth.getUser()
  → questions.SELECT (id, category, text, type, max_score, llm_rubric)
  → OpenRouter LLM call
  → profiles.SELECT (company_id)
  → stage1_results.INSERT (user_id, company_id, total_score, passed)
  → return { score, feedback, category_scores }
```

### Флоу: Этап 2 (симулятор)
```
POST /api/ai/simulate (чат с ИИ-ассистентом)
  → OpenRouter LLM call (Gemini 2.0 Flash)

POST /api/ai/judge
  → auth.getUser()
  → profiles.SELECT (company_id)
  → OpenRouter LLM call (Claude Sonnet)
  → stage2_results.INSERT (user_id, company_id, ..., score_total, passed)
  → return { score, feedback, time_saved_multiplier }
```

### Флоу: Этап 3 (микро-проект)
```
stage3_results.INSERT (user_id, company_id, project_name, ...)
  → триггер trg_assessment_on_stage3
    → assessment_results.INSERT (автоматически)
```

### Флоу: Дашборд менеджера
```
GET /api/manager/dashboard/summary
  → verifyManagerAuth → profiles.SELECT (id, company_id, role)
  → companies.SELECT (*)
  → RPC: avg_grade_by_company, grade_distribution, total_savings, avg_stage2_scores

GET /api/manager/dashboard/automation
  → verifyManagerAuth → profiles.SELECT (id, company_id, role)
  → companies.SELECT (hourly_rate)
  → RPC: automation_map
```

### Флоу: Аналитика (страница Reports)
```
stage1_results.SELECT (user_id = current_user)
stage2_results.SELECT (user_id = current_user)
stage3_results.SELECT (user_id = current_user)
```

---

## Критические расхождения (нужно исправить)

| # | Проблема | Файл | Действие |
|---|----------|------|---------|
| 1 | При создании профиля всегда `role='employee'`, нет автороли менеджера | `api/auth/telegram.ts:108` | Изменить на `'manager'` при создании компании |
| 2 | Нет онбординга названия компании | — | Создать `api/company/setup.ts` + `CompanySetup.tsx` |
| 3 | `assessment_results` не заполняется без триггера | Supabase | Запустить `scripts/setup-db.sql` |
| 4 | `profile_id` в `stage2_results` всегда `null` | `api/ai/judge.ts` | Передавать `roleId` из SandboxPage |
| 5 | `routine_map_items` не используется | `src/pages/Tests.tsx` | Реализовать карту рутины |
