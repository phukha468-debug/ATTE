import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  BarChart3,
  Award,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { fetchCompanyResults, type TestResult } from '@/lib/api'
import { useAppStore } from '@/store/appStore'

/** Цвет по score */
function getScoreBadge(score: number | null): { label: string; variant: string } {
  if (score === null) return { label: '—', variant: 'outline' }
  if (score >= 80) return { label: `${score}% · Отлично`, variant: 'default' }
  if (score >= 60) return { label: `${score}% · Хорошо`, variant: 'secondary' }
  if (score >= 40) return { label: `${score}% · Удовл.`, variant: 'outline' }
  return { label: `${score}% · Слабо`, variant: 'destructive' }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { userProfile } = useAppStore()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)

  useEffect(() => {
    async function init() {
      if (!userProfile) return

      // employee не имеет доступа к дашборду
      if (userProfile.role === 'employee') {
        navigate('/tests', { replace: true })
        return
      }

      try {
        const data = await fetchCompanyResults()
        setResults(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate, userProfile])

  const userRole = userProfile?.role || ''

  // ── Computed stats ──
  const totalCompleted = results.filter(r => r.is_completed).length
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0

  if (loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка дашборда...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => navigate('/')}>На главную</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              HR-Дашборд
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Результаты аттестации сотрудников · Роль: {userRole}
            </p>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Всего пройдено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              из {results.length} записей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Средний балл
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-3xl font-black', avgScore >= 60 ? 'text-green-500' : 'text-orange-500')}>
              {avgScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              по компании
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Пока нет результатов аттестации</p>
            <p className="text-xs text-muted-foreground mt-1">
              Когда сотрудники пройдут тесты, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((result, idx) => {
            const scoreInfo = getScoreBadge(result.score)
            const name = result.users?.full_name || 'Неизвестный сотрудник'
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: result.score !== null && result.score >= 60 ? 'oklch(0.6 0.2 150)' : 'oklch(0.55 0.25 30)' }}
                  onClick={() => setSelectedResult(result)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white',
                        result.score !== null && result.score >= 60
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-orange-500 to-red-600'
                      )}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(result.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={scoreInfo.variant as any} className="text-xs">
                        {scoreInfo.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Detail dialog */}
      <AnimatePresence>
        {selectedResult && (
          <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-heading">
                  {selectedResult.users?.full_name || 'Сотрудник'}
                </DialogTitle>
                <DialogDescription>
                  Аттестация от {formatDate(selectedResult.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Score */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className={cn(
                    'text-4xl font-black',
                    selectedResult.score !== null && selectedResult.score >= 60 ? 'text-green-500' : 'text-orange-500'
                  )}>
                    {selectedResult.score ?? '—'}%
                  </div>
                  <div>
                    <p className="text-sm font-medium">Итоговый балл</p>
                    <p className="text-xs text-muted-foreground">
                      {getScoreBadge(selectedResult.score).label}
                    </p>
                  </div>
                </div>

                {/* Category scores */}
                {selectedResult.llm_feedback?.category_scores && Object.keys(selectedResult.llm_feedback.category_scores).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        По категориям
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2.5">
                        {Object.entries(selectedResult.llm_feedback.category_scores).map(([cat, val]) => {
                          const numVal = Number(val)
                          const catLabels: Record<string, string> = {
                            routine: 'Рутина',
                            prompting: 'Промптинг',
                            limitations: 'Ограничения ИИ',
                            legal: 'Правовая грамотность',
                            roi: 'ROI',
                            change_management: 'Управление изменениями',
                          }
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{catLabels[cat] || cat}</span>
                                <span className={cn(
                                  'font-bold',
                                  numVal >= 60 ? 'text-green-500' : 'text-orange-500'
                                )}>{numVal}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    numVal >= 60 ? 'bg-green-500' : 'bg-orange-500'
                                  )}
                                  style={{ width: `${Math.min(numVal, 100)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* LLM Feedback */}
                {selectedResult.llm_feedback?.feedback && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Обратная связь от ИИ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {selectedResult.llm_feedback.feedback}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Raw answers summary (collapsible info) */}
                {selectedResult.answers && typeof selectedResult.answers === 'object' && (
                  <details className="rounded-xl border bg-muted/30 p-4">
                    <summary className="text-xs font-medium text-muted-foreground cursor-pointer">
                      Сырые ответы ({Object.keys(selectedResult.answers).length} вопросов)
                    </summary>
                    <div className="mt-3 space-y-3 text-xs">
                      {Object.entries(selectedResult.answers).map(([qId, answer]) => (
                        <div key={qId} className="border-l-2 border-muted pl-3 py-1">
                          <p className="text-muted-foreground font-mono truncate">{qId.slice(0, 8)}...</p>
                          <p className="mt-0.5">{(answer as any)?.text || JSON.stringify(answer)}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
