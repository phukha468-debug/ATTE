import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, TrendingUp, Sparkles, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface JudgeResult {
  score: number;
  feedback: string;
  time_saved_multiplier: number;
}

export default function SimulatorResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as JudgeResult;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground">Результаты не найдены</p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </div>
    );
  }

  const isExcellent = result.score >= 80;

  return (
    <div className="space-y-6 font-sans antialiased overflow-x-hidden pb-8">
      <header className="py-2 text-center">
        <h1 className="text-xl font-bold tracking-tight">Вердикт Судьи</h1>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Этап 2 завершен</p>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div className={cn(
          "relative p-8 rounded-full border-4 flex flex-col items-center justify-center bg-card shadow-xl transition-colors",
          isExcellent ? "border-primary/40 shadow-primary/10" : "border-muted shadow-sm"
        )}>
          {isExcellent && (
            <Trophy className="w-6 h-6 absolute -top-3 text-yellow-500 fill-yellow-500 drop-shadow-md" />
          )}
          <span className={cn(
            "text-5xl font-black",
            isExcellent ? "text-primary" : "text-foreground"
          )}>{result.score}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">баллов</span>
        </div>
      </motion.div>

      <Card className="border-none bg-accent/5 shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" /> Разбор компетенций
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm leading-relaxed">{result.feedback}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        <Card className="border-none bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ускорение задачи</div>
              <div className="text-lg font-black text-green-600">x{result.time_saved_multiplier} <span className="text-xs font-normal text-muted-foreground">быстрее</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 space-y-3">
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex gap-3 items-center">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <p className="text-[10px] text-muted-foreground leading-snug">
            {isExcellent 
              ? "Отличный результат! Вы эффективно используете ИИ для решения рабочих задач." 
              : "Хорошее начало. Попробуйте давать ИИ больше контекста в следующих задачах."}
          </p>
        </div>

        <Button 
          className="w-full py-6 text-sm font-bold gap-2"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4" /> На главную
        </Button>
      </div>
    </div>
  );
}
