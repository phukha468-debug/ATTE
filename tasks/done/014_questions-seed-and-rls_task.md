📋 Прочитай docs/BOOT.md. Эпик "Авторизация" успешно завершен.
ЦЕЛЬ: Наполнить базу данных вопросами для аттестации и проверить безопасность доступа (RLS).

<context>
Входная дверь работает, пользователи логинятся. Теперь нам нужны вопросы для генерации "Карты рутины". Таблица questions в Supabase сейчас пуста. Нам нужно запустить seed-скрипт и убедиться, что RLS (Row Level Security) позволяет авторизованным пользователям читать данные.

ЗАВИСИМОСТИ: 013-8 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: 
- scripts/seed_questions.ts
- docs/BRIEF.md
ТИП: feat, db, security
</context>

<task>
1. **Seed Script Execution**:
   - Убедись, что скрипт `scripts/seed_questions.ts` существует и использует `SUPABASE_SERVICE_ROLE_KEY` (чтобы писать в БД в обход RLS).
   - Если скрипта нет — создай его. Он должен загружать 5-10 базовых вопросов (категории: Текст, Таблицы, Код, Аналитика).
   - Запусти `npm run seed`. 
   - Проверь в Supabase Dashboard (Table Editor), что таблица `questions` наполнилась.

2. **RLS Configuration (questions)**:
   - В Supabase Dashboard перейди в Authentication -> Policies.
   - Убедись, что для таблицы `questions` включен RLS.
   - Создай политику: `Allow SELECT for authenticated users` (Target roles: authenticated, check expression: true).

3. **Frontend Integration Check**:
   - В коде приложения (например, на странице аттестации) напиши вызов: `supabase.from('questions').select('*')`.
   - Убедись, что данные приходят на клиент без ошибок 401/403.

4. **ВЕРИФИКАЦИЯ**:
   - Зайди в приложение через Telegram под своим аккаунтом.
   - Убедись, что в консоли браузера (или в UI) отображается список реальных вопросов из БД, а не моковые данные.
</task>

<rules>
- Исполнитель: Qwen Code (или Claude Code).
- СТРОГО: Не использовать anon_key для скрипта наполнения (только service_role). Клиентское приложение читает строго через anon_key.
- СТРОГО: Использовать схему полей из BRIEF.md (`id`, `category`, `text`, `type`, `options`).
</rules>

---
## COMPLETION LOG
**Статус**: pending
**Исполнитель**: ___