📋 Прочитай docs/BOOT.md перед выполнением. Сработало правило CHAIN BREAKER.

<context>
Исправляем критический рассинхрон между кодом авторизации и реальной таблицей в Supabase. 
На скриншоте Dashboard видно, что колонка называется tg_id, а код ищет telegram_id.

ЗАВИСИМОСТИ: 011 (не выполнен)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical
</context>

<task>
1. **Schema Sync:**
   - В `api/auth/telegram.ts` в функции `authUser` замени `.eq('telegram_id', tgId)` на `.eq('tg_id', tgId)`.
   - В блоке `supabase.from('users').insert({...})` замени ключ `telegram_id` на `tg_id`.
   - В `user_metadata` внутри `admin.createUser` также используй `tg_id`.
2. **Runtime Configuration:**
   - Добавь в самое начало файла: `export const config = { runtime: 'nodejs' };` для стабильной работы crypto в Vercel.
3. **Response Safety:**
   - Проверь, что во всех ветках `if/else` функции `authUser` и основного `handler` возвращается валидный объект `Response`.
4. **ВЕРИФИКАЦИЯ:**
   - После деплоя в Telegram боте: кнопка запуска -> авторизация.
   - Убедись, что в Dashboard Supabase появилась запись в таблице `users` и `companies`.
   - Ожидаемый ответ от API: 200 OK с объектом session.
5. Заполни COMPLETION LOG в конце этого файла.
6. Перенеси файл в tasks/done/.
</task>

<rules>
- СТРОГО: Поле в БД — tg_id (подтверждено скриншотом).
- КЛЮЧИ: Использовать SERVICE_ROLE_KEY (Shadow Auth).
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** pending
**Дата завершения:** ___
**Исполнитель:** ___