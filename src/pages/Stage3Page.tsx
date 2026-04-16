import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calculator, 
  FileText, 
  Lightbulb, 
  Save, 
  Send, 
  Timer, 
  TrendingDown, 
  Users,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { 
  fetchLatestUserResult, 
  fetchLatestSimulatorResult, 
  fetchQuestions, 
  submitStage3Result,
  TestResult,
  Question
} from '@/lib/api';

export default function Stage3Page() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stage1Result, setStage1Result] = useState<TestResult | null>(null);
  const [stage2Result, setStage2Result] = useState<TestResult | null>(null);
  const [routineMap, setRoutineMap] = useState<string>('');
  
  // Form state
  const [taskName, setTaskName] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [manualMinutes, setManualMinutes] = useState<number>(0);
  const [aiMinutes, setAiMinutes] = useState<number>(0);
  const [monthlyFrequency, setMonthlyFrequency] = useState<number>(0);
  const [scalability, setScalability] = useState('Только я');

  const routineTasks = routineMap
    .split(/\n|\d\./)
    .map(t => t.trim())
    .filter(t => t.length > 5 && t.length < 100);

  useEffect(() => {
    async function loadData() {
      try {
        const [s1, s2, qs] = await Promise.all([
          fetchLatestUserResult(),
          fetchLatestSimulatorResult(),
          fetchQuestions()
        ]);
        
        setStage1Result(s1);
        setStage2Result(s2);

        // Try to extract routine map from Stage 1 answers
        if (s1 && s1.answers && qs) {
          const routineQuestion = qs.find(q => q.text.toLowerCase().includes('карту рутины'));
          if (routineQuestion && (s1.answers as any)[routineQuestion.id]) {
            setRoutineMap((s1.answers as any)[routineQuestion.id].text || '');
          } else {
            // Fallback: look for any long answer if routine question not found by text
            const answers = s1.answers as Record<string, any>;
            const longAnswer = Object.values(answers).find(a => a.text && a.text.length > 50);
            if (longAnswer) setRoutineMap(longAnswer.text);
          }
        }
      } catch (err) {
        console.error('Failed to load Stage 3 data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const timeSavedPerMonth = Math.max(0, (manualMinutes - aiMinutes) * monthlyFrequency / 60);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitStage3Result({
        taskName,
        promptTemplate,
        manualMinutes,
        aiMinutes,
        monthlyFrequency,
        scalability,
        timeSavedPerMonth
      });
      alert('Проект отправлен руководителю!');
      navigate('/');
    } catch (err) {
      alert('Ошибка при отправке: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 py-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Этап 3: Микро-проект</h1>
          <p className="text-xs text-muted-foreground font-medium">Автоматизация реальной задачи</p>
        </div>
      </header>

      {/* Block 1: Read-only context */}
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ваш прогресс
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Балл за Этап 2</p>
              <div className="text-2xl font-black text-primary">{stage2Result?.score ?? '—'}%</div>
            </div>
            {stage2Result?.llm_feedback?.time_saved_multiplier && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Ускорение</p>
                <div className="text-2xl font-black text-accent-foreground">{stage2Result.llm_feedback.time_saved_multiplier}x</div>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Статус</p>
              <div className="text-sm font-bold text-green-600">Кандидат на внедрение</div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-primary/10">
            <h4 className="text-xs font-bold mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Ваша Карта Рутины (Этап 1):
            </h4>
            <div className="bg-background/50 rounded-lg p-3 text-xs text-muted-foreground whitespace-pre-wrap italic leading-relaxed border border-primary/5">
              {routineMap || 'Карта рутины не найдена. Опишите задачу ниже.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Inputs */}
      <div className="space-y-4">
        <Card className="shadow-none border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Описание решения
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Какую задачу автоматизируем?</label>
              {routineTasks.length > 0 ? (
                <div className="space-y-2">
                  <select 
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none"
                    value={routineTasks.includes(taskName) ? taskName : (taskName ? 'other' : '')}
                    onChange={e => {
                      if (e.target.value === 'other') {
                        setTaskName('');
                      } else {
                        setTaskName(e.target.value);
                      }
                    }}
                  >
                    <option value="">Выберите из вашей карты рутины...</option>
                    {routineTasks.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                    <option value="other">Другая задача (ввести вручную)...</option>
                  </select>
                  
                  {(!routineTasks.includes(taskName) || taskName === '') && (
                    <input 
                      type="text"
                      placeholder="Назовите вашу задачу"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      value={taskName}
                      onChange={e => setTaskName(e.target.value)}
                    />
                  )}
                </div>
              ) : (
                <input 
                  type="text"
                  placeholder="Например: Еженедельный отчет по продажам"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Финальный промпт-шаблон</label>
              <textarea 
                placeholder="Вставьте текст промпта, который вы разработали..."
                className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                value={promptTemplate}
                onChange={e => setPromptTemplate(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Этот промпт будет доступен вашим коллегам в будущем.</p>
            </div>
          </CardContent>
        </Card>

        {/* Block 3: ROI Calculator */}
        <Card className="shadow-none border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-500" />
              Экономика / ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Вручную (мин)
                </label>
                <input 
                  type="number"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={manualMinutes || ''}
                  onChange={e => setManualMinutes(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> С ИИ (мин)
                </label>
                <input 
                  type="number"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={aiMinutes || ''}
                  onChange={e => setAiMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Количество задач в месяц</label>
              <input 
                type="number"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={monthlyFrequency || ''}
                onChange={e => setMonthlyFrequency(Number(e.target.value))}
              />
            </div>

            <div className="mt-4 bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-green-700">Прогноз экономии:</p>
                <div className="text-2xl font-black text-green-700">{timeSavedPerMonth.toFixed(1)} <span className="text-sm font-bold">часов/мес</span></div>
              </div>
              <div className="bg-green-500 text-white p-2 rounded-lg shadow-lg shadow-green-500/20">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Block 4: Scalability */}
        <Card className="shadow-none border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Масштабируемость
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Кто еще может использовать?</label>
              <select 
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none"
                value={scalability}
                onChange={e => setScalability(e.target.value)}
              >
                <option>Только я</option>
                <option>Отдел</option>
                <option>Вся компания</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        className="w-full py-6 text-base font-bold shadow-lg shadow-primary/20 group"
        size="lg"
        onClick={handleSubmit}
        disabled={submitting || !taskName || !promptTemplate}
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        )}
        Отправить проект на проверку
      </Button>
    </div>
  );
}
