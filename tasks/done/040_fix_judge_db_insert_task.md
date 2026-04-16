📋 Прочитай docs/BOOT.md перед выполнением.

<context>
КРИТИЧЕСКИЙ БАГ: Результаты Этапа 2 (Симулятора) не сохраняются в БД. 
Симптомы: В таблице `test_results` нет записей с `type = 'stage2'`. Из-за этого Главная страница, страница Тестов и Отчеты не отображают прогресс Этапа 2.

ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/ai/judge.ts, src/pages/SandboxPage.tsx, src/pages/ReportsPage.tsx
ТИП: bugfix, backend, database
</context>

<task>
1. **Fix Payload in Frontend (`SandboxPage.tsx`):**
   - Убедись, что при нажатии "Завершить экзамен" и вызове API `/api/ai/judge`, фронтенд передает не только историю чата, но и `userId` и `companyId` текущего пользователя.

2. **Fix DB Insert in Backend (`api/ai/judge.ts`):**
   - После получения оценки от OpenRouter, добавь логику сохранения результата в Supabase.
   - Таблица: `test_results`.
   - Поля для записи: 
     - `user_id` (из payload)
     - `company_id` (из payload)
     - `type`: 'stage2'
     - `score`: полученный балл
     - `llm_feedback`: JSON с разбором
     - `is_completed`: true
   - Оберни `supabase.from('test_results').insert(...)` в try/catch и выведи ошибку в консоль, если запись не удалась (возможно, падает RLS).

3. **Check Frontend Rendering (`ReportsPage.tsx` / `HomePage.tsx`):**
   - Убедись, что логика фронтенда корректно фильтрует данные: берет `type === 'stage1'` для первого этапа и `type === 'stage2'` для второго.
   - На странице "Отчеты" блок Этапа 2 должен рендерить текст из `llm_feedback`.

4. **ВЕРИФИКАЦИЯ:**
   - Пройти тест в Песочнице до конца.
   - Проверить наличие записи `stage2` в БД.
   - Проверить отображение балла на Главной и в Отчетах.
</task>

<rules>
- Исполнитель: Claude Code.
- Если проблема в RLS (Row Level Security), используй `supabase-admin` клиент с `service_role_key` внутри Vercel Function для записи результата.
</rules>

---
## COMPLETION LOG
**Статус:** _pending_