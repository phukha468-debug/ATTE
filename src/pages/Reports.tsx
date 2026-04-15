import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fetchLatestUserResult, TestResult } from '@/lib/api';

const categoryLabels: Record<string, string> = {
  prompting: 'Промптинг',
  routine: 'Рутина',
  limitations: 'Ограничения',
  legal: 'Право',
  roi: 'ROI'
};

const defaultSkillData = [
  { subject: 'Промптинг', A: 0, fullMark: 100 },
  { subject: 'Рутина', A: 0, fullMark: 100 },
  { subject: 'Ограничения', A: 0, fullMark: 100 },
  { subject: 'Право', A: 0, fullMark: 100 },
  { subject: 'ROI', A: 0, fullMark: 100 },
];

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

  const skillData = latestResult?.llm_feedback?.category_scores
    ? Object.entries(latestResult.llm_feedback.category_scores).map(([key, val]) => ({
        subject: categoryLabels[key] || key,
        A: val,
        fullMark: 100
      }))
    : defaultSkillData;

  const progressData = [
    { name: 'Тек. тест', score: latestResult?.score || 0 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground">Детальный разбор твоих компетенций</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Карта компетенций</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] min-h-[250px] flex items-center justify-center">
          {isLoading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Загрузка данных...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
                <Radar
                  name="Результат"
                  dataKey="A"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Твой результат</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] min-h-[200px]">
          {isLoading ? (
             <div className="h-full flex items-center justify-center text-sm text-muted-foreground animate-pulse">Загрузка...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#1a1a1a',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground uppercase mb-1">Экономия времени</div>
            <div className="text-xl font-bold">~41 ч/мес</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground uppercase mb-1">ROI проектов</div>
            <div className="text-xl font-bold">850%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
