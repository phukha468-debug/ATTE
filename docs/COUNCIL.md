# COUNCIL — ATTE (Аттестация 66AI)

> Дата создания: 14.04.2026
> Тема: Закладка фундамента (Zero-Budget MVP + Micro-Company Support)

---

## ⛔ ПРАВИЛА СОВЕТА

1. Каждый участник пишет ТОЛЬКО в своём подписанном блоке.
2. ЗАПРЕЩЕНО изменять, удалять или редактировать блоки других участников.
3. Несогласие с другим участником — выражается ТОЛЬКО в своём блоке.
4. Решение Арбитра (Claude Code) — ФИНАЛЬНОЕ. Обжалованию не подлежит.
5. Работа над проектом начинается ТОЛЬКО после заполнения всех блоков и отметки «Фундамент заложен».

---

## ВХОДНЫЕ ДАННЫЕ ОТ ЗАКАЗЧИКА

### 1. Что я хочу создать?
Telegram Mini App (TMA) для диагностики ИИ-компетенций сотрудников (Этап 1: Карта рутины). Система должна поддерживать как крупные компании, так и микро-бизнес.

### 2. Кто будет пользоваться?
Сотрудники компаний (проходят тест), HR-директора и владельцы микро-компаний (от 1 до 9 человек).

### 3. Какую главную проблему решает?
Измерение реального уровня ИИ-грамотности и идентификация рутинных задач для автоматизации.

### 4. Какие данные будет хранить система?
Профили пользователей, компании (включая микро-сегмент), базу вопросов и результаты аттестации.

### 5. Нужна ли авторизация? Какие роли?
Да. Бесшовная через Telegram. Роли: Employee, Manager/HR, Admin.

### 6. Где будет работать?
Telegram Mini App (Vite + React SPA).

### 7. Есть ли интеграции?
Telegram Web Apps API, OpenRouter API (LLM-Judge).

### 8. Бюджет на инфраструктуру
0 ₽ (строго бесплатные лимиты Firebase Spark и Vercel Hobby до момента монетизации).

### 9. Особые требования к масштабированию
Необходимо учесть сегмент микро-компаний (1-9 человек). Тарифы для них будут выше и внедрены позже, но база данных и логика приложения должны позволять регистрацию таких групп уже сейчас.

---

## БЛОК АРХИТЕКТОРА

*Подпись: Архитектор (Gemini Pro)*
*Скилл: PROJECT_GENESIS Opus 46*
*Дата: 14.04.2026*

# [Executive Summary]
Система представляет собой B2B TMA на базе React 19, оптимизированную под нулевой бюджет эксплуатации через использование Firebase (DB/Auth) и Vercel (API). Ключевое архитектурное решение — внедрение гибкой сущности `companies`, поддерживающей микро-группы (1-9 чел.) через поле `size_category`. Весь «тяжелый» интеллект (LLM-Judge) вынесен в изолированные Vercel Functions для защиты API-ключей и обхода ограничений бесплатного тарифа Firebase.

# [Domain & Stack Justification]

| Component         | Technology            | Role                                  |
|-------------------|-----------------------|---------------------------------------|
| Runtime           | Node.js 20 (Vercel)   | Окружение для серверных функций       |
| Framework         | React 19 + Vite 6     | Фронтенд (существующий шаблон)        |
| Database          | Firebase Firestore    | NoSQL БД с гибкой схемой (бесплатно)  |
| Auth              | Firebase Auth (TG)    | Авторизация через Custom Tokens       |
| API Layer         | Vercel Serverless     | Безопасный прокси для Gemini и TG     |
| Deployment        | Vercel / Firebase     | Хостинг статики и функций             |

**Домен:** SaaS / B2B Platform (Lite).
**Обоснование:** Выбран NoSQL (Firestore) вместо SQL для обеспечения 100% бесплатного старта и гибкости в добавлении полей для микро-компаний без миграций. Использование Vercel Functions позволяет использовать Gemini API бесплатно, скрывая ключи от клиента. 

# [Database Schema]

TABLE: companies (Collection)
PURPOSE: Организации разных масштабов.
──────────────────────────────────────────────
id                  STRING (UUID)   PK
name                STRING          Название компании
size_category       ENUM            'micro' (1-9), 'small' (10-49), 'enterprise' (50+)
pricing_tier        STRING          'standard', 'premium', 'pending_micro'
created_at          TIMESTAMP       NOT NULL

TABLE: users (Collection)
PURPOSE: Сотрудники и руководители.
──────────────────────────────────────────────
id                  STRING (UUID)   PK (Firebase UID)
tg_id               NUMBER          UNIQUE, INDEX
company_id          STRING          FK (companies.id)
role                ENUM            'employee', 'manager', 'admin'
full_name           STRING          NOT NULL
created_at          TIMESTAMP       NOT NULL

TABLE: test_results (Collection)
PURPOSE: Результаты Карт рутины.
──────────────────────────────────────────────
id                  STRING (UUID)   PK
user_id             STRING          FK (users.id), INDEX
answers             MAP             JSON с ответами
llm_feedback        MAP             Оценка от LLM-Judge
score               NUMBER          Итоговый балл
is_completed        BOOLEAN         Статус завершения

# [Core API/Endpoints]

[AUTH REQUIRED] [ROLE: none]
POST /api/auth/telegram
  Request: { initData: string, companyName?: string }
  Response: { token: string, isNew: boolean }
  Notes: Валидация подписи TG. Если компания не указана, создается временный профиль микро-клиента.

[AUTH REQUIRED] [ROLE: employee]
POST /api/ai/evaluate
  Request: { question_id: string, text: string }
  Response: { score: number, comment: string }
  Notes: Прокси к Gemini. Применяет промпт LLM-Judge.

# [Security & Rate Limiting Considerations]

1. [AUTH] Валидация Telegram WebApp через HMAC на стороне Vercel.
2. [AUTH] Firestore Security Rules: `allow read: if request.auth.uid == resource.data.user_id || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager'`.
3. [SECRETS] Хранение `GEMINI_API_KEY` исключительно в Vercel Environment Variables.
4. [ABUSE] Ограничение на количество попыток аттестации (1 раз в 24 часа для одного `tg_id`).
5. [INPUT] Санитайзер текста перед отправкой в LLM (max 1000 символов).
6. [RATE LIMIT] Глобальный лимит Vercel на выполнение функций (10s), оптимизация промптов для скорости.

# [Key Map]

| Route / Function          | Key Used          | Why This Key                          |
|---------------------------|-------------------|---------------------------------------|
| /api/auth/telegram        | TG_BOT_TOKEN      | Проверка подлинности данных сессии    |
| /api/auth/telegram        | FB_ADMIN_SDK      | Генерация Custom Token для Firebase   |
| /api/ai/evaluate          | GEMINI_API_KEY    | Доступ к ИИ для оценки ответов        |

# [Data Flow Maps]

FLOW: Регистрация микро-компании (1-9 чел)
─────────────────────────────────────────────────
1. UI: Пользователь входит в TMA.
2. UI: Если `start_param` пуст, предлагает ввод названия компании.
3. ASYNC: `fetch('/api/auth/telegram', { initData, companyName })`.
4. API: Создает запись в `companies` с `size_category: 'micro'`.
5. API: Генерирует токен, привязывает пользователя как `role: 'manager'`.
6. UI: Редирект на экран оплаты (заглушка) или сразу в тест.

# [Environment Parity]

| Aspect              | Development          | Production           | Risk & Mitigation                    |
|---------------------|----------------------|----------------------|--------------------------------------|
| Database            | Local Emulator       | Firebase Cloud       | Разные правила доступа. Тестировать. |
| AI                  | Gemini API (Direct)  | API via Vercel       | Лимиты на бесплатном тире.           |

---

## БЛОК АУДИТОРА

*Подпись: Аудитор (Qwen Code)*
*Скилл: STRUCTURE_AUDITOR v4.1*
*Дата: 14.04.2026*

---

### Согласен с Архитектором:

1. **NoSQL (Firestore) для гибкой схемы** — верный выбор для MVP с меняющимися требованиями микро-компаний. Миграции SQL были бы лишним трением.
2. **Вынос LLM-Judge в serverless-функции** — единственно верное решение для защиты API-ключей. Клиентский вызов Gemini = утечка ключа.
3. **HMAC-валидация Telegram initData на сервере** — обязательный минимум безопасности для TMA.
4. **Разделение на `companies` и `users`** — корректная нормализация даже для NoSQL.

---

### Замечания:

1. **[Категория: Логика]**
   Проблема: В схеме `companies` отсутствует связь с тарифом для микро-компаний. Поле `pricing_tier` — строка, но нет таблицы/коллекции `invoices` или `payments` для трекинга оплаты.
   Обоснование: В flow «Регистрация микро-компании» указан «редирект на экран оплаты (заглушка)», но сущность платежа не описана. Без неё невозможно отследить, кто оплатил, а кто нет.
   Решение: Добавить коллекцию `payments` с полями: `id`, `company_id (FK)`, `amount`, `status` ('pending', 'paid', 'cancelled'), `created_at`.

2. **[Категория: Логика]**
   Проблема: В `test_results` нет поля `created_at` и `company_id`. Невозможно построить отчёт «результаты по компании» без склейки через `users`.
   Обоснование: HR-дашборд потребует агрегации всех результатов компании. Прямой связи нет — лишний запрос + денормализация при масштабировании.
   Решение: Добавить `company_id` в `test_results` (денормализация для чтения) и `created_at` для сортировки.

3. **[Категория: Безопасность]**
   Проблема: В Security Rules не описана защита коллекции `companies`. Любой авторизованный пользователь может прочитать все компании.
   Обоснование: Rule `allow read: if request.auth.uid == resource.data.user_id` работает для `users`, но для `companies` правил нет. Это значит, что Firestore по умолчанию запретит всё (если нет правила — deny), или откроет всё (если правило слишком широкое).
   Решение: Явно прописать rules для `companies`: `allow read: if request.auth != null && resource.data.id == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company_id`.

4. **[Категория: Стек]**
   Проблема: Архитектор проектирует под Firebase, но в текущем коде проекта уже подключён **Supabase** (`src/lib/supabase.ts`, `.env.example` с `VITE_SUPABASE_*`). Это конфликт видений.
   Обоснование: Переключение с Supabase на Firebase — это полный рефакторинг auth + database слоёв. Для MVP с нулевым бюджетом оба сервиса бесплатны, но Supabase (PostgreSQL) потребует миграций, а Firestore — нет.
   Решение: Арбитру выбрать ОДНУ платформу. Если Firebase — удалить Supabase из кода и зависимостей. Если Supabase — переписать схему на реляционную.

5. **[Категория: Безопасность]**
   Проблема: Отсутствуют API-роуты и serverless-функции. Вся логика (Gemini, Supabase) вызывается напрямую из клиента (`src/lib/gemini.ts`).
   Обоснование: `GEMINI_API_KEY` в клиентском бандле = публичный ключ. Любой может вытащить его из DevTools и начать жечь квоту.
   Решение: Создать `/api/ai/evaluate` как Vercel Serverless Function. Перенести вызов Gemini туда. Клиент → fetch('/api/ai/evaluate') → Vercel → Gemini.

6. **[Категория: Реализуемость]**
   Проблема: 6 из 7 UI-компонентов в `src/components/ui/` — пустые файлы (0 байт). `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `progress.tsx`, `tabs.tsx` не имеют экспортов.
   Обоснование: Проект не соберётся. Все 5 страниц импортируют эти компоненты. Это блокирующий дефект.
   Решение: Сгенерировать компоненты через `npx shadcn@latest add <component>` или написать вручную перед продолжением разработки.

7. **[Категория: Избыточность]**
   Проблема: `express` в зависимостях, но серверного кода нет. `dotenv` в production-зависимостях — Vite не использует его на клиенте.
   Обоснование: Раздутый `node_modules`, лишнее время установки.
   Решение: `express` → в devDependencies или удалить. `dotenv` → в devDependencies.

8. **[Категория: Полнота]**
   Проблема: Нет `WebApp.ready()` инициализации. Telegram не узнает, что Mini App готов к отображению.
   Обоснование: Без `window.Telegram.WebApp.ready()` приложение может зависнуть на загрузке в Telegram.
   Решение: Добавить `window.Telegram.WebApp.ready()` в `main.tsx` после `createRoot`.

---

### Оценка уверенности (Quality Gates):

| Критерий | Оценка (0–100) | Статус |
|----------|---------------|--------|
| A. Логика (сущности, связи, edge-cases) | 55 | 🚫 FAIL (<70) — нет payments, нет company_id в test_results |
| B. Стек (оптимальность для задачи) | 45 | 🚫 FAIL — конфликт Firebase/Supabase, пустые UI-компоненты |
| C. Безопасность (auth, rate limits, валидация) | 35 | 🚫 FAIL — GEMINI_API_KEY на клиенте, нет serverless-функций |
| D. Избыточность (нет лишнего) | 70 | ✅ PASS — dead dependencies |
| E. Реализуемость (можно собрать конвейером) | 40 | 🚫 FAIL — пустые компоненты блокируют сборку |
| F. Полнота Blueprint (Key Map, Data Flow, Env Parity) | 85 | ✅ PASS — Key Map и Data Flow есть |
| **СРЕДНИЙ БАЛЛ** | **55** | |

**Вердикт: < 60: ОТКЛОНЕНО**

---

### Моя финальная версия:

```
TABLE: companies (Collection)
──────────────────────────────────────────────
id                  STRING (UUID)   PK
name                STRING          NOT NULL
size_category       ENUM            'micro' (1-9), 'small' (10-49), 'enterprise' (50+)
pricing_tier        STRING          'standard', 'premium', 'pending_micro'
created_at          TIMESTAMP       NOT NULL

TABLE: users (Collection)
──────────────────────────────────────────────
id                  STRING (UUID)   PK (Firebase UID)
tg_id               NUMBER          UNIQUE, INDEX
company_id          STRING          FK (companies.id), INDEX
role                ENUM            'employee', 'manager', 'admin'
full_name           STRING          NOT NULL
created_at          TIMESTAMP       NOT NULL

TABLE: test_results (Collection)
──────────────────────────────────────────────
id                  STRING (UUID)   PK
user_id             STRING          FK (users.id), INDEX
company_id          STRING          FK (companies.id), INDEX ← ДОБАВЛЕНО
answers             MAP             JSON
llm_feedback        MAP             Оценка LLM
score               NUMBER          Итоговый балл
is_completed        BOOLEAN         Статус
created_at          TIMESTAMP       NOT NULL ← ДОБАВЛЕНО

TABLE: payments (Collection) ← ДОБАВЛЕНО
──────────────────────────────────────────────
id                  STRING (UUID)   PK
company_id          STRING          FK (companies.id), INDEX
amount              NUMBER          Сумма в рублях
status              ENUM            'pending', 'paid', 'cancelled'
created_at          TIMESTAMP       NOT NULL

API Endpoints (Vercel Serverless):
──────────────────────────────────────────────
POST /api/auth/telegram      — TG валидация + Custom Token
POST /api/ai/evaluate        — Прокси к Gemini (ключ на сервере)
GET  /api/companies/:id      — Данные компании + статистика
POST /api/payments/create    — Создание записи оплаты
POST /api/payments/webhook   — Обработка платежа

Platform Decision: FIREBASE ← нужно утвердить Арбитром.
Если выбран Supabase — переписать все на PostgreSQL + RLS.

Pre-flight tasks (блокирующие):
1. Заполнить 6 пустых UI-компонентов (button, card, badge, etc.)
2. Добавить window.Telegram.WebApp.ready() в main.tsx
3. Удалить express из dependencies
4. Перенести dotenv в devDependencies
```

---

## БЛОК АРБИТРА

*Подпись: Арбитр (Claude Code)*
*Скилл: COUNCIL_ARBITER v4.1*
*Статус: ФИНАЛЬНОЕ РЕШЕНИЕ (rev.3 — Supabase, новая org)*
*Дата: 14.04.2026*

---

### Уроки из прошлых проектов:

`docs/LESSONS.md` — не существует. Прецедентов нет. Решения принимаются на основе требований Заказчика, кода и аргументов участников.

---

### Разрешение конфликта платформ:

Предыдущая итерация арбитража временно переключила проект на Firebase из-за недоступности Supabase. Причина оказалась банальной: **free tier исчерпан на существующем аккаунте**. Решение: новая GitHub-организация для проекта + новый Supabase-проект внутри неё. Это стандартная практика для нового продукта — каждая org получает fresh free tier.

Итог: Supabase возвращён. Firebase отменён. `src/lib/supabase.ts` восстановлен, `src/lib/firebase.ts` удалён.

**Инфраструктурные шаги перед стартом:**
1. Создать GitHub Organization: `atte-66ai` (или аналог)
2. Создать Supabase Organization → новый проект → получить `URL` и `anon key`
3. Заполнить `.env` из `.env.example`

---

### Расхождения и решения:

| # | Вопрос | Архитектор | Аудитор | Решение | Обоснование |
|---|--------|-----------|---------|---------|-------------|
| 1 | **Платформа БД** | Firebase Firestore | Конфликт с Supabase в коде — Арбитр выбирает | **SUPABASE** | Free tier исчерпан на старом аккаунте → новая GitHub org + новый Supabase проект. PostgreSQL выигрывает у Firestore для HR-отчётов: нативный GROUP BY, JOIN, RLS без дорогих `get()`-проверок. |
| 2 | **Gemini API на клиенте** | В плане — Vercel Functions | Фактически в `gemini.ts` на клиенте. Блокирующая дыра | **Аудитор прав — выполнено** | `vite.config.ts` инжектировал ключ в бандл через `process.env.GEMINI_API_KEY`. Строка удалена. Ключ переносится в Vercel Env. Клиент вызывает только `/api/ai/evaluate`. |
| 3 | **payments-коллекция** | Отсутствует | Добавить с полем `status` | **Аудитор прав** | Без неё невозможно отследить оплату микро-компании. `pricing_tier: 'pending_micro'` — состояние, не история транзакции. |
| 4 | **`company_id` и `created_at` в `test_results`** | Отсутствуют | Добавить оба поля | **Аудитор прав** | В Firestore без `company_id` в документе «все результаты компании» = два последовательных запроса. С полем — один `where('company_id', '==', id)`. |
| 5 | **RLS для `companies`** | Не описаны | Явно прописать | **Аудитор прав** | В Supabase RLS без политики = deny by default. Нужна явная политика: `USING (id = (SELECT company_id FROM users WHERE id = auth.uid()))`. В отличие от Firestore — это SQL, без дополнительных read-операций. |
| 6 | **Пустые UI-компоненты** | Не замечено | Блокирующий дефект — 6 файлов по 0 байт | **Аудитор прав — Pre-flight #1** | Проверено: `button.tsx`, `card.tsx`, `badge.tsx` — 0 байт. Сборка не пройдёт. |
| 7 | **`WebApp.ready()`** | Не упомянуто | Добавить в `main.tsx` | **Выполнено** | `main.tsx` обновлён: `if (tg) tg.ready()` перед `createRoot`. |
| 8 | **`express` и `dotenv` в dependencies** | Не замечено | Перенести в devDependencies | **Выполнено** | `package.json` обновлён: оба перемещены в `devDependencies`. |

---

### Пропуски обоих участников:

1. **Supabase Auth с Telegram Custom Token.** Точный flow не описан ни у кого. Решение: Vercel Function `/api/auth/telegram` валидирует HMAC `initData` → вызывает `supabase.auth.admin.createUser()` или `admin.generateLink()` → возвращает JWT клиенту. `SUPABASE_SERVICE_ROLE_KEY` — только в Vercel Env, никогда в `VITE_*`.

2. **RLS-политики — полный набор для всех таблиц.** Аудитор описал правило только для `companies`. Нужны политики на `test_results` (employee видит свои; manager — все компании), `payments` (только manager/admin), `questions` (read-only для всех auth). Без полного набора RLS = пробел в изоляции.

3. **Таблица `questions` отсутствует у обоих.** `test_results.answers` хранит JSONB ответов, но источник вопросов не описан. Нужна таблица: `id`, `category`, `text`, `type` ('mcq'|'open'), `options` (JSONB).

4. **OpenRouter vs прямой Gemini.** Заказчик назвал OpenRouter — оба участника проигнорировали. OpenRouter даёт абстракцию: если квота одной модели исчерпана, переключение = одна строка. ADR нужен до реализации `/api/ai/evaluate`.

5. **HR-отчёты — преимущество Supabase.** В отличие от Firebase, Supabase (PostgreSQL) позволяет: `SELECT job_title, AVG(score) FROM test_results JOIN users USING(user_id) WHERE company_id = X GROUP BY job_title` — один запрос, без серверной агрегации, без `reports_cache`. Это ключевое архитектурное преимущество над Firebase для данного проекта.

---

### Обязательные ADR перед реализацией:

| # | Подсистема | Почему нужен ADR |
|---|-----------|-----------------|
| 1 | **Auth (Telegram HMAC → Supabase JWT)** | Нестандартный flow. Ошибка = пробой аутентификации всей системы |
| 2 | **RLS-политики multi-tenant (Supabase)** | 5 таблиц, 3 роли, пересекающиеся права — без полной схемы политик легко открыть лишнее |
| 3 | **LLM-Judge (OpenRouter vs Gemini Direct)** | Заказчик назвал OpenRouter; Архитектор выбрал Gemini. Конфликт нужно закрыть записью |
| 4 | **Payments flow** | Stripe / ЮKassa / заглушка — от выбора зависит webhook-логика и схема коллекции |

---

### Вердикт:

**ПРИНЯТО С ПРАВКАМИ**

Архитектор выбрал Firebase, Аудитор выявил конфликт стеков. Причина конфликта оказалась операционной (исчерпан free tier), а не технической — Supabase возвращён. Финальная структура = схема Аудитора + Supabase (новая org) + исправления безопасности в коде выполнены.

---

### Финальная структура проекта:

#### Стек:

| Компонент | Технология | Обоснование |
|-----------|-----------|-------------|
| Frontend | React 19 + Vite 6 | Существующий шаблон |
| Database | **Supabase (PostgreSQL)** | Новая org = fresh free tier. SQL для HR-отчётов, RLS без накладных reads |
| Auth | **Supabase Auth + Service Role** | Telegram HMAC → Service Role → JWT |
| API Layer | Vercel Serverless Functions | Защита `SERVICE_ROLE_KEY` и OpenRouter ключа |
| Deployment | Vercel (статика + functions) | Единая платформа, бесплатный тир |
| LLM | **OpenRouter API** | Требование Заказчика. Абстракция над моделями |

#### База данных (финальная схема PostgreSQL / Supabase):

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

#### API / Эндпоинты (Vercel Serverless):

```
POST /api/auth/telegram       — HMAC-валидация initData → Supabase JWT
POST /api/ai/evaluate         — Прокси к OpenRouter (ключ на сервере)
GET  /api/companies/:id       — Данные компании + агрегированная статистика
POST /api/payments/create     — Создание записи оплаты
POST /api/payments/webhook    — Обработка платёжного события
```

#### Key Map:

| Route | Key | Где хранится |
|-------|-----|-------------|
| /api/auth/telegram | `TG_BOT_TOKEN` | Vercel Env |
| /api/auth/telegram | `SUPABASE_SERVICE_ROLE_KEY` | Vercel Env (никогда в `VITE_*`) |
| /api/ai/evaluate | `OPENROUTER_API_KEY` | Vercel Env |
| Client | `VITE_SUPABASE_URL` | .env (публичный — защита через RLS, не через секретность) |
| Client | `VITE_SUPABASE_ANON_KEY` | .env (публичный — anon key ограничен RLS-политиками) |

#### Безопасность:

1. Telegram HMAC-валидация `initData` на сервере — перед созданием/обновлением любого пользователя.
2. `SUPABASE_SERVICE_ROLE_KEY` — только в Vercel Functions, никогда в `VITE_*`.
3. RLS включён на всех 5 таблицах. Без политики = deny by default.
4. `test_results`: employee читает только свои; manager — все в своей `company_id`.
5. `companies`: читает только пользователь, чей `company_id` совпадает.
6. `payments`: только manager/admin своей компании.
7. OpenRouter ключ — только в Vercel Function. Клиент вызывает `/api/ai/evaluate`, не OpenRouter напрямую.
8. Rate limit: 1 аттестация / 24 часа / `tg_id` — SQL-проверка в Vercel Function.
9. Input sanitization: max 1000 символов перед отправкой в LLM.

#### Pre-flight tasks (блокируют старт, часть выполнена):

- [x] Убрать инъекцию `GEMINI_API_KEY` из `vite.config.ts`
- [x] Добавить `WebApp.ready()` в `main.tsx`
- [x] Перенести `express` и `dotenv` в `devDependencies`
- [x] Обновить `.env.example` на Supabase переменные (с разделением client/server)
- [ ] Создать GitHub Organization для проекта
- [ ] Создать новый Supabase проект в новой org → получить URL + anon key
- [ ] `npx shadcn@latest add button card badge avatar progress tabs` — 6 пустых UI-компонентов
- [ ] Создать `api/ai/evaluate.ts` (Vercel Function, OpenRouter прокси)
- [ ] Создать `api/auth/telegram.ts` (Vercel Function, HMAC + Supabase Service Role)
- [ ] ADR #1: Auth flow до первой строки auth-кода
- [ ] ADR #2: RLS-политики до первого деплоя

#### Оценка сложности:

- Примерное количество тасков: **30–36**
- Критический путь: Pre-flight → ADR #1 → ADR #2 → `/api/auth/telegram` → RLS-политики → клиентский auth hook → остальные features
- Подсистемы, требующие ADR: Auth, RLS multi-tenant, LLM provider, Payments

---

### Рекомендованный порядок реализации:

```
0. Инфраструктура (до первой строки кода)
   ORG  → Создать GitHub Organization
   DB   → Создать Supabase проект → заполнить .env
   DB   → Накатить SQL-схему (5 таблиц) + включить RLS (ADR #2 сначала)

1. Pre-flight (разблокировать сборку) — ЧАСТИЧНО ВЫПОЛНЕНО
   CODE → shadcn add button card badge avatar progress tabs
   VRF  → npm run build проходит без ошибок

2. Auth (ADR #1 сначала)
   API  → api/auth/telegram.ts (HMAC → Supabase Service Role → JWT)
   DB   → RLS v1: users читают только себя
   VRF  → Войти через Telegram, получить Supabase JWT
   UI   → Splash / загрузка при входе

3. Компании и микро-группы
   DB   → RLS v2: companies изолированы по company_id
   API  → api/companies/:id (GET + статистика одним SQL-запросом)
   VRF  → Менеджер видит свою компанию, не чужую
   UI   → Экран профиля компании

4. Вопросы и аттестация
   DB   → Seed-данные в таблицу questions
   API  → api/ai/evaluate.ts (OpenRouter прокси, ADR #3 сначала)
   DB   → RLS v3: test_results изолированы по company_id
   VRF  → Тест: ответ → оценка LLM → запись в test_results
   UI   → Экран теста

5. HR-дашборд (отчёты)
   DB   → SQL-вью или функция для агрегатов по company_id
   VRF  → Менеджер видит средний балл / completion rate
   UI   → Дашборд с графиками (recharts уже в deps)

6. Платежи (заглушка → реальный провайдер, ADR #4)
   DB   → RLS v4: payments только для manager/admin компании
   API  → api/payments/create + api/payments/webhook
   VRF  → Создание записи, смена статуса
   UI   → Экран тарифов / оплаты
```

---

## ★ ФУНДАМЕНТ ЗАЛОЖЕН ★