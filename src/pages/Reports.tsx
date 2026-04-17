import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Target, Clock, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  routine: 'Автоматизация рутины',
  prompting: 'Промптинг',
  limitations: 'Ограничения',
  legal: 'Право'
};

export default function Reports() {
  const { latestResult, simulatorResult, stage3Result, isLoading, isLoaded } = useAppStore();

  const overallScore = latestResult?.total_score ?? 0;
  const isPremium = overallScore >= 80;

  const simScore = simulatorResult?.score_total ?? 0;
  const simAcceleration = simulatorResult?.acceleration_x ?? 1.0;

  const s3IsApproved = stage3Result?.verdict === 'approved';

  const showSkeletons = isLoading || !isLoaded;

  return (
    <div className="space-y-6 font-sans antialiased overflow-x-hidden pb-12 animate-in fade-in duration-500">
      <header className="py-2">
        <h1 className="text-xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-xs text-muted-foreground">Результаты аттестации</p>
      </header>

      {/* Stage 1 Block - Unified */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/10 bg-accent/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-center">ЭТАП 1: ЗНАНИЯ</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-2">
            {showSkeletons ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : latestResult ? (
              <div className="py-2 text-center">
                <p className="text-xs text-muted-foreground">Тест пройден</p>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-4 text-center">Нет данных. Пройдите тест на вкладке "Тесты".</div>
            )}
          </div>

          {latestResult && !showSkeletons && (
            <div className="relative score-card bg-accent/10 p-6 border-t border-border/20 transition-all duration-300">
              {isPremium && (
                <span className="absolute top-4 right-4 text-2xl animate-bounce" title="Отличный результат!">👑</span>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Итоговый результат</div>
                <div className="text-6xl font-black tracking-tighter text-foreground">{overallScore}%</div>
                {isPremium && (
                  <div className="text-[10px] text-primary font-bold uppercase tracking-wider mt-2 bg-primary/10 px-3 py-1 rounded-full">
                    Высокий уровень ИИ-грамотности
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage 2 block */}
      {showSkeletons ? (
        <Skeleton className="h-[140px] w-full rounded-2xl" />
      ) : simulatorResult ? (
        <Card className="shadow-neumorphic dark:shadow-neon-cyan min-h-[140px]">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary/70">Этап 2: Навыки в деле</CardTitle>
            <span className="text-lg font-black text-primary">{simScore}%</span>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Симулятор</span>
                <span>Ускорение: x{simAcceleration.toFixed(1)}</span>
             </div>
             {simulatorResult.validated_hours_per_month && (
               <div className="flex gap-2 items-center bg-background/50 p-3 rounded-xl">
                 <Sparkles className="w-4 h-4 text-primary shrink-0" />
                 <p className="text-xs">{simulatorResult.validated_hours_per_month}ч/мес подтверждённой экономии</p>
               </div>
             )}
          </CardContent>
        </Card>
      ) : null}

      {/* Stage 3 block - NEW */}
      {showSkeletons ? (
        <Skeleton className="h-[140px] w-full rounded-2xl" />
      ) : stage3Result ? (
        <Card className="min-h-[140px]">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600/70">Этап 3: Внедрение</CardTitle>
            <div className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              s3IsApproved ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
            )}>
              {s3IsApproved ? "Утвержден" : "На проверке"}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
             <div className="space-y-1">
               <h4 className="text-sm font-bold leading-tight">{stage3Result.project_name}</h4>
               <p className="text-[11px] text-muted-foreground italic line-clamp-2">{stage3Result.linked_routine_task}</p>
             </div>
             {stage3Result.confirmed_hours_per_month && (
               <div className="bg-background/50 p-2 rounded-lg border border-amber-500/10 flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5 text-amber-600" />
                 <div>
                   <p className="text-[8px] uppercase font-bold text-muted-foreground leading-none">Экономия</p>
                   <p className="text-xs font-black text-amber-600">{stage3Result.confirmed_hours_per_month.toFixed(1)}ч/мес</p>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      ) : null}


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
    </div>
  );
}
