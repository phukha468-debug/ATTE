import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar,
  ExternalLink,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  fetchAllCompanyResults, 
  approveStage3Result,
  TestResult 
} from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const allResults = await fetchAllCompanyResults();
      setResults(allResults);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await approveStage3Result(id);
      await loadData(); // Refresh
    } catch (err) {
      alert('Ошибка при утверждении: ' + (err as Error).message);
    } finally {
      setApproving(null);
    }
  };

  // 1. ROI Calculation
  const totalMonthlySavingHours = results
    .filter(r => r.type === 'stage3')
    .reduce((sum, r) => {
      const data = r.answers as any;
      return sum + (data?.timeSavedPerMonth || 0);
    }, 0);

  // 2. Team Progress Logic
  // Group results by user
  const userMap: Record<string, { 
    name: string, 
    role: string, 
    s1?: TestResult, 
    s2?: TestResult, 
    s3?: TestResult 
  }> = {};

  results.forEach(r => {
    const uid = r.user_id;
    if (!userMap[uid]) {
      userMap[uid] = { 
        name: r.users?.full_name || 'Аноним', 
        role: r.users?.role || 'Сотрудник' 
      };
    }
    if (r.type === 'stage1' || !r.type) userMap[uid].s1 = r;
    if (r.type === 'stage2') userMap[uid].s2 = r;
    if (r.type === 'stage3') userMap[uid].s3 = r;
  });

  const users = Object.values(userMap);

  // 3. AI Competencies Map (from Stage 2)
  const s2Results = results.filter(r => r.type === 'stage2' && r.llm_feedback);
  const avgPrompting = s2Results.length > 0 
    ? s2Results.reduce((sum, r) => sum + (r.llm_feedback?.score || 0), 0) / s2Results.length 
    : 0;
  
  const avgAcceleration = s2Results.length > 0
    ? s2Results.reduce((sum, r) => sum + (r.llm_feedback?.time_saved_multiplier || 1), 0) / s2Results.length
    : 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка аналитики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <header className="flex items-center gap-4 py-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Панель управления компанией</h1>
          <p className="text-xs text-muted-foreground font-medium">Агрегированные данные и внедрение ИИ</p>
        </div>
      </header>

      {/* Widget 1: Total ROI */}
      <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-24 h-24" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Итоговое ROI компании</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{totalMonthlySavingHours.toFixed(0)}</span>
            <span className="text-xl font-bold opacity-80">часов в месяц</span>
          </div>
          <p className="text-sm mt-3 opacity-90 font-medium">
            Ваша компания экономит эквивалент {(totalMonthlySavingHours / 160).toFixed(1)} штатных единиц благодаря ИИ.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget 3: Competencies Map */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Карта ИИ-компетенций
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-tighter">Промптинг (средний)</span>
                <span>{avgPrompting.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${avgPrompting}%` }} />
              </div>
            </div>
            <div className="flex justify-between items-center bg-accent/5 p-3 rounded-lg border border-accent/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-foreground" />
                <span className="text-xs font-bold uppercase tracking-tighter">Ускорение (среднее)</span>
              </div>
              <span className="text-xl font-black text-accent-foreground">{avgAcceleration.toFixed(1)}x</span>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="shadow-none border-border/60 bg-muted/20">
          <CardContent className="p-4 flex gap-3 h-full items-center">
            <Calendar className="w-10 h-10 text-muted-foreground opacity-30 shrink-0" />
            <p className="text-xs leading-relaxed text-muted-foreground font-medium">
              Данные обновляются в реальном времени по мере прохождения сотрудниками этапов аттестации.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget 2: Team Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Прогресс команды ({users.length})
        </h3>
        
        <div className="space-y-3">
          {users.map((u, i) => (
            <Card key={i} className="shadow-none border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm leading-none">{u.name}</h4>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{u.role}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Stage 1 badge */}
                    <div className={cn(
                      "flex flex-col items-center px-2 py-1 rounded border min-w-[50px]",
                      u.s1 ? "bg-green-500/5 border-green-500/20" : "bg-muted/50 border-muted opacity-40"
                    )}>
                      <span className="text-[8px] font-black uppercase opacity-60">Эт. 1</span>
                      <span className="text-xs font-bold">{u.s1 ? `${u.s1.score}%` : '—'}</span>
                    </div>
                    
                    {/* Stage 2 badge */}
                    <div className={cn(
                      "flex flex-col items-center px-2 py-1 rounded border min-w-[50px]",
                      u.s2 ? "bg-blue-500/5 border-blue-500/20" : "bg-muted/50 border-muted opacity-40"
                    )}>
                      <span className="text-[8px] font-black uppercase opacity-60">Эт. 2</span>
                      <span className="text-xs font-bold">{u.s2 ? `${u.s2.score}%` : '—'}</span>
                    </div>

                    {/* Stage 3 badge */}
                    <div className={cn(
                      "flex flex-col items-center px-2 py-1 rounded border min-w-[50px]",
                      u.s3 ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/50 border-muted opacity-40"
                    )}>
                      <span className="text-[8px] font-black uppercase opacity-60">Эт. 3</span>
                      <span className="text-xs font-bold">{u.s3 ? (u.s3.score === 100 ? '✅' : '👀') : '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4">
                    {u.s3 && u.s3.score !== 100 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-[10px] h-8 font-bold border-amber-500/50 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10"
                        onClick={() => handleApprove(u.s3!.id)}
                        disabled={approving === u.s3.id}
                      >
                        {approving === u.s3.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        Утвердить Эт. 3
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Optional: Show Stage 3 prompt if pending */}
                {u.s3 && u.s3.score !== 100 && (
                  <div className="mt-3 pt-3 border-t border-dashed border-amber-500/20 bg-amber-500/5 p-3 rounded-lg">
                    <h5 className="text-[10px] font-bold uppercase text-amber-700 mb-1">Проект: {(u.s3.answers as any).taskName}</h5>
                    <div className="text-[11px] text-muted-foreground italic line-clamp-2">
                      {(u.s3.answers as any).promptTemplate}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
