import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Target, TrendingUp, Award, BarChart3, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { userProfile, latestResult, simulatorResult, isLoading } = useAppStore();

  const userName = userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'друг';
  const userRole = userProfile?.role || '';

  const score = latestResult?.score ?? 0;
  const hasResult = !!latestResult;
  const simScore = simulatorResult?.score ?? 0;
  const hasSimResult = !!simulatorResult;

  const isManager = userRole.toLowerCase().includes('manager') || userRole.toLowerCase().includes('admin');

  return (
    <div className="space-y-4 font-sans antialiased overflow-x-hidden animate-in fade-in duration-500">
      <header className="flex justify-between items-center py-3 pr-12">
        <div className="min-h-[48px]">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight">Привет, {userName}!</h1>
              <p className="text-sm text-muted-foreground">Прогресс в ИИ-аттестации</p>
            </>
          )}
        </div>
        <Avatar className="w-11 h-11 border-0 shadow-neumorphic dark:shadow-neon-cyan dark:ring-2 dark:ring-primary/40 transition-all duration-300">
          <AvatarFallback className="text-sm font-bold bg-card dark:bg-primary/10 dark:text-primary">
            {isLoading ? <Skeleton className="h-full w-full rounded-full" /> : (userName ? userName.charAt(0).toUpperCase() : '?')}
          </AvatarFallback>
        </Avatar>
      </header>

      <div className="grid grid-cols-2 gap-3 min-h-[120px]">
        {/* НАВЫКИ — cyan glow in dark mode */}
        <Card className="shadow-neumorphic dark:shadow-neon-cyan">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Навыки</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-3xl font-bold">{hasResult ? `${score}%` : '—'}</div>
            )}
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {hasResult ? 'Результат теста' : 'Тест не пройден'}
            </p>
          </CardContent>
        </Card>

        {/* СИМУЛЯТОР — purple glow in dark mode (default) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent-foreground dark:text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent-foreground/70 dark:text-accent/70">Симулятор</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-3xl font-bold">{hasSimResult ? `${simScore}%` : '—'}</div>
            )}
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {hasSimResult ? 'Пройдено' : 'В процессе'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ПУТЬ РАЗВИТИЯ — purple glow (default) */}
      <Card className="min-h-[200px]">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Путь развития
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {isLoading ? (
            <div className="space-y-6 mt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span>Этап 1: ИИ-Аттестация</span>
                  <span className={hasResult
                    ? "text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground"
                  }>
                    {hasResult ? '✓ Готово' : '0%'}
                  </span>
                </div>
                <Progress value={hasResult ? 100 : 0} className="h-2" />
              </div>
              <div
                className="space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/simulator')}
              >
                <div className="flex justify-between text-sm font-medium">
                  <span>Этап 2: Симулятор</span>
                  <span className={hasSimResult
                    ? "text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400 font-bold"
                    : "text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-amber-400/15 dark:text-amber-400"
                  }>
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
                  <span className={
                    hasSimResult
                      ? "text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-amber-400/15 dark:text-amber-400"
                      : "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  }>
                    {hasSimResult ? 'Доступно' : 'Скоро'}
                  </span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isManager && (
        <Button
          variant="outline"
          className="w-full py-6 border-0 shadow-neumorphic dark:shadow-neon-cyan bg-card text-primary font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2 group"
          onClick={() => navigate('/dashboard')}
        >
          <BarChart3 className="w-5 h-5" />
          Панель управления компанией
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}

      {/* УЛУЧШИ НАВЫКИ — purple glow (default) */}
      <Card>
        <CardContent className="p-4 flex gap-3">
          <div className="bg-primary/10 dark:bg-primary/15 p-2 rounded-full h-fit">
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
    </div>
  );
}
