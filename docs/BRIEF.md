# BRIEF — ATTE (66AI Attestation)

> Telegram Mini App для B2B-аттестации ИИ-компетенций сотрудников
> Дата: 14.04.2026 | Версия: 1.1 (после Council rev.3)

---
## Roadmap (Обновленный план разработки)

### Фаза 1: Стабилизация и Аттестация (ТЕКУЩАЯ)
- [x] Интеграция Telegram Auth + Supabase.
- [x] Движок ИИ-аттестации (15 вопросов + OpenRouter).
- [x] Хранение результатов в БД.
- [x] **UI Polish (Next):** Балансировка размеров, исправление маппинга баллов по темам, параллакс-эффекты для "королевских" результатов (>80%).

### Фаза 2: Симулятор "Навыки в деле" (В РАЗРАБОТКЕ)
- [x] **Профилирование:** Внедрение двухуровневой системы выбора (Направление → Роль) для персонализации заданий.
- [ ] **UI Песочницы (Sandbox):** Создание рабочего чат-интерфейса для отработки задач с ИИ-помощником.
- [ ] **Гибридный LLM-Судья:** Реализация оценки на базе единого ядра (Core Skill) и профильных модулей (Profile Modules).
- [ ] **5-факторная оценка:** Настройка Судьи на оценку: Промптинга (30%), Итеративности (20%), Ускорения (20%), Качества результата (20%) и Ограничений (10%).
- [ ] **Динамическая сложность:** Ротация заданий (Базовый, Средний, Продвинутый) в зависимости от баллов, полученных на Этапе 1.
- [ ] **Развернутый Фидбек:** Генерация детального разбора вместо сухой оценки (что сделал не так + пример эталонного промпта).
- [ ] **Микро-проекты (Этап 3):** Пошаговые задания по автоматизации конкретных рабочих процессов (AI Value Rubric).
- [ ] **Онбординг:** Видео-инструкция + Чек-лист для быстрого старта.

### Фаза 3: Экосистема и Монетизация
- [ ] **Профиль 2.0:** Уведомления, смена фото, настройки безопасности, Log Out.
- [ ] **Платежный шлюз:** Подключение СБП для оплаты корпоративных тарифов.
- [ ] **Manager Dashboard:** Расширенные отчеты для руководителей.

## Суть

66AI Attestation — это Telegram Mini App (TMA), позволяющий компаниям диагностировать уровень ИИ-грамотности сотрудников. Система определяет, какие рутинные задачи можно автоматизировать с помощью ИИ, и формирует HR-отчёты по результатам.

Поддерживаются компании любого масштаба: от микро-бизнеса (1–9 человек) до крупных предприятий.

---

## Стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Frontend | React + TypeScript | 19 |
| Bundler | Vite | 6 |
| UI | Tailwind CSS v4 + shadcn/ui (base-nova) | — |
| Routing | React Router DOM | 7 |
| Charts | Recharts | 3 |
| Database | **Supabase (PostgreSQL)** | — |
| Auth | Supabase Auth (Shadow Auth via Service Role) | — |
| API Layer | Vercel Serverless Functions | — |
| LLM | OpenRouter API (абстракция над моделями) | — |
| Deployment | Vercel (статика + functions) | — |

---

## Целевая аудитория

| Роль | Описание |
|------|----------|
| Employee | Проходит тест, видит свой прогресс |
| Manager/HR | Видит аналитику по всей компании |
| Admin | Полный доступ + настройки |

---

## Поддержка микро-компаний (1–9 человек)

Компании с `size_category = 'micro'` создаются автоматически при первом входе сотрудника. По умолчанию `pricing_tier = 'pending_micro'` до оплаты. Тарифная сетка для микро-сегмента будет выше и внедрена позже, но база данных и логика приложения уже позволяют регистрацию таких групп.

---

## Структура БД (PostgreSQL / Supabase)

```sql
-- companies
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
name           TEXT NOT NULL
size_category  TEXT CHECK (size_category IN ('micro','small','enterprise'))
pricing_tier   TEXT DEFAULT 'pending_micro'
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()

-- users
id             UUID PRIMARY KEY  -- = supabase auth.uid()
tg_id          BIGINT UNIQUE NOT NULL
company_id     UUID REFERENCES companies(id) NOT NULL
role           TEXT CHECK (role IN ('employee','manager','admin'))
full_name      TEXT NOT NULL
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()

-- questions
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
category       TEXT NOT NULL
text           TEXT NOT NULL
type           TEXT CHECK (type IN ('mcq','open'))
options        JSONB
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()

-- test_results
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id        UUID REFERENCES users(id) NOT NULL
company_id     UUID REFERENCES companies(id) NOT NULL  -- денормализация для отчётов
answers        JSONB
llm_feedback   JSONB
score          NUMERIC
is_completed   BOOLEAN DEFAULT false
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()

-- payments
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
company_id     UUID REFERENCES companies(id) NOT NULL
amount         NUMERIC NOT NULL
status         TEXT CHECK (status IN ('pending','paid','cancelled'))
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
```

---

## API Эндпоинты (Vercel Serverless)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/telegram` | HMAC-валидация initData → Supabase JWT |
| POST | `/api/ai/evaluate` | Прокси к OpenRouter (ключ на сервере) |
| GET | `/api/companies/:id` | Данные компании + агрегированная статистика |
| POST | `/api/payments/create` | Создание записи оплаты |
| POST | `/api/payments/webhook` | Обработка платёжного события |

---

## Безопасность

1. Telegram HMAC-валидация `initData` на сервере (HMAC-SHA-256).
2. `SUPABASE_SERVICE_ROLE_KEY` — только в Vercel Functions.
3. RLS на всех 5 таблицах. Без политики = deny by default.
4. `test_results`: employee — только свои; manager — все в своей компании.
5. `payments`: только manager/admin своей компании.
6. OpenRouter ключ — только в Vercel Function.
7. Rate limit: 1 аттестация / 24 часа / `tg_id`.
8. Input sanitization: max 1000 символов перед отправкой в LLM.

---

## Ссылки

- [COUNCIL.md](./COUNCIL.md) — финальное архитектурное решение
- [BOOT.md](./BOOT.md) — статус проекта и онбординг
- [RULES.md](./RULES.md) — правила разработки
- [ENVIRONMENT.md](./ENVIRONMENT.md) — переменные окружения
- [ADR-001](./adr/ADR-001_telegram-auth.md) — auth flow
- [TEMPLATE_AUDIT.md](./TEMPLATE_AUDIT.md) — аудит шаблона
