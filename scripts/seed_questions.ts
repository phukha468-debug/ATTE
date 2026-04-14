/**
 * Seed скрипт для загрузки вопросов в таблицу `questions` Supabase.
 *
 * Запуск: npm run seed
 * Требует: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local
 *
 * Использует Service Role Key (обход RLS) для INSERT.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const questions = [
  // ── ROUTINE (идентификация рутинных задач) ──
  {
    category: 'routine',
    text: 'Какой из следующих рабочих процессов НАИБОЛЕЕ подходит для автоматизации с помощью ИИ?',
    type: 'mcq',
    options: [
      { text: 'Проведение стратегических переговоров с партнёрами', is_correct: false },
      { text: 'Обработка входящих заявок и сортировка по категориям', is_correct: true },
      { text: 'Утверждение бюджета совета директоров', is_correct: false },
      { text: 'Креативный брейншторминг новой продуктовой линейки', is_correct: false },
    ],
  },
  {
    category: 'routine',
    text: 'Вы анализируете рабочий день отдела поддержки. 60% времени уходит на ответы на одинаковые вопросы. Какое решение на базе ИИ предложите?',
    type: 'mcq',
    options: [
      { text: 'Нанять больше операторов', is_correct: false },
      { text: 'Запретить сотрудникам отвлекаться', is_correct: false },
      { text: 'Внедрить ИИ-чатбот для типовых вопросов с эскалацией на человека', is_correct: true },
      { text: 'Перестать отвечать на повторяющиеся вопросы', is_correct: false },
    ],
  },

  // ── PROMPTING (навыки формулирования промптов) ──
  {
    category: 'prompting',
    text: 'Какой промпт даст НАИБОЛЕЕ качественный результат при анализе отзывов клиентов?',
    type: 'mcq',
    options: [
      { text: '«Проанализируй отзывы»', is_correct: false },
      { text: '«Проанализируй 500 отзывов клиентов и выдели 5 главных тем с примерами цитат. Верни результат в виде таблицы: тема, кол-во упоминаний, sentiment (позитив/негатив), 2 цитаты»', is_correct: true },
      { text: '«Сделай что-нибудь с отзывами»', is_correct: false },
      { text: '«Прочитай отзывы и скажи что думаешь»', is_correct: false },
    ],
  },
  {
    category: 'prompting',
    text: 'Какой приём промпт-инжиниринга используется, когда вы просите ИИ «действовать как эксперт по маркетингу с 10-летним опытом»?',
    type: 'mcq',
    options: [
      { text: 'Chain-of-thought', is_correct: false },
      { text: 'Few-shot prompting', is_correct: false },
      { text: 'Role/persona assignment', is_correct: true },
      { text: 'Zero-shot classification', is_correct: false },
    ],
  },

  // ── LIMITATIONS (понимание ограничений ИИ) ──
  {
    category: 'limitations',
    text: 'Какое утверждение о больших языковых моделях (LLM) является ВЕРНЫМ?',
    type: 'mcq',
    options: [
      { text: 'LLM всегда даёт фактически точные ответы', is_correct: false },
      { text: 'LLM может «галлюцинировать» — генерировать правдоподобные, но неверные ответы', is_correct: true },
      { text: 'LLM имеет доступ к реальному времени и всегда знает текущие новости', is_correct: false },
      { text: 'LLM не может быть использована для обработки данных', is_correct: false },
    ],
  },
  {
    category: 'limitations',
    text: 'В каком случае НЕЛЬЗЯ доверять ИИ самостоятельное принятие решения?',
    type: 'mcq',
    options: [
      { text: 'Генерация черновика email-рассылки', is_correct: false },
      { text: 'Классификация тикетов по категориям', is_correct: false },
      { text: 'Оценка юридических рисков контракта без проверки юристом', is_correct: true },
      { text: 'Суммаризация длинной статьи', is_correct: false },
    ],
  },

  // ── LEGAL (правовые аспекты использования ИИ) ──
  {
    category: 'legal',
    text: 'Какие данные НЕЛЬЗЯ передавать в публичные ИИ-сервисы (ChatGPT, Gemini и т.д.)?',
    type: 'mcq',
    options: [
      { text: 'Общедоступную информацию с сайта компании', is_correct: false },
      { text: 'Персональные данные клиентов и коммерческую тайну', is_correct: true },
      { text: 'Определения из открытых словарей', is_correct: false },
      { text: 'Погоду в городе', is_correct: false },
    ],
  },
  {
    category: 'legal',
    text: 'Кто несёт ответственность за контент, созданный ИИ и опубликованный компанией?',
    type: 'mcq',
    options: [
      { text: 'Разработчик ИИ-модели', is_correct: false },
      { text: 'Никто — ИИ сам отвечает за свои ответы', is_correct: false },
      { text: 'Компания, опубликовавшая контент', is_correct: true },
      { text: 'Платформа, на которой размещён контент', is_correct: false },
    ],
  },

  // ── ROI (оценка возвратности инвестиций в ИИ) ──
  {
    category: 'roi',
    text: 'Какой метрикой ЛУЧШЕ всего измерить эффективность внедрения ИИ-автоматизации в поддержке?',
    type: 'mcq',
    options: [
      { text: 'Количество сотрудников в отделе', is_correct: false },
      { text: 'Среднее время ответа и процент решений без участия человека', is_correct: true },
      { text: 'Количество серверов', is_correct: false },
      { text: 'Цвет логотипа компании', is_correct: false },
    ],
  },
  {
    category: 'roi',
    text: 'Компания потратила 500 000 ₽ на внедрение ИИ. Экономия составила 100 000 ₽/мес. Через сколько месяцев окупятся вложения?',
    type: 'mcq',
    options: [
      { text: '2 месяца', is_correct: false },
      { text: '5 месяцев', is_correct: true },
      { text: '12 месяцев', is_correct: false },
      { text: 'Никогда', is_correct: false },
    ],
  },

  // ── CHANGE MANAGEMENT (управление изменениями) ──
  {
    category: 'change_management',
    text: 'Какой подход НАИБОЛЕЕ эффективен при внедрении ИИ-инструментов в устоявшуюся команду?',
    type: 'mcq',
    options: [
      { text: 'Мгновенно заменить все процессы ИИ без предупреждения', is_correct: false },
      { text: 'Запретить обсуждение изменений до момента полного внедрения', is_correct: false },
      { text: 'Пилотный проект с вовлечением команды, обучение, постепенное масштабирование', is_correct: true },
      { text: 'Делегировать решение исключительно внешним консультантам', is_correct: false },
    ],
  },
  {
    category: 'change_management',
    text: 'Сотрудники боятся, что ИИ заменит их рабочие места. Какое действие руководителя ЛУЧШЕ всего снизит сопротивление?',
    type: 'mcq',
    options: [
      { text: 'Игнорировать страхи и продолжать внедрение', is_correct: false },
      { text: 'Уволить наиболее скептически настроенных', is_correct: false },
      { text: 'Показать, как ИИ устраняет рутину и повышает ценность их работы', is_correct: true },
      { text: 'Пообещать, что ИИ никогда не затронет их задачи', is_correct: false },
    ],
  },
]

async function seed() {
  console.log('🌱 Seeding questions...')

  // Check existing count
  const { count: existingCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  Table already has ${existingCount} questions. Skipping to avoid duplicates.`)
    console.log('   To re-seed, manually TRUNCATE the questions table first.')
    process.exit(0)
  }

  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
    .select('id, category, text, type')

  if (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully seeded ${data.length} questions:`)
  const byCategory = data.reduce<Record<string, number>>((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1
    return acc
  }, {})
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`   ${cat}: ${count}`)
  }
  console.log('🎉 Done!')
}

seed()
