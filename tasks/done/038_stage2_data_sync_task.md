📋 Прочитай docs/BOOT.md перед выполнением.

<context>
БАГИ ИНТЕГРАЦИИ ЭТАПА 2:
1. Результат Судьи (score, feedback) не сохраняется в базу данных.
2. Главная страница (Home) не обновляет статус Этапа 2 на "Пройдено".
3. В разделе "Отчёты" (Reports) нет блока с результатами Симулятора.
4. На экране `SimulatorResultPage` не отображается итоговая цифра балла.

ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/ai/judge.ts, src/pages/SimulatorResultPage.tsx, src/pages/HomePage.tsx, src/pages/ReportsPage.tsx
ТИП: data-binding, ui, fix
</context>

<task>
1. **Save to DB:**
   - В функции оценки или на клиенте после получения ответа от Судьи — добавить запись результата в Supabase. (Либо в `test_results` с новым типом `stage2`, либо в новую таблицу `simulator_results`).
2. **Fix Result Screen:**
   - В `SimulatorResultPage.tsx` убедиться, что переменная со счетом (`score`) корректно извлекается из JSON Судьи и рендерится в UI.
3. **Sync Home Page:**
   - На Главной странице в блоке прогресса Этап 2 должен менять статус на "Пройдено" и показывать балл, если есть запись в БД.
4. **Sync Reports Page:**
   - Добавить на страницу "Отчёты" новую секцию "Этап 2: Навыки в деле", где выводится балл и текстовый фидбек от LLM-Судьи.
</task>

<rules>
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** _pending_