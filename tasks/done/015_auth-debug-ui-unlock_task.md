📋 Прочитай docs/BOOT.md. Мы столкнулись с "тихим" зависанием фронтенда.
ЦЕЛЬ: Найти застрявший await и разблокировать интерфейс.

<context>
Бэкенд работает (200 OK), но Layout.tsx зависает в SplashScreen. 
Нужно добавить логирование каждого шага и таймаут на инициализацию.
ЗАВИСИМОСТИ: 014 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: src/components/Layout.tsx, src/lib/api.ts
ТИП: fix, debug
</context>

<task>
1. **Verbose Logging (Layout.tsx):**
   - Внутри `useEffect` в функции `initAuth` добавь логи перед каждым await:
     `console.log('[auth-debug] 1. Starting getSession...')`
     `console.log('[auth-debug] 2. Session found:', !!session)`
     `console.log('[auth-debug] 3. Fetching profile...')`
   - Это позволит увидеть в консоли браузера, на каком шаге всё останавливается.

2. **Timeout Guard (Layout.tsx):**
   - Оберни всю логику `initAuth` в таймаут 8 секунд. Если за это время `authState` не стал 'ready', принудительно вызови `setAuthState('error')` с текстом "Превышено время ожидания авторизации".

3. **Profile Fetch Resilience (src/lib/api.ts):**
   - Проверь функцию `fetchCurrentUserProfile`. 
   - Если профиль не найден (`data` пуст), она должна возвращать `null` или объект с `role: 'employee'`, но НЕ бросать исключение и не зависать.

4. **ВЕРИФИКАЦИЯ:**
   - После пуша открой консоль (F12) в TMA. 
   - Напиши мне, какой последний номер `[auth-debug]` ты видишь в логах.
</task>

<rules>
- Исполнитель: Claude Code.
- СТРОГО: Обязательно добавить `try/catch` вокруг `fetchCurrentUserProfile` отдельно, чтобы ошибка в профиле не блокировала вход в приложение.
</rules>

---
## COMPLETION LOG
**Статус:** pending
**Исполнитель:** ___