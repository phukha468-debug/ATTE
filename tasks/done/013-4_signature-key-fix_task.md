📋 Прочитай docs/BOOT.md. Мы нашли расхождение в ключах подписи.
ЦЕЛЬ: Исправить 401, добавив поддержку ключа 'signature' вместо 'hash'.

<context>
Логи показали, что Telegram присылает поле 'signature', а не 'hash'. 
Это ломает логику очистки параметров перед проверкой HMAC.
ЗАВИСИМОСТИ: 013.3 (failed)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: fix, critical
</context>

<task>
1. **Update Validation Logic (api/auth/telegram.ts):**
   - В функции `validateTelegramInitData` измени извлечение подписи:
     ```typescript
     const urlParams = new URLSearchParams(initData);
     const hash = urlParams.get('hash') || urlParams.get('signature'); // Проверяем оба ключа
     if (!hash) return false;

     urlParams.delete('hash');      // Удаляем оба, если они есть
     urlParams.delete('signature');
     ```
2. **Double Check Alphabetical Sort:**
   - Убедись, что после удаления подписи все остальные параметры сортируются строго по алфавиту (как и реализовано сейчас).

3. **ВЕРИФИКАЦИЯ:**
   - После деплоя лог `paramKeys` в `HMAC Debug` НЕ должен содержать ни `hash`, ни `signature`.
   - Ответ должен смениться на 200 OK.
</task>

<rules>
- СТРОГО: Использовать `urlParams.get('hash') || urlParams.get('signature')`.
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** pending
**Исполнитель:** ___