<context>
При тестировании на живом Vercel (`NODE_ENV === 'production'`) функция `/api/auth/telegram` ловит `504 Gateway Timeout` (300 seconds), если зайти в неё из обычного браузера. Это означает, что сервер не возвращает HTTP-ответ (Response), когда отклоняет `DEV_MODE` обход или получает неверный HTTP-метод.

ЗАВИСИМОСТИ: 008.5_hotfix-dev-env (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, backend
</context>

<task>
1. **Обработка методов (Method Not Allowed):**
   - В самом начале функции добавь проверку: `if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })` (или `res.status(405).send(...)`, в зависимости от того, какой формат API используется).
2. **Гарантированный возврат ответа (Catch-all):**
   - Убедись, что если `initData === "DEV_MODE"` приходит в Production среде, функция НЕ зависает, а строго делает `return new Response(JSON.stringify({ error: "Unauthorized: Dev mode disabled in production" }), { status: 403 })`.
   - Убедись, что блок валидации HMAC тоже возвращает `401 Unauthorized`, если валидация не пройдена.
3. **Глобальный try/catch:**
   - Оберни ВСЮ логику функции в `try { ... } catch (error) { return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 }) }`. Ни один запрос не должен висеть без ответа.
4. ВЕРИФИКАЦИЯ:
   - При открытии сайта в Chrome на Vercel (production), запрос к `/api/auth/telegram` должен мгновенно (за миллисекунды) возвращать 403 или 401 ошибку, а фронтенд должен показывать понятный UI "Откройте через Telegram", вместо бесконечного лоадера и 504 ошибки.
5. Заполни COMPLETION LOG и перенеси в `tasks/done/`.
</task>

<rules>
- Исполнитель: Claude Code. Строгий фокус на `return` во всех ветвлениях (`if/else`).
</rules>