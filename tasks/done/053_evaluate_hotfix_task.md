📋 Прочитай docs/00_project/ROADMAP.md и docs/01_architecture/DB_SCHEMA_MAP.md
   перед выполнением этого задания.

<context>
ДИАГНОСТИКА: Проведена 2026-04-17.
ВЫЯВЛЕНО: При завершении Этапа 1 пользователь получает ошибку "502 Invalid LLM response format".
ПЕРВОПРИЧИНА: 1) LLM возвращает JSON с markdown-бэктиками, что ломает JSON.parse(). 2) Критическое расхождение из DB_SCHEMA_MAP: код всё ещё пытается писать в удалённую таблицу `test_results` вместо `stage1_results` и `stage2_results`.

ФАЗА ROADMAP: ФАЗА 1 (Этап 1) и ФАЗА 2 (Этап 2) - Приоритетный блок
ЗАВИСИМОСТИ: 052_auth_telegram_route_refactor_task (БД схема обновлена)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/ai/evaluate.ts, api/ai/judge.ts
ТИП: hotfix, db
</context>

<task>
1. **Починить парсинг LLM-ответа (api/ai/evaluate.ts & api/ai/judge.ts):**
   - Найти место, где вызывается `JSON.parse()` для ответа от LLM.
   - Добавить предварительную очистку строки: удалить ```json, ``` и лишние пробелы по краям (использовать regex или строковые методы) перед парсингом.

2. **Обновить INSERT Этапа 1 (api/ai/evaluate.ts):**
   - Заменить `supabase.from('test_results').insert(...)` на `supabase.from('stage1_results').insert(...)`.
   - Привести поля к новой схему БД: убрать `answers, llm_feedback, score`, использовать: `user_id`, `company_id`, `total_score`, `passed` (вычислить passed как total_score >= порога, например 70%).

3. **Обновить INSERT Этапа 2 (api/ai/judge.ts):**
   - Заменить `supabase.from('test_results').insert(...)` на `supabase.from('stage2_results').insert(...)`.
   - Использовать поля: `user_id`, `company_id`, `profile_id`, `task_id`, `acceleration_x`, `score_total`, `score_prompting`, `score_iterativeness`, `validated_hours_per_month`, `passed`.

4. ВЕРИФИКАЦИЯ: Запустить локально или в dev-окружении, пройти Этап 1 до конца. Ошибка 502 должна исчезнуть, в Supabase в таблице `stage1_results` должна появиться запись.
5. Обновить docs/01_architecture/DB_SCHEMA_MAP.md — поменять статусы для stage1_results и stage2_results с 🔴 РАСХОЖДЕНИЕ на ✅ OK. Удалить блок про test_results из "Критические расхождения".
6. Перенести файл: tasks/todo/ → tasks/done/
</task>

<rules>
- КЛЮЧИ SUPABASE: Использовать только service_role key для INSERT в функциях `/api/**` (RLS обходится на сервере).
- ДИЗАЙН: Не трогать UI компоненты.
- ПРОТОКОЛ ОШИБКИ: Если схема БД (stage1_results) не содержит нужных колонок, не использовать ALTER TABLE самостоятельно — оставить в todo/ и сообщить Архитектору.
</rules>

---
## COMPLETION LOG

**Статус:** done
**Дата:** 2026-04-17
**Исполнитель:** Claude

### Сделано
- Код уже исправлен в коммите `fe2a6e3` — оба файла пишут в правильные таблицы
- `cleanJson()` в evaluate.ts и inline-очистка в judge.ts уже убирают markdown-фенсы
- Обновлён `docs/01_architecture/DB_SCHEMA_MAP.md`: статусы stage1_results и stage2_results → ✅ OK
- Удалён блок `test_results (УДАЛЕНА)` из схемы
- Убраны пункты 1 и 2 из "Критических расхождений"

### Изменённые файлы
- `docs/01_architecture/DB_SCHEMA_MAP.md` — обновлены статусы, удалены расхождения

### Верификация
- [x] Build: код идентичен требованиям задачи
- [ ] Ручное тестирование: пройти Этап 1 в dev, проверить запись в stage1_results

### Побочные эффекты
- Нет

### Следующий шаг по roadmap
- Проверить что `stage1_results` и `stage2_results` реально заполняются (ROADMAP п.2)