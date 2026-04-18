# DB Schema Map — Карта всех точек входа/выхода в БД

> **Цель:** Единый документ для проверки соответствия кода и схемы БД.
> При изменении схемы — сначала обновить этот файл, потом менять код.
> **Обновлён:** 2026-04-17

---

## Таблицы БД и кто их использует

### `companies`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | `api/auth/telegram.ts:84` | `id, name, industry, size_total, size_office, tariff, hourly_rate` | ✅ OK |
| SELECT | `api/manager/dashboard/summary.ts:31` | `*` | ✅ OK |
| SELECT | `api/manager/dashboard/automation.ts:31` | `hourly_rate` | ✅ OK |

### `profiles`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | `api/auth/telegram.ts:105` | `id, full_name, role, company_id` | ✅ OK |
| SELECT | `api/auth/telegram.ts:147` | `id, company_id` | ✅ OK |
| SELECT | `api/_lib/auth.ts:41` | `id, company_id, role` | ✅ OK |
| SELECT | `api/ai/evaluate.ts:182` | `company_id` | ✅ OK |
| SELECT | `api/ai/judge.ts:120` | `company_id` | ✅ OK |
| SELECT | `src/lib/api.ts:147` | `*` | ✅ OK |
| SELECT | `src/pages/SandboxPage.tsx:106` | `company_id` | ✅ OK |

### `questions`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| SELECT | `api/ai/evaluate.ts:96` | `id, category, text, type, max_score, llm_rubric` | ✅ OK |
| SELECT | `src/lib/api.ts:16` | `*` | ✅ OK |

### `stage1_results`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | `api/ai/evaluate.ts:190` | `user_id, company_id, total_score, passed` | ✅ OK |
| SELECT | `src/lib/api.ts:40` | `*` | ✅ OK |

**Ожидаемые поля при INSERT:** `id, user_id, company_id, total_score, passed, created_at`

### `stage2_results`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | `api/ai/judge.ts:131` | `user_id, company_id, profile_id, task_id, acceleration_x, score_total, score_prompting, score_iterativeness, validated_hours_per_month, passed` | ✅ OK |
| SELECT | `src/lib/api.ts:73` | `*` | ✅ OK |

**Ожидаемые поля при INSERT:** `id, user_id, company_id, profile_id, task_id, acceleration_x, score_total, score_prompting, score_iterativeness, validated_hours_per_month, passed`

### `stage3_results`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | `src/lib/api.ts:181` | `user_id, company_id, project_name, linked_routine_task, verdict, confirmed_hours_per_month` | ✅ OK |
| SELECT | `src/lib/api.ts:102` | `*` | ✅ OK |
| UPDATE | `src/lib/api.ts:195` | `verdict` | ✅ OK |

### `assessment_results`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| SELECT | `src/lib/api.ts:132` | `*, profiles(full_name, role)` | ✅ OK |
| INSERT | — | ❌ нигде не пишется из кода | 🔴 НЕТ ЗАПИСИ |

**Эта таблица должна заполняться автоматически (триггер или функция) после завершения всех 3 этапов.**

### `routine_map_items`
| Операция | Файл | Поля | Статус |
|----------|------|------|--------|
| INSERT | — | ❌ нигде не пишется из кода | 🟡 НЕ РЕАЛИЗОВАНО |
| SELECT | — | ❌ нигде не читается | 🟡 НЕ РЕАЛИЗОВАНО |

---

## Критические расхождения (нужно исправить)

| # | Проблема | Файл | Действие |
|---|----------|------|---------|
| 1 | `assessment_results` никогда не заполняется из кода | БД / backend | Создать триггер или функцию |
| 2 | `routine_map_items` не используется в коде | `src/pages/Tests.tsx` | Реализовать сохранение карты рутины |

---

## Таблицы, которых ещё нет (нужны в будущем)

| Таблица | Зачем |
|---------|-------|
| `invites` | Система приглашений сотрудников в компанию |
| `payments` / `subscriptions` | Управление тарифами и сроками доступа |
| `notifications` | Уведомления о завершении этапов, одобрении проектов |
