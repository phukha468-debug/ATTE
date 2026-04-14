📋 Прочитай docs/BOOT.md перед выполнением этого задания.

<context>
Реализуем безопасную авторизацию Telegram Mini App (TMA) → Supabase.
Мы используем паттерн "Shadow Auth", утвержденный в `docs/adr/ADR-001_telegram-auth.md`. Фронтенд должен отправить `initData` на Vercel API, а сервер — проверить подпись, создать/найти пользователя в Supabase и вернуть сессию (`access_token`, `refresh_token`).

ЗАВИСИМОСТИ: 001_preflight-ui_task (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts, src/lib/auth.ts (создать), src/App.tsx (или корневой лейаут)
ТИП: feat
</context>

<task>
1. Создай Vercel Serverless Function в `api/auth/telegram.ts` (обрати внимание, папка `api` в корне проекта для Vercel, не внутри `src`).
2. В функции реализуй валидацию Telegram `initData` через HMAC-SHA-256 с использованием `process.env.TG_BOT_TOKEN`.
3. В этой же функции инициализируй Supabase клиент с `process.env.SUPABASE_SERVICE_ROLE_KEY`.
4. Реализуй логику "Shadow Auth" (поиск пользователя по `tg_id`, если нет -> создание через `supabase.auth.admin.createUser` с фиктивным email `tg_id@atte.local` и случайным паролем, сохранение профиля в `users` (и дефолтной `companies`), логин через этот email/пароль для получения сессии).
5. Верни объект `session` на клиент.
6. На фронтенде (создай `src/lib/auth.ts` или добавь в `src/lib/supabase.ts` функцию) сделай POST запрос к `/api/auth/telegram` с `window.Telegram.WebApp.initData`.
7. Получив ответ, вызови `await supabase.auth.setSession({ access_token, refresh_token })`.
8. Добавь в корневой компонент (`App.tsx` или `Layout.tsx`) стейт загрузки, чтобы приложение ждало инициализации авторизации перед показом контента.
9. ВЕРИФИКАЦИЯ: Запусти проект (через `vite` и локальный прокси для `/api` или `vercel dev`). Убедись, что при наличии моковых данных `initData` сервер возвращает 200 OK и сессию Supabase, а клиент успешно устанавливает её.
10. Заполни COMPLETION LOG.
11. Перенеси файл в `tasks/done/`.
</task>

<rules>
- КЛЮЧИ: Vercel Function (`api/auth/telegram.ts`) ОБЯЗАНА использовать `SUPABASE_SERVICE_ROLE_KEY`. Клиент ОБЯЗАН использовать `VITE_SUPABASE_ANON_KEY`.
- ASYNC ПОРЯДОК: Фронтенд не должен пускать пользователя дальше экрана загрузки (Splash Screen), пока `setSession` не выполнится успешно.
- БЕЗОПАСНОСТЬ: Оберни весь код Vercel Function в `try/catch` и возвращай статус 401, если подпись `initData` недействительна.
- Исполнитель: Qwen Code (или Claude Code).
- ПРОТОКОЛ ОШИБКИ: Если возникает конфликт версий или типов `@supabase/supabase-js`, опиши проблему в логе и жди. Не ломай зависимости.
</rules>

---

## COMPLETION LOG

**Статус:** _pending_
**Дата завершения:** ___
**Исполнитель:** ___

### Сделано
- _[что фактически выполнено]_

### Изменённые файлы
- _[список файлов]_

### Верификация
- [ ] Серверная валидация HMAC работает (или протестирована с моком)
- [ ] Функция возвращает сессию
- [ ] Клиент успешно делает `setSession`
- [ ] Build: passed

### Побочные эффекты / риски
- _[опиши риски]_

### Открытые вопросы
- _[вопросы]_