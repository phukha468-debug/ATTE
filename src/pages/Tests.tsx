import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Cpu, Rocket, Lock, Trophy, ArrowLeft } from 'lucide-react'
import { TestRunner } from '@/components/TestRunner'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { fetchQuestions } from '@/lib/api'
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

export default function Tests() {
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const testStore = useTestStore()

  useEffect(() => {
    fetchQuestions()
      .then(qs => {
        if (qs.length > 0) {
          testStore.setQuestions(qs)
          console.log(`✅ fetchQuestions: ${qs.length} questions loaded`)
        } else {
          setFetchError('Вопросы не найдены. Запустите: npm run seed')
        }
      })
      .catch((err: Error) => {
        setFetchError(err.message)
        console.error('❌ fetchQuestions failed:', err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const startTest = (id: number) => {
    setActiveStage(id)
  }

  const handleComplete = (answers: Record<string, { value: string | string[] | null; text?: string }>) => {
    console.log('📊 Final answers:', answers)
    console.log('📊 Total answered:', Object.keys(answers).length)
    // TODO: Send answers to /api/ai/evaluate in next task
  }

  if (activeStage) {
    const stage = stages.find(s => s.id === activeStage)
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setActiveStage(null)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </Button>
        <TestRunner onComplete={handleComplete} />
      </div>
    )
  }

  if (testStore.isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center space-y-6"
      >
        <div className="bg-primary/10 p-6 rounded-full">
          <Trophy className="w-16 h-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Тест завершён!</h2>
          <p className="text-muted-foreground">
            Отвечено: <span className="text-foreground font-bold">{testStore.answeredCount} из {testStore.questions.length}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Ответы будут отправлены на оценку LLM-Judge (следующий таск)
          </p>
        </div>
        <Button
          className="w-full"
          onClick={() => {
            testStore.resetTest()
          }}
        >
          Вернуться к списку
        </Button>
      </motion.div>
    )
  }

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
