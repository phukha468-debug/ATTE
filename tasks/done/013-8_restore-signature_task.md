📋 Прочитай docs/BOOT.md. Мы нашли архитектурную ошибку в логике валидации.
ЦЕЛЬ: Вернуть поле `signature` в строку проверки. Удалять разрешено только `hash`.

<context>
В таске 013-4 мы ошибочно удалили поле `signature` из проверяемой строки. Поскольку Telegram присылает и `hash`, и `signature`, поле `signature` обязано участвовать в формировании `dataCheckString`, так как Telegram включил его в свой хеш.
ЗАВИСИМОСТИ: 013-7 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: hotfix, critical
</context>

<task>
1. **Restore Signature in Validation:**
   - В функции `validateTelegramInitData` найди блок извлечения `hash`.
   - Убери любые упоминания `signature` из удаления. Должно остаться только это:
     ```typescript
     const hash = paramsMap.get('hash');
     if (!hash) return false;

     paramsMap.delete('hash'); // УДАЛЯЕМ ТОЛЬКО HASH!
     
     // signature останется в paramsMap и попадет в сортировку и dataCheckString
     const keys = Array.from(paramsMap.keys()).sort();
     ```

2. **ВЕРИФИКАЦИЯ:**
   - После деплоя запусти приложение из Telegram.
   - В логах Vercel в строке `[auth] DataCheckString keys (sorted):` теперь должно быть 5 ключей: `auth_date, chat_instance, chat_type, signature, user`.
   - Хеши совпадут (200 OK).
</task>

<rules>
- Исполнитель: Claude Code.
- СТРОГО: Не вырезать поле `signature` из параметров.
</rules>