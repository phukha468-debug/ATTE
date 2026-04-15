import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchLatestUserResult, TestResult } from '@/lib/api';

const categoryLabels: Record<string, string> = {
  prompting: 'Промптинг',
  routine: 'Автоматизация рутины',
  limitations: 'Ограничения',
  legal: 'Право'
};

export default function Reports() {
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchLatestUserResult();
        setLatestResult(result);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const scores = latestResult?.llm_feedback?.category_scores || {};

  return (
    <div className="space-y-4 font-sans antialiased overflow-x-hidden">
      <header className="py-2">
        <h1 className="text-xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-xs text-muted-foreground">Результаты аттестации</p>
      </header>

      <Card className="border-none shadow-none bg-accent/5">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Детальные баллы</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {isLoading ? (
            <div className="text-xs animate-pulse">Загрузка...</div>
          ) : Object.keys(scores).length > 0 ? (
            Object.entries(categoryLabels).map(([key, label]) => {
              const val = scores[key] || 0;
              const displayVal = Math.round(val / 10);
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

      <div className="pt-2">
        <div className="text-xs text-muted-foreground uppercase mb-1 px-4">Итоговый результат</div>
        <div className="text-3xl font-black px-4">{latestResult?.score || 0}%</div>
      </div>
    </div>
  );
}
