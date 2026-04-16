# ATTE — Переменные окружения (Environment Variables)

Для работы проекта необходимо настроить следующие переменные в файле `.env` (локально) или в настройках Vercel (Production).

---

## 🏗 Настройка проекта

### 🔗 Supabase (Клиент и Сервер)
| Переменная | Описание | Где взять |
|------------|----------|-----------|
| `VITE_SUPABASE_URL` | URL проекта Supabase | Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Anon Public Key (для фронтенда) | Project Settings > API |
| `SUPABASE_URL` | Тот же URL (для Vercel Functions) | Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** Service Role Key (для API) | Project Settings > API |

### 🤖 AI (OpenRouter)
| Переменная | Описание | Где взять |
|------------|----------|-----------|
| `OPENROUTER_API_KEY` | API Ключ для доступа к моделям ИИ | openrouter.ai/keys |

### 📲 Telegram (Авторизация)
| Переменная | Описание | Где взять |
|------------|----------|-----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота для валидации initData | @BotFather |

---

## 🛠 Локальная разработка

1.  Скопируйте `.env.example` в `.env`.
2.  Заполните все значения.
3.  Для тестирования API-функций используйте `npx vercel dev`.

---
*Предупреждение: Никогда не коммитьте файл .env в репозиторий. Он уже добавлен в .gitignore.*
