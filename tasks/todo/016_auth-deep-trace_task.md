📋 Прочитай docs/BOOT.md. Мы ищем точное место зависания фронтенда.
ЦЕЛЬ: Локализовать зависание внутри функции `loginWithTelegram`.

<context>
Бэкенд возвращает 200 OK и сессию, но фронтенд зависает сразу после вызова `loginWithTelegram()`. Нужно понять, на какой именно строчке внутри `src/lib/auth.ts` застревает выполнение.
ЗАВИСИМОСТИ: 015 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: src/lib/auth.ts
ТИП: debug, frontend
</context>

<task>
1. **Deep Logging (src/lib/auth.ts):**
   - Найди функцию `loginWithTelegram`.
   - Добавь подробные логи перед каждым `await` внутри неё:
     ```typescript
     console.log('[auth-deep] 1. Calling fetch...');
     const response = await fetch('/api/auth/telegram', { ... });
     console.log('[auth-deep] 2. Fetch complete, status:', response.status);

     console.log('[auth-deep] 3. Parsing JSON...');
     const result: AuthResult = await response.json();
     console.log('[auth-deep] 4. JSON parsed successfully');

     console.log('[auth-deep] 5. Calling setSession...');
     const { error: sessionError } = await supabase.auth.setSession({
       access_token: result.session.access_token,
       refresh_token: result.session.refresh_token,
     });
     console.log('[auth-deep] 6. setSession complete, error:', sessionError?.message || 'none');
     ```

2. **ВЕРИФИКАЦИЯ:**
   - После деплоя Заказчик откроет приложение и пришлет логи из консоли. Мы увидим, на какой цифре `[auth-deep]` останавливается код.
</task>

<rules>
- Исполнитель: Claude Code.
- СТРОГО: Не менять саму логику авторизации, только добавить логи. Наша задача — локализация.
</rules>

---
## COMPLETION LOG
**Статус:** done
**Дата:** 2026-04-14
**Исполнитель:** Claude Code