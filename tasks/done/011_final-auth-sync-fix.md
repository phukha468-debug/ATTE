📋 Прочитай docs/BOOT.md и docs/RULES.md перед выполнением.

<context>
Текущий статус: Бэкенд на Vercel возвращает ошибку `[auth] ✗ Invalid JSON body`. 
Диагностика показала: Фронтенд отправляет `initData` как сырую строку (string) в теле POST-запроса, в то время как серверная функция пытается выполнить `await req.json()`. Происходит несоответствие типов данных и заголовков (Content-Type).

ЗАВИСИМОСТИ: 010_json-body-hotfix (требуется переделка)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: 
- src/lib/auth.ts
- api/auth/telegram.ts
ТИП: bugfix, critical
</context>

<task>
1. **Frontend Refactoring (`src/lib/auth.ts`):**
   - Убедись, что функция `loginWithTelegram` формирует запрос строго в формате JSON.
   - Обязательно добавь заголовок: `'Content-Type': 'application/json'`.
   - Тело запроса должно быть объектом, пропущенным через `JSON.stringify`.
   ```typescript
   // ПРИМЕР:
   const response = await fetch('/api/auth/telegram', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ initData: webApp.initData })
   });
Backend Refactoring (api/auth/telegram.ts):

Реализуй безопасный парсинг тела запроса.

Извлекай initData через деструктуризацию объекта.

TypeScript
// ПРИМЕР:
try {
  const body = await req.json();
  const initData = body.initData;
  if (!initData) throw new Error('No initData in body');
  // ...дальнейшая логика валидации
} catch (e) {
  console.error('[auth] ✗ Parsing error:', e.message);
  return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
}
Логирование:

Оставь console.log для отслеживания этапов в Vercel Logs, но убедись, что они не раскрывают конфиденциальные данные (хеши/токены) в полном объеме.

ВЕРИФИКАЦИЯ: - После пуша ошибка Invalid JSON body в логах Vercel должна смениться на логи успешной валидации HMAC или переход к загрузке вопросов.

Приложение должно успешно авторизовать пользователя при запуске через кнопку в @ATTE66bot.

</task>

<rules>

СТРОГО: Не использовать req.body напрямую без парсинга, так как в среде Vercel Edge Runtime/Node это может привести к ошибкам типов.

Исполнитель: Claude Code.
</rules>

COMPLETION LOG
Статус: pending
Исполнитель: ___
Деплой ID: ___