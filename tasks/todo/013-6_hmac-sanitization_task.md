📋 Прочитай docs/BOOT.md. Математика верна, очищаем "грязные" переменные.
ЦЕЛЬ: Устранить невидимые символы в токене и нестабильность сортировки.

<context>
Алгоритм HMAC работает, данные собираются верно, но хеш не сходится. Опыт показывает, что проблема в скрытых символах Environment Variables (Vercel) или поведении localeCompare.
ЗАВИСИМОСТИ: 013-5 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: hotfix, critical
</context>

<task>
1. **Token Sanitization:**
   - В функции `handler`, там где ты достаешь токен, жестко очисти его:
     `const botToken = process.env.TG_BOT_TOKEN?.trim();`
   - Передай этот очищенный токен в функцию `validateTelegramInitData`.

2. **Strict ASCII Sort:**
   - В `validateTelegramInitData` замени сортировку параметров.
   - БЫЛО: `.sort(([a], [b]) => a.localeCompare(b))`
   - СТАЛО: `.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))`

3. **ВЕРИФИКАЦИЯ:**
   - После деплоя запусти приложение из Telegram.
   - Ожидаемый результат: Авторизация успешна (200 OK).
</task>

<rules>
- СТРОГО: Использовать операторы `<` и `>` для сортировки, чтобы исключить влияние локали сервера.
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** done
**Дата:** 2026-04-14
**Изменения в `api/auth/telegram.ts`:**
- L225: `TG_BOT_TOKEN?.trim()` — токен обрезается от невидимых символов
- L61: сортировка через `<`/`>` вместо `localeCompare` — стабильный ASCII-порядок
</context>