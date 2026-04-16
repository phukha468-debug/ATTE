# ФАЙЛОВАЯ СТРУКТУРА ПРОЕКТА 66ai

> Версия 3.0 | Обновлено: 2026-04-16

```
66ai/
│
├── 00_project/                          # Управление проектом
│   ├── METHODOLOGY_V3.md                # Главный документ — методология (точка входа)
│   ├── FILE_STRUCTURE.md                # Этот файл — карта проекта
│   ├── CHANGELOG.md                     # История изменений по версиям
│   └── ROADMAP.md                       # Дорожная карта развития продукта
│
├── 01_architecture/                     # Архитектурные решения
│   ├── STAGE1_ARCHITECTURE.md           # Архитектура Этапа 1 (Telegram-бот)
│   ├── STAGE2_ARCHITECTURE.md           # Архитектура Этапа 2 (Симулятор, Dual-AI)
│   └── STAGE3_ARCHITECTURE.md           # Архитектура Этапа 3 (Платформа)
│
├── 02_tests/                            # Всё, что видит/проходит сотрудник
│   │
│   ├── stage1/                          # Этап 1: Карта рутины
│   │   └── STAGE1_QUESTIONS.md          # Банк вопросов (все домены A-F)
│   │
│   ├── stage2/                          # Этап 2: Симулятор
│   │   ├── STAGE2_TASKS.md              # Сводный документ заданий (обзор всех профилей)
│   │   │
│   │   ├── profiles/                    # Экспертные профили должностей
│   │   │   ├── PROFILE_SALES_B2B.md     # ✅ Продажи B2B (золотой эталон)
│   │   │   ├── PROFILE_SALES_B2C.md     # ⬜ Продажи B2C
│   │   │   ├── PROFILE_ACCOUNT_MGR.md   # ⬜ Аккаунт-менеджер
│   │   │   ├── PROFILE_MARKETING.md     # 🔜 Маркетолог / digital
│   │   │   ├── PROFILE_CONTENT.md       # ⬜ Контент-менеджер
│   │   │   ├── PROFILE_SMM.md           # ⬜ SMM-специалист
│   │   │   ├── PROFILE_SEO.md           # ⬜ SEO-специалист
│   │   │   ├── PROFILE_HR.md            # 🔜 HR-менеджер / рекрутер
│   │   │   ├── PROFILE_HR_GENERAL.md    # ⬜ HR-generalist
│   │   │   ├── PROFILE_ACCOUNTING.md    # ⬜ Бухгалтер
│   │   │   ├── PROFILE_FINANCE.md       # ⬜ Финансовый аналитик
│   │   │   ├── PROFILE_SUPPORT.md       # ⬜ Специалист поддержки
│   │   │   ├── PROFILE_CLAIMS.md        # ⬜ Менеджер по рекламациям
│   │   │   ├── PROFILE_OFFICE.md        # ⬜ Офис-менеджер
│   │   │   ├── PROFILE_OPERATIONS.md    # ⬜ Операционный менеджер
│   │   │   ├── PROFILE_LEGAL.md         # ⬜ Юрист
│   │   │   ├── PROFILE_PROCUREMENT.md   # ⬜ Менеджер по закупкам
│   │   │   ├── PROFILE_IT_SUPPORT.md    # ⬜ Сисадмин / IT-поддержка
│   │   │   ├── PROFILE_DATA_ANALYST.md  # ⬜ Аналитик данных / BI
│   │   │   └── PROFILE_PROJECT_MGR.md   # ⬜ Проектный менеджер
│   │   │
│   │   └── tasks/                       # Пулы заданий для Sandbox
│   │       ├── TASKS_SALES_B2B.md       # ✅ 7 заданий (2 баз + 3 средн + 2 продв)
│   │       ├── TASKS_MARKETING.md       # 🔜
│   │       ├── TASKS_HR.md              # 🔜
│   │       └── ...                      # По одному на каждый профиль
│   │
│   └── stage3/                          # Этап 3: Микро-проект
│       ├── STAGE3_TEMPLATE.md           # Шаблон микро-проекта
│       ├── STAGE3_GUIDE.md              # Гайд для сотрудника
│       └── examples/                    # Примеры заполненных проектов
│           ├── EXAMPLE_SEO_AUDIT.md
│           ├── EXAMPLE_KP_TEMPLATE.md
│           └── EXAMPLE_FAQ_BASE.md
│
├── 03_skills/                           # Скиллы для LLM (системные промпты)
│   ├── LLM_JUDGE_SKILL.md              # Judge v2: все режимы (Этап 1 + 2 + 3)
│   ├── SKILL_JUDGE_CORE.md             # Core Skill Judge (5 измерений, Этап 2)
│   └── SKILL_SANDBOX_ASSISTANT.md      # Системный промпт ИИ-Ассистента в Sandbox
│
├── 04_reports/                          # Шаблоны и примеры отчётов
│   ├── templates/                       # Шаблоны для генерации
│   │   ├── TPL_REPORT_EMPLOYEE.md       # Шаблон отчёта сотрудника
│   │   ├── TPL_REPORT_MANAGER.md        # Шаблон отчёта руководителя
│   │   └── TPL_REPORT_COMPANY.md        # Шаблон сводного отчёта
│   │
│   └── examples/                        # Примеры заполненных отчётов
│       ├── REPORT_EMPLOYEE_EXAMPLE.md
│       ├── REPORT_MANAGER_EXAMPLE.md
│       └── REPORT_COMPANY_EXAMPLE.md
│
├── 05_sales/                            # Продажи и маркетинг
│   ├── PRICING.md                       # Прайс-лист
│   ├── CALCULATOR.html                  # Калькулятор стоимости (интерактивный)
│   ├── SAMPLE_PACKAGE.md                # Демо-пакет для клиента
│   ├── PITCH_DECK.md                    # Презентация для продажи
│   └── OBJECTION_HANDLING.md            # Ответы на возражения клиентов
│
├── 06_onboarding/                       # Материалы запуска
│   ├── ONBOARDING_STANDARD.md           # Гайд для Standard (видео + инструкция)
│   ├── ONBOARDING_PREMIUM.md            # Сценарий созвона для Premium
│   └── ADMIN_SETUP_GUIDE.md             # Настройка проекта (профили, сроки)
│
├── 07_training/                         # Обучающие модули (для грейда 1-2)
│   ├── MODULE_PROMPTING_BASICS.md       # Основы промптинга (4 часа)
│   ├── MODULE_AI_FOR_SALES.md           # ИИ для продажников
│   ├── MODULE_AI_FOR_MARKETING.md       # ИИ для маркетологов
│   └── MODULE_AI_FOR_HR.md              # ИИ для HR
│
└── 08_calibration/                      # Стресс-тесты и калибровка
    ├── CALIBRATION_PLAN.md              # План 10 бесплатных компаний
    ├── INTERVIEW_TEMPLATE.md            # Шаблон интервью после теста
    └── logs/                            # Логи стресс-тестов
        ├── company_01/
        ├── company_02/
        └── ...
```

## ПРИНЦИПЫ ОРГАНИЗАЦИИ

**Нумерация папок (00-08):** порядок = логика проекта. 00 — мета, 01 — архитектура, 02 — контент тестов, 03 — скиллы LLM, 04 — отчёты, 05 — продажи, 06 — запуск, 07 — обучение, 08 — калибровка.

**Точка входа:** `00_project/METHODOLOGY_V3.md` — главный документ, от которого ведут ссылки на все остальные.

**Профили и задания рядом:** оба в `02_tests/stage2/` — потому что они неразрывно связаны и разрабатываются парами.

**Скиллы отдельно от тестов:** скиллы — это системные промпты для LLM, техническая начинка. Тесты — это контент для сотрудников. Разные аудитории, разные папки.

**Отчёты: шаблоны + примеры:** шаблон — это инструкция для генератора. Пример — это заполненный образец для клиента. Разные назначения.

## СТАТУС ФАЙЛОВ

| Статус | Кол-во | Описание |
|--------|--------|----------|
| ✅ Готов | 8 | METHODOLOGY_V3, FILE_STRUCTURE, STAGE1_QUESTIONS, PROFILE_SALES_B2B, TASKS_SALES_B2B, SKILL_JUDGE_CORE, STAGE2_ARCHITECTURE, PRICING |
| 🔄 Обновляется | 5 | LLM_JUDGE_SKILL, REPORT_EMPLOYEE, REPORT_MANAGER, STAGE2_TASKS, STAGE3_TEMPLATE |
| 🔜 Следующий | 4 | PROFILE_MARKETING, TASKS_MARKETING, PROFILE_HR, TASKS_HR |
| ⬜ Планируется | ~30 | Остальные профили, обучающие модули, онбординг, калибровка |

*66ai File Structure v1.0 | 2026-04-16*
