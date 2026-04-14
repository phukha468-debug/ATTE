<context>
При входе через Telegram в логах Vercel падает ошибка `[auth] ✗ Invalid JSON body`. Бэкенд не может распарсить тело POST-запроса от фронтенда. Нам нужно синхронизировать `fetch` на клиенте и парсинг на сервере.

ЗАВИСИМОСТИ: 009_timeout-hotfix_task (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: 
- src/lib/auth.ts (клиент)
- api/auth/telegram.ts (сервер)
ТИП: fix, auth
</context>

<task>
1. **Frontend (`src/lib/auth.ts`):**
   - Найди `fetch` запрос к `/api/auth/telegram`.
   - Убедись, что передаются правильные заголовки: `headers: { 'Content-Type': 'application/json' }`.
   - Убедись, что тело запроса строго обернуто в JSON: `body: JSON.stringify({ initData: window.Telegram.WebApp.initData || "DEV_MODE" })`.
2. **Backend (`api/auth/telegram.ts`):**
   - Убедись, что парсинг тела обернут в `try/catch` (он, видимо, уже обернут, раз мы видим лог, но нужно возвращать правильный HTTP статус).
   - Если `req.json()` падает, делай: `return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })`.
   - Извлекай `initData` так: `const { initData } = await req.json();`
3. ВЕРИФИКАЦИЯ: 
   - Сделай git push. Ошибка `Invalid JSON body` должна уйти, и бэкенд должен перейти к следующему шагу (HMAC валидация).
4. Заполни COMPLETION LOG и перенеси в `tasks/done/`.
</task>

<rules>
- Исполнитель: Claude Code.
</rules>