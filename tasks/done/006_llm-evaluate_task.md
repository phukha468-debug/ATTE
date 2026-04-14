📋 Прочитай docs/BOOT.md и docs/RULES.md перед выполнением.

<context>
UI тестирования готов. База данных содержит реальные вопросы. Нам нужно реализовать "мозг" системы — LLM-Judge.
При завершении теста фронтенд должен отправить собранные ответы на защищенный эндпоинт Vercel. Серверная функция валидирует сессию, формирует промпт для OpenRouter и использует модель Claude 3.7 Sonnet для оценки.

ЗАВИСИМОСТИ: 005_test-engine-and-real-data_task (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: 
- api/ai/evaluate.ts (создать Vercel Function)
- src/lib/api.ts (добавить submit функцию)
- src/pages/Tests.tsx (интегрировать отправку)
- package.json
ТИП: feat, backend, ai
</context>

<task>
1. **Установка:** Установи официальный SDK `openai` (он идеально работает с OpenRouter). `npm install openai`.
2. **Vercel Function (`api/ai/evaluate.ts`):**
   - Эндпоинт принимает POST с объектом `answers` (Record<string, string>).
   - Извлеки JWT токен из `Authorization: Bearer <token>`, проверь через `supabase.auth.getUser()`, получи `user_id`.
   - Запроси список реальных вопросов из БД (через `SUPABASE_SERVICE_ROLE_KEY`), чтобы сопоставить ID ответов с текстом вопросов.
   - Сформируй промпт. Системный: "Ты — строгий HR-эксперт по ИИ-навыкам. Оцени ответы сотрудника. Выдай СТРОГО валидный JSON без Markdown-оборачивания, без приветствий. Формат: {\"score\": <0-100>, \"feedback\": \"<анализ и рекомендации>\"}".
   - Вызови OpenRouter API (`baseURL: "https://openrouter.ai/api/v1"`).
   - Модель: строго `"anthropic/claude-3.7-sonnet"`.
   - Сохрани в `test_results`: `user_id`, `company_id` (получи из профиля юзера), `answers` (оригинал), `llm_feedback` (распарсенный JSON от ИИ), `score`, `is_completed: true`. (Используй Service Role Key).
3. **Frontend Интеграция (`src/lib/api.ts` & `Tests.tsx`):**
   - Напиши `submitTestResults(answers)`. Обязательно передавай токен сессии (получи через `supabase.auth.getSession()`).
   - В `Tests.tsx` при завершении теста показывай UI: "Claude 3.7 Sonnet анализирует ваши ответы...".
   - Перехвати ответ от API и покажи экран результатов (Балл и Текстовый фидбек).
4. ВЕРИФИКАЦИЯ: 
   - Запусти приложение. Пройди тест до конца.
   - Убедись, что данные уходят в `/api/ai/evaluate`, функция не падает, а в БД появляется запись.
5. Заполни COMPLETION LOG.
6. Перенеси файл в `tasks/done/`.
</task>

<rules>
- CLAUDE JSON QUIRK: Обязательно делай `.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '')` на ответ от OpenRouter перед `JSON.parse()`, так как Claude иногда игнорирует системные промпты и оборачивает JSON в маркдаун.
- БЕЗОПАСНОСТЬ: Фронтенд НЕ должен напрямую писать в `test_results`.
- Исполнитель: Claude Code (он лучше всех напишет промпт для самого себя).
</rules>

---

## COMPLETION LOG
**Статус:** _pending_
**Дата завершения:** ___
**Исполнитель:** ___

### Сделано
- [ ] Vercel функция оценки создана (Claude 3.7 Sonnet)
- [ ] Интеграция с OpenRouter работает
- [ ] Очистка JSON от маркдауна реализована
- [ ] Результаты сохраняются в БД
- [ ] Фронтенд отображает финальный балл

### Верификация
- Тест оценивается ИИ: [ ]
- Запись в БД есть: [ ]