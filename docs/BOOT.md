# BOOT — ATTE (66AI Attestation)

> Telegram Mini App для B2B-аттестации ИИ-компетенций

---

## Суть

TMA, которое позволяет компаниям (от микро-бизнеса 1–9 чел. до enterprise) диагностировать уровень ИИ-грамотности сотрудников, выявлять рутинные задачи для автоматизации и получать HR-отчёты по результатам.

**Модель:** B2B SaaS, тарифы Standard / Premium.

---

## Текущий статус

**Авторизация настроена, БД инициализирована.** ✅

### Что сделано:
- [x] Pre-flight UI: 6 shadcn/ui компонентов восстановлены (button, card, badge, avatar, progress, tabs)
- [x] Telegram Shadow Auth: HMAC → Vercel Function → Supabase Service Role → JWT
- [x] Клиентский auth hook: `loginWithTelegram()` + `setSession()`
- [x] SplashScreen + ErrorScreen в Layout
- [x] Vite proxy для локального тестирования /api
- [x] Build проходит без ошибок, tsc --noEmit чистый

### Что осталось:
- [ ] ADR #2: RLS-политики multi-tenant
- [ ] ADR #3: LLM provider (OpenRouter vs Gemini Direct)
- [ ] Таблицы в Supabase: companies, users, questions, test_results, payments
- [ ] RLS-политики на всех таблицах
- [ ] `/api/ai/evaluate` — OpenRouter прокси
- [ ] `/api/payments/*` — платёжный flow
- [ ] HR-дашборд с агрегацией по компании

---

## Быстрый старт

```bash
npm install
cp .env.example .env.local
# Заполни .env.local реальными значениями
npm run dev
```

Для локального тестирования API нужен Vercel Dev Server:
```bash
npx vercel dev
# Vite проксирует /api на localhost:3001
```

---

## Ссылки

- [RULES.md](./RULES.md) — правила разработки
- [ADR-001](./adr/ADR-001_telegram-auth.md) — auth flow (Shadow Auth)
- [COUNCIL.md](./COUNCIL.md) — архитектурное решение (блок Арбитра — источник истины)
- [BRIEF.md](./BRIEF.md) — описание проекта

# BOOT — Текущий контекст проекта ATTE
*Этот файл обязательно читает ИИ перед каждой задачей*

## ТЕКУЩИЙ СТАТУС (Phase 2: Движок тестов)
✅ **Core Logic & Auth:** База данных (RLS) исправлена. Авторизация (Telegram) и загрузка профилей (Service Role / anon) работают стабильно.
✅ **SPA Routing:** Настроен через `vercel.json` (ошибок 404 больше нет).
✅ **Test Engine (Старт):** Вопросы корректно загружаются в Zustand-стор, бесконечный лоадер устранен, сессия тестов успешно стартует.
⏳ **В разработке:** Логика прохождения теста внутри сессии.

## ДОРОЖНАЯ КАРТА (Roadmap)
- **ЭТАП 1 (Завершен):** Стабилизация фундамента (Auth + DB + Роутинг). Разблокировка старта тестов.
- **ЭТАП 2 (Текущий):** Логика внутри тестов (переключение вопросов, сбор ответов, финальный подсчет score и запись в `test_results`).
- **ЭТАП 3:** Интеграция реальных данных (замена хардкода в Отчетах и Профиле на агрегированную аналитику из БД).
- **ЭТАП 4:** Монетизация и Premium-фичи (оплата, разблокировка Симулятора и Микро-проектов для `pricing_tier = enterprise` / оплативших).

## ВАЖНЫЕ ПРАВИЛА КОНВЕЙЕРА (VibeCraft V4)
- **Stability-First:** Сначала чиним логику и БД, потом наводим красоту (UI). Никакой полировки нестабильных кнопок.
- **Data Flow:** Любая запись в БД должна сопровождаться жестким `try/catch`. 
- **Ключи:** `VITE_SUPABASE_ANON_KEY` — только фронтенд, `SUPABASE_SERVICE_ROLE_KEY` — строго бэкенд (Vercel Functions).
- **ДИАГНОСТИКА:** Запрещено создавать fix-задачи вслепую. Сначала запрос данных из браузера/консоли Заказчика.
