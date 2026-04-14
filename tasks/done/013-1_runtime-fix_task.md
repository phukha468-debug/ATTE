📋 Прочитай docs/BOOT.md. Сработала CHAIN BREAKER диагностика.
ЦЕЛЬ: Исправить ошибку "req.text is not a function" для Node.js Runtime.

<context>
Бэкенд падает с ошибкой типа при попытке прочитать тело запроса. 
В Node.js runtime на Vercel объект запроса может не иметь методов .text() или .json().
ЗАВИСИМОСТИ: 013 (failed)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: hotfix, backend
</context>

<task>
1. **Node.js Request Parsing:**
   - Перепиши извлечение тела запроса в `api/auth/telegram.ts`, используя гарантированный способ для Node.js:
     ```typescript
     // Замени чтение rawBody на этот блок:
     const chunks = [];
     for await (const chunk of (req as any)) {
       chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
     }
     const rawBody = Buffer.concat(chunks).toString('utf-8');
     ```
2. **Safety Check:**
   - Добавь проверку: если `rawBody` пустой после чтения потока — возвращай `400 Missing request body`.
3. **Keep Logs:**
   - Сохрани `console.log('[auth] Raw body received:', rawBody)`, это поможет увидеть, что именно шлет фронтенд.
4. **ВЕРИФИКАЦИЯ:**
   - После деплоя ошибка "req.text is not a function" должна исчезнуть в логах Vercel.
   - Лог должен показать `[auth] Raw body received: {"initData": "..."}`.
</task>

<rules>
- СТРОГО: Не менять runtime на 'edge', оставаться на 'nodejs' для стабильности crypto.
- Исполнитель: Claude Code.
</rules>