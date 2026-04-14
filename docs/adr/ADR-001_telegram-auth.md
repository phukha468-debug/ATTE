# ADR-001: Telegram HMAC → Supabase Auth
**Дата:** 14.04.2026
**Статус:** accepted

## Контекст
Приложение работает внутри Telegram Mini App. Нам нужно безопасно авторизовать пользователя в Supabase (PostgreSQL) так, чтобы к нему применялись правила RLS (Row Level Security), но без того, чтобы заставлять пользователя вводить email и пароль.

## Решение (Shadow Auth)
Мы не используем стандартный OAuth или ручную подпись JWT. Мы используем подход «теневых аккаунтов»:
1. Клиент (TMA) отправляет сырую строку `initData` на наш сервер (Vercel Function `/api/auth/telegram`).
2. Сервер валидирует подпись с помощью `TG_BOT_TOKEN` (HMAC-SHA-256).
3. Если данные подлинные, сервер использует `SUPABASE_SERVICE_ROLE_KEY` для поиска пользователя по `tg_id` в таблице `users`.
4. Если пользователя нет, сервер через Supabase Admin API (`admin.createUser`) создает теневого пользователя с email `tg_{id}@atte.local` и надежным случайным паролем, а затем делает запись в таблицу `users` и `companies` (микро-компания по умолчанию).
5. Сервер авторизуется под этим пользователем (`signInWithPassword`) и возвращает клиенту `access_token` и `refresh_token`.
6. Клиент получает токены и вызывает `supabase.auth.setSession()`.

## Data Flow
1. UI: `window.Telegram.WebApp.initData`
2. UI (ASYNC): `await fetch('/api/auth/telegram', { method: 'POST', body: initData })`
3. API: Валидация HMAC.
4. API (ASYNC): Управление пользователем (Admin API) + генерация сессии.
5. API: Возвращает `{ session }`
6. UI (AWAIT CONFIRMATION): `await supabase.auth.setSession(session)`
7. UI: Рендер защищенных роутов.

## Key Map
- `VITE_SUPABASE_ANON_KEY` — Используется на клиенте для `setSession` и последующих запросов.
- `TG_BOT_TOKEN` — Используется **ТОЛЬКО** в `/api/auth/telegram` для проверки криптографии.
- `SUPABASE_SERVICE_ROLE_KEY` — Используется **ТОЛЬКО** в `/api/auth/telegram` для обхода RLS при создании пользователя и выдаче сессии.

## Антипаттерны
- ❌ Доверие `initDataUnsafe` на клиенте без серверной проверки.
- ❌ Отправка `SERVICE_ROLE_KEY` на клиент.
- ❌ Использование `anon` ключа в серверной функции для создания пользователей.