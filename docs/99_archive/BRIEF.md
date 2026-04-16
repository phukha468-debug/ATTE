# BRIEF — ATTE (66AI Attestation)

> **Архитектура и техническое описание проекта**
> Версия: 1.2 (15.04.2026)

---

## 🏗 Архитектура системы

ATTE — это TMA (Telegram Mini App), построенное на стеке React + Supabase + Vercel Serverless.

### Стек технологий:
- **Frontend:** React 19, Vite 6, Tailwind CSS v4, shadcn/ui.
- **Backend:** Vercel Serverless Functions (Node.js/Edge).
- **База данных:** Supabase (PostgreSQL) с поддержкой RLS (Row Level Security).
- **ИИ-ядро:** OpenRouter API (Gemini 2.0 Flash для диалогов, Claude 3.7 Sonnet для оценки).

---

## 🗄 Структура базы данных (Supabase)

### Таблица `companies`
- `id`: UUID (Primary Key)
- `name`: TEXT (Название компании)
- `size_category`: TEXT (micro, small, enterprise)
- `pricing_tier`: TEXT (Тарифный план)

### Таблица `users`
- `id`: UUID (Primary Key, совпадает с auth.uid())
- `tg_id`: BIGINT (Уникальный ID Telegram)
- `company_id`: UUID (Foreign Key к companies)
- `role`: TEXT (employee, manager, admin)
- `full_name`: TEXT (Имя пользователя)

### Таблица `test_results`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key к users)
- `company_id`: UUID (Денормализованное поле для отчетов)
- `type`: TEXT (Тип результата: 'stage1' — тесты, 'stage2' — симулятор)
- `answers`: JSONB (Ответы на вопросы или лог чата симулятора)
- `llm_feedback`: JSONB (Оценка, фидбек и коэффициенты от ИИ)
- `score`: INTEGER (Балл 0-100)
- `is_completed`: BOOLEAN (Флаг завершения)

### Таблица `questions` (Этап 1)
- `id`: UUID (Primary Key)
- `category`: TEXT (prompting, routine, limitations, legal)
- `text`: TEXT (Вопрос)
- `type`: TEXT (mcq — выбор варианта, open — открытый)
- `options`: JSONB (Варианты ответов)
- `llm_rubric`: TEXT (Критерии оценки для ИИ)

---

## 📡 API Эндпоинты

- `POST /api/auth/telegram`: Валидация initData и получение JWT.
- `POST /api/ai/evaluate`: Оценка ответов первого этапа (аттестация).
- `POST /api/ai/simulate`: Диалоговый ИИ-ассистент для Песочницы.
- `POST /api/ai/judge`: Оценка навыков пользователя на основе лога чата (Судья).

---

## 🔒 Безопасность

1. **Shadow Auth:** Валидация HMAC-SHA-256 на сервере перед созданием сессии в Supabase.
2. **Multi-tenancy:** Изоляция данных на уровне RLS (Row Level Security) по `company_id`.
3. **Secrets:** Ключи OpenRouter и Supabase Service Role хранятся только в переменных окружения на стороне Vercel.

---
[Вернуться в BOOT.md](./BOOT.md)
