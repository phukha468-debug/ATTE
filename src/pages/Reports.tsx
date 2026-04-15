import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchLatestUserResult, fetchLatestSimulatorResult, TestResult } from '@/lib/api';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  prompting: 'Промптинг',
  routine: 'Автоматизация рутины',
  limitations: 'Ограничения',
  legal: 'Право'
};

export default function Reports() {
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [simulatorResult, setSimulatorResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [result, simResult] = await Promise.all([
          fetchLatestUserResult(),
          fetchLatestSimulatorResult()
        ]);
        setLatestResult(result);
        setSimulatorResult(simResult);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const scores = latestResult?.llm_feedback?.category_scores || {};
  const overallScore = latestResult?.score ?? 0;
  const isPremium = overallScore >= 80;

  const simScore = simulatorResult?.score ?? 0;
  const simFeedback = simulatorResult?.llm_feedback?.feedback || '';

  return (
    <div className="space-y-4 font-sans antialiased overflow-x-hidden pb-8">
      <header className="py-2">
        <h1 className="text-xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-xs text-muted-foreground">Результаты аттестации</p>
      </header>

      {/* Stage 1 Results */}
      <Card className="border-none shadow-none bg-accent/5">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Этап 1: Знания</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {isLoading ? (
            <div className="text-xs animate-pulse">Загрузка...</div>
          ) : Object.keys(scores).length > 0 ? (
            Object.entries(categoryLabels).map(([key, label]) => {
              const val = scores[key] ?? 0;
              const displayVal = Math.round(val);
              return (
                <div key={key} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0 text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="font-bold">{displayVal}/10</span>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-muted-foreground">Нет данных. Пройдите тест на вкладке "Тесты".</div>
          )}
        </CardContent>
      </Card>

      {/* Stage 2 Results */}
      {simulatorResult && (
        <Card className="border-none shadow-none bg-primary/5">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary/70">Этап 2: Навыки в деле</CardTitle>
            <span className="text-lg font-black text-primary">{simScore}%</span>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
             <div className="flex gap-2 items-start bg-background/50 p-3 rounded-xl border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed italic">{simFeedback}</p>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Симулятор</span>
                <span>Ускорение: x{simulatorResult.llm_feedback?.time_saved_multiplier || '1.0'}</span>
             </div>
          </CardContent>
        </Card>
      )}

      <style>{`
        @keyframes scoreFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(0.5deg); }
        }
        .score-card:hover {
          transform: translateY(-4px) rotate(1deg);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }
        .score-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
      `}</style>
      <div className="relative score-card rounded-2xl border border-border/60 bg-accent/5 p-5 mx-0">
        {isPremium && (
          <span className="absolute top-3 right-3 text-xl" title="Отличный результат!">👑</span>
        )}
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Итоговый результат (Этап 1)</div>
        <div className="text-5xl font-black">{overallScore}%</div>
        {isPremium && (
          <div className="text-xs text-primary font-semibold mt-2">Высокий уровень ИИ-грамотности</div>
        )}
      </div>
    </div>
  );
}
