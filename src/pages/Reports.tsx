import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const skillData = [
  { subject: 'Промптинг', A: 85, fullMark: 100 },
  { subject: 'Рутина', A: 92, fullMark: 100 },
  { subject: 'Ограничения', A: 70, fullMark: 100 },
  { subject: 'Право', A: 75, fullMark: 100 },
  { subject: 'ROI', A: 80, fullMark: 100 },
];

const progressData = [
  { name: 'Янв', score: 45 },
  { name: 'Фев', score: 52 },
  { name: 'Мар', score: 68 },
  { name: 'Апр', score: 78 },
];

export default function Reports() {
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
        <CardContent className="h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <Radar
                name="Анна"
                dataKey="A"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Динамика роста</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'var(--color-accent)', opacity: 0.4 }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid var(--color-border)', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)'
                }}
              />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
