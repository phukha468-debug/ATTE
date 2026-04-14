import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTestStore } from '@/store/testStore'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ArrowLeft, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TestRunner({ onComplete }: { onComplete: (answers: Record<string, { value: string | string[] | null; text?: string }>) => void }) {
  const store = useTestStore()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [openText, setOpenText] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const { questions, currentIndex, currentQuestion } = store

  // Load stored answer when navigating
  useEffect(() => {
    if (!currentQuestion) return
    const saved = store.getAnswer(currentQuestion.id)
    if (saved) {
      if (currentQuestion.type === 'mcq' && Array.isArray(saved.value)) {
        setSelectedOption(saved.value[0] as unknown as number)
      } else if (currentQuestion.type === 'open' && saved.text) {
        setOpenText(saved.text)
      }
    } else {
      setSelectedOption(null)
      setOpenText('')
    }
  }, [currentIndex, currentQuestion])

  const handleSave = () => {
    if (!currentQuestion) return
    setIsTransitioning(true)

    if (currentQuestion.type === 'mcq') {
      if (selectedOption === null) {
        setIsTransitioning(false)
        return
      }
      store.setAnswer(currentQuestion.id, {
        value: [selectedOption],
        text: currentQuestion.options?.[selectedOption]?.text,
      })
    } else {
      store.setAnswer(currentQuestion.id, {
        value: openText,
        text: openText,
      })
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        store.nextQuestion()
      } else {
        store.completeTest()
        const allAnswers = store.allAnswers.reduce<Record<string, { value: string | string[] | null; text?: string }>>(
          (acc, a) => { acc[a.question_id] = { value: a.value, text: a.text }; return acc }, {}
        )
        console.log('✅ Test completed! Answers:', allAnswers)
        onComplete(allAnswers)
      }
      setIsTransitioning(false)
    }, 300)
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      store.prevQuestion()
    }
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка вопросов...</p>
      </div>
    )
  }

  const progress = store.progress
  const q = currentQuestion
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Вопрос {currentIndex + 1} из {questions.length}</span>
          <span>{Math.round(progress)}% · Отвечено {store.answeredCount}/{questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className={cn(
                  'shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold',
                  q.type === 'mcq' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                )}>
                  {q.type === 'mcq' ? 'MCQ' : '✏️'}
                </span>
                <CardTitle className="text-lg sm:text-xl leading-snug font-heading">{q.text}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {q.type === 'mcq' && q.options && (
                <div className="space-y-3">
                  {q.options.map((option, idx) => {
                    const isSelected = selectedOption === idx
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          'w-full text-left rounded-xl border-2 p-4 transition-all duration-200',
                          'hover:border-primary/50 hover:bg-primary/5',
                          isSelected && 'border-primary bg-primary/10 shadow-sm'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 text-muted-foreground'
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="font-medium text-sm sm:text-base">{option.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'open' && (
                <textarea
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  placeholder="Напишите ваш ответ..."
                  className={cn(
                    'w-full min-h-[160px] rounded-xl border bg-background p-4 text-sm',
                    'resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'placeholder:text-muted-foreground'
                  )}
                />
              )}

              {q.llm_rubric && (
                <p className="mt-4 text-xs text-muted-foreground italic">
                  💡 Критерии оценки: {q.llm_rubric}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Button
          onClick={handleSave}
          disabled={
            isTransitioning ||
            (q.type === 'mcq' && selectedOption === null) ||
            (q.type === 'open' && openText.trim().length === 0)
          }
          className="flex-[2]"
        >
          {isLast ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Завершить
            </>
          ) : (
            <>
              Далее
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
