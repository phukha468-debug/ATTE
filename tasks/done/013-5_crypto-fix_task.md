📋 Прочитай docs/BOOT.md. Мы нашли первопричину 401 ошибки.
ЦЕЛЬ: Исправить криптографическую логику валидации HMAC.

<context>
Анализ логов показал, что данные сортируются и очищаются правильно, но сам алгоритм HMAC реализован неверно (перепутаны аргументы ключа и сообщения, используется hex-строка вместо буфера).
ЗАВИСИМОСТИ: 013-4 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical
</context>

<task>
1. **Переписать validateTelegramInitData:**
   - Полностью замени текущую функцию `validateTelegramInitData` на этот эталонный код:
     ```typescript
     function validateTelegramInitData(initData: string, botToken: string): boolean {
       const urlParams = new URLSearchParams(initData);
       const hash = urlParams.get('hash') || urlParams.get('signature');
       if (!hash) return false;

       urlParams.delete('hash');
       urlParams.delete('signature');

       const params = Array.from(urlParams.entries())
         .sort(([a], [b]) => a.localeCompare(b))
         .map(([key, value]) => `${key}=${value}`)
         .join('\n');

       // FIX 1: 'WebAppData' — это ключ, botToken — это данные.
       const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
       
       // FIX 2: secretKey передается как Buffer (сырые байты), а не как hex-строка.
       const calculatedHash = createHmac('sha256', secretKey).update(params).digest('hex');

       console.log('[auth] Crypto Debug:', { 
         received: hash.slice(0, 5) + '...', 
         calculated: calculatedHash.slice(0, 5) + '...' 
       });

       return calculatedHash === hash;
     }
     ```
2. **ВЕРИФИКАЦИЯ:**
   - Сделай деплой.
   - Зайди в приложение через Telegram.
   - Теперь `calculatedHash` ОБЯЗАН совпасть с `receivedHash`, и сервер вернет `200 OK`.
</task>

<rules>
- СТРОГО: Использовать `createHmac` напрямую, как показано в примере.
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** pending
**Исполнитель:** ___