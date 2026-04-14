📋 Прочитай docs/BOOT.md. Мы ловим "невидимую" ошибку в данных.
ЦЕЛЬ: Сопоставить строку проверки бэкенда с эталоном Telegram.

<context>
Токен бота подтвержден как верный. Ошибка 401 означает, что данные искажаются при передаче или парсинге. Нужно увидеть "dataCheckString".
ЗАВИСИМОСТИ: 013.2 (failed)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical, debug
</context>

<task>
1. **Trim & Sanitize InitData:**
   - Перед тем как передавать `initData` в `validateTelegramInitData`, примени `.trim()` к строке.
   - Внутри функции валидации добавь очистку от возможных лишних кавычек:
     `const cleanInitData = initData.replace(/^["']|["']$/g, '');`

2. **Deep Logging (Критично):**
   - В `api/auth/telegram.ts` внутри функции `validateTelegramInitData` выведи в консоль:
     `console.log('[auth] DataCheckString (first 50 chars):', params.substring(0, 50));`
   - Это позволит нам сравнить структуру строки (сортировку, разделители \n) с документацией Telegram.

3. **URL Search Params Fix:**
   - Убедись, что `new URLSearchParams(initData)` корректно обрабатывает строку, если она пришла обернутой в JSON (через body.initData).

4. **ВЕРИФИКАЦИЯ:**
   - Если после деплоя всё ещё 401: скопируй из логов Vercel строку `[auth] DataCheckString` и `[auth] Raw body`.
   - Если 200 — мы победили искажение данных.
</task>

<rules>
- Исполнитель: Claude Code.
- СТРОГО: Сравнить логику сортировки параметров с актуальной документацией Telegram (alphabetical order).
</rules>