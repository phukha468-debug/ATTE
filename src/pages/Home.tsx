import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Target, TrendingUp, Award } from 'lucide-react';
import { fetchCurrentUserProfile, fetchLatestUserResult, TestResult } from '@/lib/api';

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    async function loadData() {
      const [profile, result] = await Promise.all([
        fetchCurrentUserProfile(),
        fetchLatestUserResult()
      ]);
      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0]); // first name only
      }
      setLatestResult(result);
    }
    loadData();
  }, []);

  const score = latestResult?.score ?? 0;
  const hasResult = !!latestResult;

  return (
    <div className="space-y-3 font-sans antialiased overflow-x-hidden">
      <header className="flex justify-between items-center py-2">
        <div>
          <h1 className="text-sm font-bold tracking-tight">Привет, {userName || 'друг'}!</h1>
          <p className="text-[10px] text-muted-foreground">Прогресс в ИИ-аттестации</p>
        </div>
        <Avatar className="w-8 h-8 border border-primary/20 shadow-sm">
          <AvatarFallback className="text-[10px]">{userName ? userName.charAt(0).toUpperCase() : '?'}</AvatarFallback>
        </Avatar>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-primary/70">Навыки</span>
            </div>
            <div className="text-xl font-bold">{hasResult ? `${score}%` : '—'}</div>
            <p className="text-[8px] text-muted-foreground font-medium">
              {hasResult ? 'Результат теста' : 'Тест не пройден'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/10 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3 text-accent-foreground" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent-foreground/70">Цель</span>
            </div>
            <div className="text-xl font-bold">Грейд 4</div>
            <p className="text-[8px] text-muted-foreground font-medium">В процессе</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[10px] font-bold uppercase flex items-center gap-1.5 text-muted-foreground tracking-wider">
            <TrendingUp className="w-3 h-3" />
            Прогресс
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-medium">
                <span>Этап 1: ИИ-Аттестация</span>
                <span className={hasResult ? "text-green-500" : ""}>
                  {hasResult ? 'Готово' : '0%'}
                </span>
              </div>
              <Progress value={hasResult ? 100 : 0} className="h-1" />
            </div>
            <div className="space-y-1 opacity-50">
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Этап 2: Симулятор</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-accent/5">
        <CardContent className="p-3 flex gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full h-fit">
            <Award className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold">Улучши навыки</h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Изучи структуру промптов для улучшения результата.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full py-4 text-xs font-bold shadow-none mt-2"
        onClick={() => navigate('/tests')}
      >
        К тестам
      </Button>
    </div>
  );
}
