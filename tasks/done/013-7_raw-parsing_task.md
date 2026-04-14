📋 Прочитай docs/BOOT.md. Финальная очистка парсинга.
ЦЕЛЬ: Заменить URLSearchParams на ручной парсинг, чтобы исключить искажение спецсимволов.

<context>
Криптография работает, но хеш не сходится. Оставшаяся причина (если токен и бот совпадают) — скрытое изменение строки при URL-декодировании внутри Node.js URLSearchParams.
ЗАВИСИМОСТИ: 013-6 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: hotfix, critical
</context>

<task>
1. **Raw Parameter Parsing:**
   - В функции `validateTelegramInitData` замени блок с `URLSearchParams` на ручной разбор строки:
     ```typescript
     function validateTelegramInitData(initData: string, botToken: string): boolean {
       const paramsMap = new Map<string, string>();
       
       // Ручной парсинг без магии URLSearchParams
       initData.split('&').forEach(pair => {
         const index = pair.indexOf('=');
         if (index === -1) return;
         const key = pair.slice(0, index);
         const val = pair.slice(index + 1);
         paramsMap.set(key, decodeURIComponent(val));
       });

       const hash = paramsMap.get('hash') || paramsMap.get('signature');
       if (!hash) return false;

       paramsMap.delete('hash');
       paramsMap.delete('signature');

       // Сортировка и сборка
       const keys = Array.from(paramsMap.keys()).sort();
       const dataCheckString = keys.map(key => `${key}=${paramsMap.get(key)}`).join('\n');

       const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
       const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

       console.log('[auth] Raw Crypto:', { received: hash.slice(0, 5), calculated: calculatedHash.slice(0, 5) });
       return calculatedHash === hash;
     }
     ```

2. **ВЕРИФИКАЦИЯ:**
   - Деплой на Vercel.
   - Убедись, что ты открываешь Mini App ИМЕННО из того бота, чей токен указан в Vercel.
   - Ожидаемый результат: 200 OK.
</task>

<rules>
- Исполнитель: Claude Code.
</rules>