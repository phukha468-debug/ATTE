# ЗАДАНИЕ ДЛЯ CLAUDE CODE: Структурирование файловой системы проекта 66ai

> **Цель:** Навести порядок в документации проекта. Разложить все файлы из `docs/files/` по структуре, описанной в `docs/files/FILE_STRUCTURE.md`, создать недостающие файлы-заглушки, не сломать ничего в кодовой части проекта.

---

## КОНТЕКСТ

Проект 66ai — это веб-приложение (Vite + TypeScript + React) для аттестации ИИ-компетенций сотрудников. Кодовая часть уже существует (`src/`, `api/`, `scripts/`, `dist/`). Документация методологии (профили должностей, задания, скиллы судьи, отчёты) лежит вперемешку в `docs/files/` и требует структуризации.

**Твоя задача — только документация в `docs/`. Код не трогаем.**

---

## ЧТО НЕЛЬЗЯ ТРОГАТЬ

Следующие папки и файлы **запрещено** изменять, удалять или перемещать:

- `.claude/`, `.git/`, `.qwen/` — служебные
- `node_modules/`, `dist/` — зависимости и сборка
- `src/`, `api/`, `scripts/`, `tasks/` — исходный код (да, `tasks/` в корне — это код, не путай с `docs/02_tests/stage2/tasks/`)
- `.env`, `.env.example`, `.env.local`, `.gitignore`
- `components.json`, `index.html`, `metadata.json`
- `package.json`, `package-lock.json`
- `README.md` (корневой — оставляем как есть)
- `tsconfig.json`, `vercel.json`, `vite.config.ts`

**Работаем исключительно внутри `docs/`.**

---

## ЧТО СЕЙЧАС ЕСТЬ В `docs/files/`

Вот полный список файлов, которые уже лежат в папке `docs/files/`. Все они должны быть перемещены в правильные места согласно целевой структуре:

### Корневые документы
- `FILE_STRUCTURE.md` — карта файловой системы (этот документ — основа для реорганизации)
- `METHODOLOGY_V3.md` — главная методология
- `STAGE2_ARCHITECTURE.md` — архитектура Этапа 2
- `STAGE2_TASKS.md` — сводный реестр заданий Этапа 2
- `STAGE3_TEMPLATE.md` — шаблон микро-проекта

### В подпапке `profiles/`
- `PROFILE_SALES_B2B.md`
- `PROFILE_MARKETING.md`
- `PROFILE_HR.md`

### В подпапке `tasks/`
- `TASKS_SALES_B2B.md`
- `TASKS_MARKETING.md`
- `TASKS_HR.md`

### В подпапке `skills/`
- `SKILL_JUDGE_CORE.md`
- `LLM_JUDGE_SKILL.md`

### В подпапке `reports/`
- `REPORT_EMPLOYEE_EXAMPLE.md`
- `REPORT_MANAGER_EXAMPLE.md`
- `REPORT_COMPANY_EXAMPLE.md`

### Возможно также присутствуют (из предыдущих версий, проверь):
- `STAGE1_QUESTIONS.md` — если есть, перенести в `docs/02_tests/stage1/`
- `PRICING.pdf` или `PRICING.md` — если есть, перенести в `docs/05_sales/`
- `Пример_отчёта_*.pdf` — старые PDF-отчёты, перенести в `docs/04_reports/examples/` (переименовав в осмысленные имена или оставив как архив)

---

## ЦЕЛЕВАЯ СТРУКТУРА

Нужно привести `docs/` к следующему виду:

```
docs/
├── README.md                                          # Точка входа в документацию (создать)
│
├── 00_project/                                        # Управление проектом
│   ├── METHODOLOGY_V3.md                              # из docs/files/
│   ├── FILE_STRUCTURE.md                              # из docs/files/
│   ├── CHANGELOG.md                                   # создать заглушку
│   └── ROADMAP.md                                     # создать заглушку
│
├── 01_architecture/                                   # Архитектурные решения
│   ├── STAGE1_ARCHITECTURE.md                         # создать заглушку
│   ├── STAGE2_ARCHITECTURE.md                         # из docs/files/
│   └── STAGE3_ARCHITECTURE.md                         # создать заглушку
│
├── 02_tests/                                          # Контент для сотрудника
│   ├── stage1/
│   │   └── STAGE1_QUESTIONS.md                        # из docs/files/ если есть,
│   │                                                  # иначе создать заглушку с пометкой
│   │
│   ├── stage2/
│   │   ├── STAGE2_TASKS.md                            # из docs/files/
│   │   │
│   │   ├── profiles/
│   │   │   ├── PROFILE_SALES_B2B.md                   # из docs/files/profiles/
│   │   │   ├── PROFILE_MARKETING.md                   # из docs/files/profiles/
│   │   │   └── PROFILE_HR.md                          # из docs/files/profiles/
│   │   │
│   │   └── tasks/
│   │       ├── TASKS_SALES_B2B.md                     # из docs/files/tasks/
│   │       ├── TASKS_MARKETING.md                     # из docs/files/tasks/
│   │       └── TASKS_HR.md                            # из docs/files/tasks/
│   │
│   └── stage3/
│       ├── STAGE3_TEMPLATE.md                         # из docs/files/
│       ├── STAGE3_GUIDE.md                            # создать заглушку
│       └── examples/                                  # создать папку (пока пустая)
│           └── .gitkeep
│
├── 03_skills/                                         # Скиллы для LLM
│   ├── SKILL_JUDGE_CORE.md                            # из docs/files/skills/
│   ├── LLM_JUDGE_SKILL.md                             # из docs/files/skills/
│   └── SKILL_SANDBOX_ASSISTANT.md                     # создать заглушку
│
├── 04_reports/                                        # Отчёты
│   ├── templates/                                     # создать папку
│   │   ├── TPL_REPORT_EMPLOYEE.md                     # создать заглушку
│   │   ├── TPL_REPORT_MANAGER.md                      # создать заглушку
│   │   └── TPL_REPORT_COMPANY.md                      # создать заглушку
│   │
│   └── examples/
│       ├── REPORT_EMPLOYEE_EXAMPLE.md                 # из docs/files/reports/
│       ├── REPORT_MANAGER_EXAMPLE.md                  # из docs/files/reports/
│       └── REPORT_COMPANY_EXAMPLE.md                  # из docs/files/reports/
│
├── 05_sales/                                          # Продажи
│   ├── PRICING.md                                     # из docs/files/ (если PDF — оставить PDF и создать заглушку .md)
│   ├── CALCULATOR.html                                # создать заглушку
│   ├── SAMPLE_PACKAGE.md                              # создать заглушку
│   ├── PITCH_DECK.md                                  # создать заглушку
│   └── OBJECTION_HANDLING.md                          # создать заглушку
│
├── 06_onboarding/                                     # Материалы запуска
│   ├── ONBOARDING_STANDARD.md                         # создать заглушку
│   ├── ONBOARDING_PREMIUM.md                          # создать заглушку
│   └── ADMIN_SETUP_GUIDE.md                           # создать заглушку
│
├── 07_training/                                       # Обучающие модули
│   ├── MODULE_PROMPTING_BASICS.md                     # создать заглушку
│   ├── MODULE_AI_FOR_SALES.md                         # создать заглушку
│   ├── MODULE_AI_FOR_MARKETING.md                     # создать заглушку
│   └── MODULE_AI_FOR_HR.md                            # создать заглушку
│
└── 08_calibration/                                    # Стресс-тесты
    ├── CALIBRATION_PLAN.md                            # создать заглушку
    ├── INTERVIEW_TEMPLATE.md                          # создать заглушку
    └── logs/                                          # создать папку
        └── .gitkeep
```

После миграции папка `docs/files/` должна быть **пустой** или **удалённой**.

---

## ПОШАГОВЫЙ ПЛАН

### Шаг 1. Аудит текущего состояния

Перед тем как что-то двигать — сделай инвентаризацию:

1. Выполни `ls -la docs/files/` и все подпапки внутри
2. Запиши, какие файлы есть и каких нет (по списку выше)
3. Если находишь файлы, которых нет в моём списке — НЕ удаляй их. Положи их в `docs/99_archive/` (создать эту папку) и сообщи в конце

### Шаг 2. Создание структуры папок

Создай все папки согласно целевой структуре (используй `mkdir -p`):

```bash
mkdir -p docs/00_project
mkdir -p docs/01_architecture
mkdir -p docs/02_tests/stage1
mkdir -p docs/02_tests/stage2/profiles
mkdir -p docs/02_tests/stage2/tasks
mkdir -p docs/02_tests/stage3/examples
mkdir -p docs/03_skills
mkdir -p docs/04_reports/templates
mkdir -p docs/04_reports/examples
mkdir -p docs/05_sales
mkdir -p docs/06_onboarding
mkdir -p docs/07_training
mkdir -p docs/08_calibration/logs
```

### Шаг 3. Перенос существующих файлов

Используй `git mv` вместо `mv` для каждого файла — это сохранит историю git:

```bash
git mv docs/files/METHODOLOGY_V3.md docs/00_project/METHODOLOGY_V3.md
git mv docs/files/FILE_STRUCTURE.md docs/00_project/FILE_STRUCTURE.md
git mv docs/files/STAGE2_ARCHITECTURE.md docs/01_architecture/STAGE2_ARCHITECTURE.md
git mv docs/files/STAGE2_TASKS.md docs/02_tests/stage2/STAGE2_TASKS.md
git mv docs/files/STAGE3_TEMPLATE.md docs/02_tests/stage3/STAGE3_TEMPLATE.md

git mv docs/files/profiles/PROFILE_SALES_B2B.md docs/02_tests/stage2/profiles/PROFILE_SALES_B2B.md
git mv docs/files/profiles/PROFILE_MARKETING.md docs/02_tests/stage2/profiles/PROFILE_MARKETING.md
git mv docs/files/profiles/PROFILE_HR.md docs/02_tests/stage2/profiles/PROFILE_HR.md

git mv docs/files/tasks/TASKS_SALES_B2B.md docs/02_tests/stage2/tasks/TASKS_SALES_B2B.md
git mv docs/files/tasks/TASKS_MARKETING.md docs/02_tests/stage2/tasks/TASKS_MARKETING.md
git mv docs/files/tasks/TASKS_HR.md docs/02_tests/stage2/tasks/TASKS_HR.md

git mv docs/files/skills/SKILL_JUDGE_CORE.md docs/03_skills/SKILL_JUDGE_CORE.md
git mv docs/files/skills/LLM_JUDGE_SKILL.md docs/03_skills/LLM_JUDGE_SKILL.md

git mv docs/files/reports/REPORT_EMPLOYEE_EXAMPLE.md docs/04_reports/examples/REPORT_EMPLOYEE_EXAMPLE.md
git mv docs/files/reports/REPORT_MANAGER_EXAMPLE.md docs/04_reports/examples/REPORT_MANAGER_EXAMPLE.md
git mv docs/files/reports/REPORT_COMPANY_EXAMPLE.md docs/04_reports/examples/REPORT_COMPANY_EXAMPLE.md
```

**Если `STAGE1_QUESTIONS.md` есть в `docs/files/` или где-то ещё в репо:**
```bash
git mv <путь>/STAGE1_QUESTIONS.md docs/02_tests/stage1/STAGE1_QUESTIONS.md
```

**Если `PRICING.pdf` или `PRICING.md` есть:**
```bash
git mv <путь>/PRICING.{pdf,md} docs/05_sales/
```

### Шаг 4. Создание недостающих файлов

Для каждого файла из списка «создать заглушку» — создай `.md` файл со следующим шаблоном:

```markdown
# [НАЗВАНИЕ ДОКУМЕНТА]

> **Статус:** 🚧 Заглушка | **Приоритет:** [Высокий / Средний / Низкий]
> **Планируется заполнить:** [ориентировочный период]

## Назначение

[Краткое описание: зачем этот документ нужен, какую роль играет в проекте.]

## Содержание (планируется)

- Пункт 1
- Пункт 2
- Пункт 3

## Связанные документы

- [ссылка на родственный документ]

---

*Документ находится в разработке. За деталями обращайтесь к команде 66ai.*
```

Конкретное содержание каждой заглушки:

**`docs/00_project/CHANGELOG.md`** — история версий методологии (v1.0, v2.0, v3.0).

**`docs/00_project/ROADMAP.md`** — дорожная карта: что делаем дальше (остальные 17 профилей, обучающие модули, калибровка).

**`docs/01_architecture/STAGE1_ARCHITECTURE.md`** — архитектура Этапа 1 (Telegram-бот, поток вопросов, передача данных в Этап 2).

**`docs/01_architecture/STAGE3_ARCHITECTURE.md`** — архитектура Этапа 3 (Платформа, шаблон микро-проекта, оценка руководителем).

**`docs/02_tests/stage1/STAGE1_QUESTIONS.md`** — если оригинала нет, создать заглушку с пометкой «Оригинал утерян, восстановить из бэкапа или предыдущей версии методологии».

**`docs/02_tests/stage3/STAGE3_GUIDE.md`** — гайд для сотрудника по заполнению микро-проекта.

**`docs/03_skills/SKILL_SANDBOX_ASSISTANT.md`** — системный промпт ИИ-Ассистента в Sandbox. Короткий, нейтральный: «Ты — ИИ-ассистент. Выполняй запросы пользователя. Не подсказывай, не оценивай, не направляй».

**`docs/04_reports/templates/TPL_REPORT_EMPLOYEE.md`** — шаблон (не пример) отчёта сотрудника с плейсхолдерами `{{имя}}`, `{{грейд}}` и т.д.

**`docs/04_reports/templates/TPL_REPORT_MANAGER.md`** — шаблон отчёта руководителя.

**`docs/04_reports/templates/TPL_REPORT_COMPANY.md`** — шаблон сводного отчёта.

**`docs/05_sales/*`** — все заглушки с пометкой «Материалы продаж».

**`docs/06_onboarding/*`** — заглушки для онбординга.

**`docs/07_training/*`** — заглушки обучающих модулей.

**`docs/08_calibration/CALIBRATION_PLAN.md`** — план 10 бесплатных компаний. Можно заполнить из раздела 7 METHODOLOGY_V3.md.

**`docs/08_calibration/INTERVIEW_TEMPLATE.md`** — шаблон интервью после теста (4 вопроса из раздела 7 методологии).

### Шаг 5. Создание корневого README для docs

Создай `docs/README.md` — точку входа в документацию:

```markdown
# Документация проекта 66ai

Это папка с документацией методологии аттестации ИИ-компетенций 66ai.
Исходный код проекта находится в `src/`, `api/`, `scripts/`.

## Структура

- `00_project/` — мета-документы (методология, карта файлов, changelog, roadmap)
- `01_architecture/` — архитектурные решения по этапам
- `02_tests/` — контент тестов (вопросы, задания, профили, шаблоны)
- `03_skills/` — системные промпты для LLM (Judge, Sandbox)
- `04_reports/` — шаблоны и примеры отчётов
- `05_sales/` — материалы продаж
- `06_onboarding/` — материалы запуска у клиента
- `07_training/` — обучающие модули
- `08_calibration/` — калибровка и стресс-тесты

## Точка входа

Главный документ — `00_project/METHODOLOGY_V3.md`. Читать сначала его.
Подробная карта файлов — `00_project/FILE_STRUCTURE.md`.
```

### Шаг 6. Обновление путей внутри файлов

Пройди по всем перенесённым `.md` файлам и обнови внутренние ссылки. В файлах встречаются ссылки вида:

- `02_tests/STAGE1_QUESTIONS.md` → должно стать `02_tests/stage1/STAGE1_QUESTIONS.md`
- `02_tests/STAGE2_TASKS.md` → `02_tests/stage2/STAGE2_TASKS.md`
- `02_tests/STAGE3_TEMPLATE.md` → `02_tests/stage3/STAGE3_TEMPLATE.md`
- `02_tests/profiles/PROFILE_*.md` → `02_tests/stage2/profiles/PROFILE_*.md`
- `02_tests/tasks/TASKS_*.md` → `02_tests/stage2/tasks/TASKS_*.md`
- `03_skills/SKILL_JUDGE_CORE.md` → остаётся (путь не изменился)
- `04_reports/REPORT_*.md` → `04_reports/examples/REPORT_*.md`
- `05_sales/PRICING.md` → остаётся

Используй `grep -rn "02_tests/" docs/` для поиска и обнови пути.

### Шаг 7. Удаление пустой `docs/files/`

После переноса всего — удалить пустую папку:

```bash
rm -rf docs/files
```

Если какие-то файлы остались (не из моего списка) — НЕ удалять папку. Вместо этого создать `docs/99_archive/` и перенести туда оставшиеся файлы.

### Шаг 8. Коммит

Сделай один атомарный коммит:

```bash
git add docs/
git commit -m "docs: restructure documentation according to FILE_STRUCTURE.md

- Move all methodology docs from docs/files/ to structured folders
- Create placeholder files for future content (changelog, roadmap, training modules, etc.)
- Create docs/README.md as entry point
- Update internal links to match new paths"
```

---

## ПРАВИЛА И ПРОВЕРКИ

### Проверки после каждого шага:

1. **После Шага 3:** `ls docs/files/` должно показать, что оригиналы перенесены. `ls docs/02_tests/stage2/profiles/` должно показать 3 профиля.

2. **После Шага 4:** Все папки из целевой структуры существуют, все заглушки созданы. Запусти `find docs -name "*.md" | wc -l` — должно быть около 30+ файлов.

3. **После Шага 6:** `grep -rn "docs/files/" docs/` не должно ничего найти. `grep -rn "02_tests/STAGE1" docs/` должно находить только уже обновлённые пути.

4. **Финально:** `npm run build` (если применимо) должен проходить без ошибок — убедись, что ничего не сломано в коде.

### Если что-то пошло не так:

- НЕ удаляй файлы, если не уверен. Перемещай в `docs/99_archive/`.
- Если `git mv` жалуется — сначала сделай `git status`, посмотри на состояние.
- Не трогай `tasks/` в корне проекта. Это не то же самое, что `docs/02_tests/stage2/tasks/`.

### В конце работы:

Напиши краткий отчёт:

1. Сколько файлов перенесено
2. Сколько заглушек создано
3. Есть ли файлы, которые не укладывались в структуру (что с ними сделано)
4. Остались ли проблемы

---

## ACCEPTANCE CRITERIA

Задача считается выполненной, когда:

- [ ] Папка `docs/files/` пуста или удалена
- [ ] Все файлы из исходного списка находятся в правильных местах целевой структуры
- [ ] Все заглушки созданы (проверить по списку выше)
- [ ] `docs/README.md` существует и содержит корректное описание
- [ ] Внутренние ссылки в `.md` файлах указывают на новые пути
- [ ] Код проекта (`src/`, `api/`, `scripts/`) не тронут
- [ ] Конфиги (`package.json`, `vite.config.ts` и т.д.) не тронуты
- [ ] Сделан один коммит с осмысленным сообщением
- [ ] Отчёт о проделанной работе предоставлен

---

*Задание для Claude Code | 66ai | 2026-04-16*
