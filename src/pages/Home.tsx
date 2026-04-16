import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Target, TrendingUp, Award } from 'lucide-react';
import { fetchCurrentUserProfile, fetchLatestUserResult, fetchLatestSimulatorResult, TestResult } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [simulatorResult, setSimulatorResult] = useState<TestResult | null>(null);

  useEffect(() => {
    async function loadData() {
      const [profile, result, simResult] = await Promise.all([
        fetchCurrentUserProfile(),
        fetchLatestUserResult(),
        fetchLatestSimulatorResult()
      ]);
      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0]); // first name only
      }
      setLatestResult(result);
      setSimulatorResult(simResult);
    }
    loadData();
  }, []);

  const score = latestResult?.score ?? 0;
  const hasResult = !!latestResult;
  const simScore = simulatorResult?.score ?? 0;
  const hasSimResult = !!simulatorResult;

  return (
    <div className="space-y-4 font-sans antialiased overflow-x-hidden">
      <header className="flex justify-between items-center py-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Привет, {userName || 'друг'}!</h1>
          <p className="text-sm text-muted-foreground">Прогресс в ИИ-аттестации</p>
        </div>
        <Avatar className="w-11 h-11 border border-primary/20 shadow-sm">
          <AvatarFallback className="text-sm font-bold">{userName ? userName.charAt(0).toUpperCase() : '?'}</AvatarFallback>
        </Avatar>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Навыки</span>
            </div>
            <div className="text-3xl font-bold">{hasResult ? `${score}%` : '—'}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {hasResult ? 'Результат теста' : 'Тест не пройден'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/10 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent-foreground/70">Симулятор</span>
            </div>
            <div className="text-3xl font-bold">{hasSimResult ? `${simScore}%` : '—'}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {hasSimResult ? 'Пройдено' : 'В процессе'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Путь развития
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-medium">
                <span>Этап 1: ИИ-Аттестация</span>
                <span className={hasResult ? "text-green-500 font-bold" : ""}>
                  {hasResult ? '✓ Готово' : '0%'}
                </span>
              </div>
              <Progress value={hasResult ? 100 : 0} className="h-2" />
            </div>
            <div className="space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/simulator')}>
              <div className="flex justify-between text-sm font-medium">
                <span>Этап 2: Симулятор</span>
                <span className={hasSimResult ? "text-green-500 font-bold" : "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"}>
                  {hasSimResult ? '✓ Пройдено' : 'Доступно'}
                </span>
              </div>
              <Progress value={hasSimResult ? 100 : 0} className="h-2" />
            </div>
            <div 
              className={cn(
                "space-y-1.5 transition-all duration-300",
                hasSimResult ? "cursor-pointer hover:opacity-80" : "opacity-40 grayscale"
              )}
              onClick={() => hasSimResult && navigate('/stage3')}
            >
              <div className="flex justify-between text-sm font-medium">
                <span>Этап 3: Микро-проекты</span>
                <span className={hasSimResult ? "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full" : "text-xs bg-muted px-2 py-0.5 rounded-full"}>
                  {hasSimResult ? 'Доступно' : 'Скоро'}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-accent/5">
        <CardContent className="p-4 flex gap-3">
          <div className="bg-primary/10 p-2 rounded-full h-fit">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Улучши навыки</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Изучи структуру промптов для улучшения результата.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full py-4 text-xs font-bold shadow-none mt-2"
        onClick={() => navigate(hasResult ? '/simulator' : '/tests')}
      >
        {hasResult ? 'Перейти к симулятору' : 'К тестам'}
      </Button>

    </div>
  );
}
