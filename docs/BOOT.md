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
