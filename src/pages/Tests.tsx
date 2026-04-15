import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Cpu, Rocket, Lock, Trophy, ArrowLeft, Loader2, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { TestRunner } from '@/components/TestRunner'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { fetchQuestions, submitTestResults, type EvaluationResult } from '@/lib/api'
import { useTestStore } from '@/store/testStore'

const stages = [
  {
    id: 1,
    title: 'Этап 1: Карта рутины',
    description: 'Оценка ИИ-компетенций: рутина, промптинг, ограничения, правовая грамотность.',
    icon: Bot,
    status: 'active' as const,
    score: '—',
  },
  {
    id: 2,
    title: 'Этап 2: ИИ-Симулятор',
    description: 'Решение реальных рабочих задач с помощью LLM-Judge.',
    icon: Cpu,
    status: 'locked' as const,
    score: '—',
  },
  {
    id: 3,
    title: 'Этап 3: Микро-проект',
    description: 'Разработка и внедрение ИИ-решения в рабочий процесс.',
    icon: Rocket,
    status: 'locked' as const,
    score: '—',
  },
]

/** Цвета по score */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Отлично'
  if (score >= 60) return 'Хорошо'
  if (score >= 40) return 'Удовлетворительно'
  return 'Нужна подготовка'
}

export default function Tests() {
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null)
  const [evalError, setEvalError] = useState<string | null>(null)
  const testStore = useTestStore()

  useEffect(() => {
    fetchQuestions()
      .then(qs => {
        console.log('[tests] fetchQuestions returned:', qs.length, 'questions')
        if (qs.length > 0) {
          testStore.setQuestions(qs)
          console.log(`✅ fetchQuestions: ${qs.length} questions loaded, store updated`)
        } else {
          console.warn('[tests] ⚠️ fetchQuestions returned 0 questions — DB may be empty')
          setFetchError('Вопросы не найдены в базе данных. Обратитесь к администратору.')
        }
      })
      .catch((err: Error) => {
        setFetchError(err.message)
        console.error('❌ fetchQuestions failed:', err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const startTest = (id: number) => {
    if (loading) {
      console.warn('[tests] startTest called while still loading')
      return
    }
    if (testStore.questions.length === 0) {
      console.error('[tests] startTest called with 0 questions in store')
      setFetchError('Вопросы не загружены. Попробуйте обновить страницу.')
      return
    }
    setActiveStage(id)
    setEvalResult(null)
    setEvalError(null)
  }

  const handleComplete = async (answers: Record<string, { value: unknown; text?: string }>) => {
    setEvaluating(true)
    setEvalError(null)

    try {
      const result = await submitTestResults(answers)
      console.log('✅ Evaluation result:', result)
      setEvalResult(result)
    } catch (err: any) {
      console.error('❌ Evaluation error:', err)
      setEvalError(err.message || 'Ошибка оценки. Попробуйте позже.')
    } finally {
      setEvaluating(false)
      setActiveStage(null)
    }
  }

  // ── Evaluation loading screen ──
  if (evaluating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-6"
      >
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold">Claude 3.7 Sonnet анализирует ваши ответы...</h2>
          <p className="text-sm text-muted-foreground">
            Это может занять 15–30 секунд. ИИ оценивает каждый ответ по рубрикам и даёт персональную обратную связь.
          </p>
        </div>
      </motion.div>
    )
  }

  // ── Evaluation result screen ──
  if (evalResult) {
    const scoreColor = getScoreColor(evalResult.score)
    const scoreLabel = getScoreLabel(evalResult.score)

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center space-y-4 py-4"
      >
        <div className="bg-primary/10 p-4 rounded-full">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Аттестация завершена!</h2>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn('text-5xl font-black', scoreColor)}>{evalResult.score}</div>
          <Badge className="text-[10px] px-2 py-0">{scoreLabel}</Badge>
        </div>

        {/* Category scores */}
        {evalResult.category_scores && Object.keys(evalResult.category_scores).length > 0 && (
          <Card className="w-full shadow-none border-none bg-accent/5">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(evalResult.category_scores).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center text-[11px] border-b border-border/50 pb-1">
                    <span className="capitalize text-muted-foreground truncate mr-2">
                      {cat === 'routine' ? 'Рутина' :
                       cat === 'prompting' ? 'Промптинг' :
                       cat === 'limitations' ? 'Ограничения' :
                       cat === 'legal' ? 'Право' : cat}
                    </span>
                    <span className={cn('font-bold', getScoreColor(Number(val)))}>{val}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback */}
        <Card className="w-full shadow-none border-none bg-accent/5">
          <CardContent className="p-3">
            <h3 className="text-[11px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Фидбек
            </h3>
            <p className="text-[11px] leading-snug">
              {evalResult.feedback}
            </p>
          </CardContent>
        </Card>

        <Button className="w-full py-4 text-xs font-bold" onClick={() => {
          testStore.resetTest()
          setEvalResult(null)
        }}>
          К списку этапов
        </Button>
      </motion.div>
    )
  }

  // ── Evaluation error ──
  if (evalError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-6"
      >
        <div className="bg-destructive/10 p-6 rounded-full">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold text-destructive">Ошибка оценки</h2>
          <p className="text-sm text-muted-foreground">{evalError}</p>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <Button variant="outline" className="flex-1" onClick={() => {
            testStore.resetTest()
            setEvalError(null)
          }}>
            На главную
          </Button>
          <Button className="flex-1" onClick={() => {
            setEvaluating(true)
            setEvalError(null)
          }}>
            Повторить
          </Button>
        </div>
      </motion.div>
    )
  }

  // ── Active test ──
  if (activeStage) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setActiveStage(null); testStore.resetTest() }} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </Button>
        <TestRunner onComplete={handleComplete} />
      </div>
    )
  }

  // ── Stages list ──
  return (
    <div className="space-y-6">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Твоя Аттестация</h1>
        <p className="text-muted-foreground mt-1">Пройди все этапы для повышения грейда</p>
        {loading && <p className="text-xs text-muted-foreground mt-1">Загрузка вопросов...</p>}
        {fetchError && <p className="text-xs text-destructive mt-1">⚠️ {fetchError}</p>}
        {!loading && testStore.questions.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            📚 {testStore.questions.length} вопросов в базе
          </p>
        )}
      </header>

      <div className="space-y-4">
        {stages.map((stage) => (
          <Card key={stage.id} className={cn(
            'transition-all duration-300',
            stage.status === 'locked' ? 'opacity-60 grayscale' : 'hover:shadow-md',
            stage.status === 'active' ? 'border-primary/30 bg-primary/5' : 'bg-card'
          )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={cn(
                'p-3 rounded-2xl transition-colors',
                stage.status === 'active' ? 'bg-primary/20 text-primary' :
                'bg-muted text-muted-foreground'
              )}>
                <stage.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-heading">{stage.title}</CardTitle>
                  {stage.status === 'locked' && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {stage.status === 'active' && (
                    <span className="inline-flex items-center rounded-md border border-primary px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Доступен
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs mt-1 leading-relaxed">{stage.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground font-medium">Результат: <span className="text-foreground font-bold">{stage.score}</span></span>
                <Button
                  size="sm"
                  variant={stage.status === 'active' ? 'default' : 'outline'}
                  disabled={stage.status === 'locked'}
                  onClick={() => startTest(stage.id)}
                  className="font-bold px-6"
                >
                  {stage.status === 'active' ? 'Начать' : 'Закрыто'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
