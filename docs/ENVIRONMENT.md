# ENVIRONMENT — ATTE (66AI Attestation)

> Переменные окружения. Чёткое разделение клиентских и серверных.

---

## Клиентские (VITE_*) — публичные

Эти переменные **попадают в бандл** и видны любому, кто откроёт DevTools. Они не секреты — их защита обеспечивается RLS (Row Level Security) в Supabase, а не секретностью.

| Переменная | Где используется | Описание |
|------------|-----------------|----------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | URL Supabase проекта |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | Anon ключ (ограничен RLS) |

**Файл:** `.env.local` (фронтенд)

---

## Серверные — ТОЛЬКО Vercel Serverless Functions

Эти переменные **НЕ должны** иметь префикс `VITE_`. Они живут **только** в Vercel Environment Variables и используются в файлах папки `api/`.

| Переменная | Где используется | Описание |
|------------|-----------------|----------|
| `TG_BOT_TOKEN` | `api/auth/telegram.ts` | Токен Telegram бота для HMAC-валидации |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/auth/telegram.ts` | Service Role ключ Supabase (обход RLS) |
| `OPENROUTER_API_KEY` | `api/ai/evaluate.ts` | Ключ OpenRouter для LLM-Judge |
| `GEMINI_API_KEY` | `api/ai/evaluate.ts` (резерв) | Ключ Gemini API (если не OpenRouter) |

**Файл:** Vercel Project Settings → Environment Variables (production) / `.env.local` (локально для `vercel dev`)

---

## Запрещённые паттерны

```
❌ VITE_TG_BOT_TOKEN           — бот-токен НЕ должен быть публичным
❌ VITE_SUPABASE_SERVICE_ROLE_KEY  — Service Role НЕ должен быть публичным
❌ VITE_OPENROUTER_API_KEY     — API ключ НЕ должен быть публичным
❌ process.env.GEMINI_API_KEY в vite.config.ts — не инжектировать в бандл
```

---

## Как настроить локально

1. Скопируй `.env.example` → `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Заполни клиентские переменние:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Заполни серверные переменные (для `vercel dev`):
   ```
   TG_BOT_TOKEN=your-bot-token
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENROUTER_API_KEY=your-openrouter-key
   ```

4. Запусти:
   ```bash
   npx vercel dev    # запускает API на :3001
   npm run dev       # запускает фронтенд на :3000, проксирует /api → :3001
   ```

---

## Production (Vercel)

В настройках Vercel Project → Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| `VITE_SUPABASE_URL` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `TG_BOT_TOKEN` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview |
| `OPENROUTER_API_KEY` | Production, Preview |

> ⚠️ Никогда не добавляй серверные ключи в `VITE_*` префикс в Vercel!
