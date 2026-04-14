# TEMPLATE AUDIT — ATTE (66ai Attestation)

**Дата аудита:** 14 апреля 2026 г.  
**Исполнитель:** Qwen Code  
**Ревью шаблона:** Telegram Mini App для AI competency attestation

---

## 1. Стек и Версии

| Категория | Технология | Версия | Примечание |
|-----------|------------|--------|------------|
| **Фреймворк** | **Vite** (сборщик) + **React** | Vite 6.2.0, React 19.0.0 | SPA-приложение, НЕ Next.js |
| **Язык** | **TypeScript** | ~5.8.2 | Полная типизация (`tsconfig.json`, `jsx: "react-jsx"`) |
| **UI-библиотека** | **Tailwind CSS v4** + **shadcn/ui** | tailwindcss 4.1.14, shadcn 4.2.0 | Используется стиль `base-nova`, CSS-переменные через OKLCH |
| **Компоненты UI** | shadcn/ui (ручной импорт) | — | `components/ui/`: avatar, badge, button, card, progress, skeleton, tabs |
| **Анимации** | **Motion (Framer Motion)** | motion 12.23.24 | `import { motion, AnimatePresence } from 'motion/react'` |
| **Иконки** | **Lucide React** | lucide-react 0.546.0 | `import { Home, Brain, Trophy, ... } from 'lucide-react'` |
| **Графики** | **Recharts** | recharts 3.8.1 | В зависимостях, но в коде пока не используется |
| **Шрифты** | @fontsource-variable/geist + Google Fonts (Inter, Playfair Display) | — | Geist через npm, Inter/Playfair через `@import` в CSS |
| **Сервер** | Express (опционально) | express 4.21.2 | В зависимостях, но в `src/` серверного кода нет |
| **Утилиты** | class-variance-authority, clsx, tailwind-merge | — | Функция `cn()` в `@/lib/utils` |

**Команды npm:**
- `npm run dev` — запуск на порту 3000 (`vite --port=3000 --host=0.0.0.0`)
- `npm run build` — продакшн-сборка
- `npm run preview` — превью сборки
- `npm run lint` — проверка типов (`tsc --noEmit`)

---

## 2. Интеграция с Telegram

**Подключение:** Telegram Web App SDK подключен через **скрипт в `index.html`**:

```html
<!-- index.html, строка 6 -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

**Использование в коде:**

| Файл | Как используется |
|------|-----------------|
| `src/lib/supabase.ts` | Функция `getTelegramUser()` получает данные текущего пользователя через `(window as any).Telegram?.WebApp.initDataUnsafe.user` |
| `src/pages/Pricing.tsx` | Прямой доступ к `(window as any).Telegram?.WebApp` (предположительно для открытия Telegram-бота) |

**Библиотеки @twa-dev/sdk или @telegram-apps/sdk:** **НЕ используются**. Интеграция осуществляется напрямую через глобальный объект `window.Telegram.WebApp`.

**Инициализация:** Явной инициализации (`WebApp.ready()`, `WebApp.expand()`, `WebApp.setHeaderColor()` и т.д.) в коде **не обнаружено**. Это может быть упущением — рекомендуется добавить `window.Telegram.WebApp.ready()` в `main.tsx`.

---

## 3. Архитектура Роутинга

**Тип:** **React Router DOM v7** (`react-router-dom: ^7.14.1`) — компонентный роутинг через `<BrowserRouter>`.

**Структура (App Router-подобная через Layout + Outlet):**

```
<App.tsx>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />          → /
        <Route path="tests" element={<Tests />} />   → /tests
        <Route path="reports" element={<Reports />} /> → /reports
        <Route path="pricing" element={<Pricing />} /> → /pricing
        <Route path="profile" element={<Profile />} /> → /profile
      </Route>
    </Routes>
  </BrowserRouter>
```

**Layout (`src/components/Layout.tsx`):**
- Оборачивает все страницы через `<Outlet />`
- Содержит `<BottomNav />` — фиксированную нижнюю навигацию
- Анимация переходов через `<AnimatePresence mode="wait">` + `motion.div`

**Навигация (`src/components/BottomNav.tsx`):**
- 5 вкладок: Главная, Тесты, Отчеты, Тарифы, Профиль
- Использует `<NavLink>` с `isActive` для стилизации активной вкладки

**Структура папок `src/`:**
```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── ui/          # shadcn/ui примитивы (7 файлов)
│   ├── BottomNav.tsx
│   ├── Layout.tsx
│   └── TestRunner.tsx
├── pages/
│   ├── Home.tsx
│   ├── Tests.tsx
│   ├── Reports.tsx
│   ├── Pricing.tsx
│   └── Profile.tsx
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## 4. Стейт-менеджмент и API

### Стейт-менеджмент

**Текущее решение:** **Локальный `useState`** на уровне компонентов.

| Файл | Состояние |
|------|-----------|
| `src/pages/Tests.tsx` | `useState<number | null>` для `activeStage` и `testResult` |
| `src/components/TestRunner.tsx` | `useState` для `questions`, `currentIdx`, `selectedIdx`, `isAnswered`, `score`, `loading` |

**Глобальный стейт (Context/Redux/Zustand):** **НЕ обнаружен**. Нет `createContext`, `useContext`, `Provider`, `Store`, `zustand`, `redux` в коде.

### API-запросы

| Сервис | Метод | Файл |
|--------|-------|------|
| **Gemini AI** | `@google/genai` SDK (серверный вызов через `ai.models.generateContent`) | `src/lib/gemini.ts` |
| **Supabase** | `@supabase/supabase-js` клиент (`createClient`) | `src/lib/supabase.ts` |

**Gemini AI (`src/lib/gemini.ts`):**
- Использует `GoogleGenAI` с API-ключом из `process.env.GEMINI_API_KEY`
- Два метода:
  - `generateTestQuestions(category, jobTitle)` — генерация вопросов для теста (модель: `gemini-3-flash-preview`)
  - `evaluateMicroProject(projectDescription, jobTitle)` — оценка микро-проекта (модель: `gemini-3.1-pro-preview`)
- Возвращает JSON через `responseMimeType: "application/json"` + `responseSchema`

**Supabase (`src/lib/supabase.ts`):**
- Клиент создаётся из env-переменных `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`
- Экспортируется объект `supabase` для прямого использования
- Вспомогательная функция `getTelegramUser()` для получения данных пользователя из Telegram WebApp

**HTTP-клиенты (axios/fetch):** **НЕ обнаружены**. Все запрос через SDK.

---

## 5. База Данных / Auth

### База данных: **Supabase**

- Подключён `@supabase/supabase-js v2.103.0`
- Клиент инициализирован в `src/lib/supabase.ts`
- **Фактические запросы к БД в коде пока НЕ обнаружены** (нет вызовов `supabase.from().select()`, `supabase.auth.*` и т.д.)
- Переменные окружения (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) задаются через `.env.example`

### Авторизация: **Supabase Auth (предположительно) + Telegram WebApp**

- **Telegram WebApp** — основной источник идентификации пользователя через `initDataUnsafe.user`
- **Supabase Auth** — подключён через клиент, но явные вызовы `supabase.auth.signInWith...` или `supabase.auth.getSession()` **не обнаружены**
- **next-auth / Firebase Auth:** **НЕ используются**

### Типы данных (`src/types/index.ts`):

```typescript
interface UserProfile {
  id: string;
  telegram_id: number;
  full_name: string;
  job_title: string;
  department: string;
  grade: number;       // 1-5
  avatar_url?: string;
  created_at: string;
}

interface TestQuestion { ... }
interface AttestationResult { ... }
interface PaymentRecord { ... }
```

---

## Дополнительные наблюдения

### ✅ Сильные стороны
- Современный стек: React 19, Vite 6, Tailwind v4, TypeScript
- Красивый UI с анимация Motion и shadcn/ui компонентами
- Продуманная структура страниц (5 экранов для TMA)
- Gemini AI интеграция для генерации тестовых вопросов
- Supabase подключён для БД и авторизации
- Path aliases (`@/*` → `./src/*`) настроены корректно

### ⚠️ Потенциальные проблемы
1. **Нет инициализации Telegram WebApp** — `WebApp.ready()` не вызывается
2. **Supabase клиент создан, но не используется** — нет запросов к БД или auth
3. **Нет глобального стейт-менеджмента** — данные пользователя и результаты тестов не сохраняются между переходами
4. **Express в зависимостях, но нет серверного кода** — возможно, leftover из шаблона
5. **Recharts подключён, но не используется** — страница Reports не реализована (файл пустой или с заглушкой)
6. **Pages `Reports.tsx` и `Profile.tsx`** — не были проанализированы детально (предположительно заглушки)
7. **HMR отключён при `DISABLE_HMR !== 'true'`** — конфиг содержит комментарий о AI Studio, может мешать локальной разработке
8. **Нет файла `docs/BOOT.md`** — инструкция ссылается на него, но он отсутствует

### 📋 Открытые вопросы
- Реализованы ли страницы `Reports.tsx` и `Profile.tsx` полноценно?
- Планируется ли бэкенд на Express или это артефакт?
- Как будет происходить реальная авторизация через Supabase + Telegram?
- Где хранятся результаты аттестации (таблицы Supabase ещё не созданы)?
