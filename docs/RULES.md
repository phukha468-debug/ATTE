# RULES — ATTE (66AI Attestation)

> Правила разработки. Нарушение без согласования = откат коммита.

---

## ТАБУ (запрещено всегда)

### 1. Никаких секретных ключей на клиенте

`TG_BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY` — **только в Vercel Serverless Functions**.

Никогда не префиксуй их `VITE_`. Никогда не инжектируй в `vite.config.ts` через `define` или `process.env`.

### 2. RLS включен всегда

Каждая таблица в Supabase должна иметь RLS-политики **до первого деплоя**. Без политики = deny by default, но это не защита — это нерабочий функционал. Пиши политики **перед** написанием запросов к таблице.

### 3. Навигация только после подтверждения записи (await)

Любой переход между страницами, зависящий от результата записи в БД, должен `await`-ить подтверждение. Никаких `router.push('/results')` без `await insert()`.

### 4. Никакого Firebase

Проект на Supabase (PostgreSQL). Никаких упоминаний Firebase, Firestore, Firebase Auth в коде или документации. Если встречается — удалить и заменить на Supabase-эквивалент.

### 5. Никаких новых UI-библиотек

Только Tailwind CSS + shadcn/ui + lucide-react + motion. Без MUI, Ant Design, Material UI и т.д.

---

## Правила именования

### Ассеты и файлы: `lowercase-kebab-case`

```
✅ src/components/user-profile.tsx
✅ src/assets/logo-mark.svg
✅ docs/adr/ADR-001_telegram-auth.md

❌ src/components/UserProfile.tsx   (camelCase в имени файла)
❌ src/assets/logoMark.svg          (camelCase)
❌ docs/adr/adr001.md               (без номера)
```

### Компоненты React: `PascalCase`

```tsx
// Внутри файла: lowercase-kebab-case
export function UserProfile() { ... }
```

### Переменные и функции: `camelCase`

```ts
const getUserProfile = () => { ... }
const isLoggedIn = true
```

### Константы (глобальные, конфигурация): `UPPER_SNAKE_CASE`

```ts
const MAX_RETRIES = 3
const API_BASE_URL = '/api'
```

### Таблицы БД: `snake_case` (множественное число)

```sql
users, companies, test_results, questions, payments
```

### Колонки БД: `snake_case`

```sql
tg_id, company_id, created_at, is_completed
```

---

## Git-правила

1. Коммит только с passing build (`npm run build` + `npm run lint`).
2. Префиксы коммитов: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
3. Один коммит = одна логическая задача.

---

## Code Review

1. Перед merge — обязательный review.
2. Проверить: нет ли утечек ключей, RLS для новых таблиц, await для навигации.
