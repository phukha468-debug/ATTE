📋 Прочитай docs/BOOT.md. Мы на финальной прямой авторизации.
ЦЕЛЬ: Исправить 401 Unauthorized и проверить валидность токена.

<context>
Бэкенд успешно получает данные, но HMAC-проверка не проходит. Нужно понять: токен неверный или данные искажены.
ЗАВИСИМОСТИ: 013.1 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical
</context>

<task>
1. **Environment Audit (Заказчику):**
   - ПРОВЕРЬ: Совпадает ли `TG_BOT_TOKEN` в Vercel Environment Variables с тем, что в твоем `.env.local` и в BotFather.
   - СОВЕТ: Пересохрани токен в Vercel и сделай "Redeploy", чтобы исключить кэширование старого ключа.

2. **Validation Logging (api/auth/telegram.ts):**
   - Добавь лог перед `timingSafeEqual`:
     ```typescript
     console.log('[auth] HMAC Debug:', {
       receivedHash: hash?.slice(0, 5) + '...',
       calculatedHash: dataCheckString.toString('hex').slice(0, 5) + '...',
       dataStringLength: params.length
     });
     ```
3. **InitData Sanitization:**
   - Убедись, что `urlParams` не содержат лишних пробелов или символов перевода строки перед сортировкой.

4. **ВЕРИФИКАЦИЯ:**
   - Зайди через @ATTE66bot.
   - Если 401 повторится — пришли лог "HMAC Debug" из Vercel.
   - Если 200 — авторизация ПОБЕЖДЕНА.
</task>

<rules>
- СТРОГО: Не выводить полный TG_BOT_TOKEN в логи.
- Исполнитель: Claude Code.
</rules>