import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Users, TrendingUp, Clock, ChevronRight,
  BarChart3, Calendar, CheckCircle, Loader2, Star, AlertTriangle
} from 'lucide-react';
import { fetchAllCompanyResults, approveStage3Result, type AssessmentResult } from '@/lib/api';
import { cn } from '@/lib/utils';

const LEVEL_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Новичок',    color: 'text-gray-500' },
  2: { label: 'Начинающий', color: 'text-orange-500' },
  3: { label: 'Практик',    color: 'text-blue-500' },
  4: { label: 'Продвинутый',color: 'text-purple-500' },
  5: { label: 'Эксперт',    color: 'text-emerald-500' },
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllCompanyResults();
      setResults(data);
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
      await loadData();
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setApproving(null);
    }
  };

  // ─── Derived stats ────────────────────────────────────────────────────────
  const totalHours = results.reduce((s, r) => s + (r.validated_hours_per_month || 0), 0);
  const avgGrade = results.length > 0
    ? results.reduce((s, r) => s + (r.final_level || 0), 0) / results.length
    : 0;
  const champions = results.filter(r => r.is_champion).length;
  const needsTraining = results.filter(r => r.needs_training).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка аналитики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-4 py-2 pr-12">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Панель управления</h1>
          <p className="text-xs text-muted-foreground">Аттестация команды</p>
        </div>
      </header>

      {/* ROI Widget */}
      <Card className="shadow-neumorphic dark:shadow-neon-cyan overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <TrendingUp className="w-24 h-24" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ROI компании</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-foreground">{totalHours.toFixed(0)}</span>
            <span className="text-lg font-bold text-muted-foreground">ч/мес</span>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            ≈ {(totalHours / 160).toFixed(1)} штатных единиц автоматизировано
          </p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-foreground">{avgGrade.toFixed(1)}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Средний уровень</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-emerald-500">{champions}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Чемпионов</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-orange-500">{needsTraining}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Нужно обучение</div>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Команда ({results.length})
        </h3>

        {results.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Нет данных аттестации. Сотрудники ещё не прошли тесты.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => {
              const levelInfo = LEVEL_LABELS[r.final_level || 0];
              return (
                <Card key={r.user_id || i} className="hover:shadow-neumorphic dark:hover:shadow-neon-cyan transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">
                            {r.profiles?.full_name || 'Сотрудник'}
                          </h4>
                          {r.is_champion && <Star className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {r.needs_training && <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                          {r.profiles?.role || 'employee'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {r.final_level ? (
                          <div className="text-right">
                            <div className={cn("text-lg font-black", levelInfo?.color)}>
                              {r.final_level}/5
                            </div>
                            <div className="text-[9px] font-bold text-muted-foreground">
                              {levelInfo?.label || r.level_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}

                        {r.validated_hours_per_month ? (
                          <div className="bg-primary/10 dark:bg-primary/15 px-2 py-1 rounded-lg">
                            <div className="text-xs font-black text-primary">{r.validated_hours_per_month}ч</div>
                            <div className="text-[8px] text-muted-foreground">в месяц</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="bg-muted/20">
        <CardContent className="p-4 flex gap-3 items-center">
          <Calendar className="w-8 h-8 text-muted-foreground opacity-30 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Данные из таблицы assessment_results. Обновляются после прохождения этапов.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
