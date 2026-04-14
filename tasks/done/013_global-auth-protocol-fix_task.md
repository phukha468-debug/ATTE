📋 Прочитай docs/BOOT.md. Сработало правило CHAIN BREAKER.
ЦЕЛЬ: Устранить "Invalid JSON" и ошибку отсутствующих колонок PostgreSQL.

<context>
Аудит кода показал, что в Step 3b (insert user) используются поля job_title, department и grade, которых НЕТ в таблице users (согласно скриншоту). Также сохраняется риск падения req.json().

ЗАВИСИМОСТИ: 012 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical
</context>

<task>
1. **Fix SQL Insert (Критично):**
   - В `api/auth/telegram.ts` (примерно строка 115) удали поля `job_title`, `department` и `grade` из запроса `.insert()`. 
   - Оставь только: `id`, `tg_id`, `full_name`, `company_id`.

2. **Fix JSON Parsing (Protocol):**
   - Замени текущий `body = await req.json()` на более надежный метод:
     ```typescript
     const rawBody = await req.text();
     console.log('[auth] Raw body received:', rawBody);
     try {
       body = JSON.parse(rawBody);
     } catch (e) {
       console.error('[auth] JSON Parse Error:', e.message);
       return new Response(JSON.stringify({ error: 'Invalid JSON', detail: e.message }), { status: 400 });
     }
     ```

3. **Log Expansion:**
   - Добавь `console.log('[auth] Step 3b: Profile data', { userId, tgId, fullName, companyId })` прямо перед инсертом, чтобы видеть, что мы пытаемся записать.

4. **ВЕРИФИКАЦИЯ:**
   - После пуша проверь логи Vercel. Ошибка `Invalid JSON body` должна исчезнуть.
   - Если инсерт в `users` прошел — авторизация завершится успешно.
</task>

<rules>
- СТРОГО: Не добавлять в INSERT поля, которых нет на скриншоте БД.
- Исполнитель: Claude Code.
</rules>