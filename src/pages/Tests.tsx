import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Cpu, Rocket, Lock, Trophy, ArrowLeft } from 'lucide-react';
import { TestRunner } from '@/components/TestRunner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { fetchQuestions } from '@/lib/api';

const stages = [
  {
    id: 1,
    title: 'Этап 1: Бот-тестирование',
    description: 'Оценка базовых знаний ИИ-инструментов и терминологии.',
    icon: Bot,
    status: 'completed',
    score: '85/100',
    category: 'routine',
  },
  {
    id: 2,
    title: 'Этап 2: ИИ-Симулятор',
    description: 'Решение реальных рабочих задач с помощью LLM-Judge.',
    icon: Cpu,
    status: 'active',
    score: 'В процессе',
    category: 'prompting',
  },
  {
    id: 3,
    title: 'Этап 3: Микро-проект',
    description: 'Разработка и внедрение ИИ-решения в рабочий процесс.',
    icon: Rocket,
    status: 'locked',
    score: '-',
    category: 'roi',
  },
];

export default function Tests() {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<number | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);

  useEffect(() => {
    fetchQuestions()
      .then(qs => {
        setQuestionsCount(qs.length);
        console.log(`✅ fetchQuestions: ${qs.length} questions from Supabase`);
      })
      .catch(err => console.error('❌ fetchQuestions failed:', err.message));
  }, []);

  const startTest = (id: number) => {
    setActiveStage(id);
    setTestResult(null);
  };

  const handleComplete = (score: number) => {
    setTestResult(score);
    setActiveStage(null);
  };

  if (activeStage) {
    const stage = stages.find(s => s.id === activeStage);
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setActiveStage(null)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </Button>
        <TestRunner category={stage?.category || 'routine'} onComplete={handleComplete} />
      </div>
    );
  }

  if (testResult !== null) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center space-y-6"
      >
        <div className="bg-primary/10 p-6 rounded-full">
          <Trophy className="w-16 h-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Тест завершен!</h2>
          <p className="text-muted-foreground">Твой результат: <span className="text-foreground font-bold">{testResult} из 5</span></p>
        </div>
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">
              "Отличная работа! Ты показал хорошие знания в области промпт-инжиниринга. Следующий шаг — применение этих навыков в реальном проекте."
            </p>
          </CardContent>
        </Card>
        <Button className="w-full" onClick={() => setTestResult(null)}>Вернуться к списку</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Твоя Аттестация</h1>
        <p className="text-muted-foreground mt-1">Пройди все этапы для повышения грейда</p>
        {questionsCount !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            {questionsCount > 0
              ? `📚 Загружено ${questionsCount} вопросов из БД`
              : '⚠️ Вопросы не найдены — запусти npm run seed'}
          </p>
        )}
      </header>

      <div className="space-y-4">
        {stages.map((stage) => (
          <Card key={stage.id} className={cn(
            "transition-all duration-300",
            stage.status === 'locked' ? 'opacity-60 grayscale' : 'hover:shadow-md',
            stage.status === 'active' ? 'border-primary/30 bg-primary/5' : 'bg-card'
          )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                stage.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                stage.status === 'active' ? 'bg-primary/20 text-primary' :
                'bg-muted text-muted-foreground'
              )}>
                <stage.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-heading">{stage.title}</CardTitle>
                  {stage.status === 'completed' && <span className="inline-flex items-center rounded-md border border-transparent bg-green-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">Готово</span>}
                  {stage.status === 'active' && <span className="inline-flex items-center rounded-md border border-primary px-2.5 py-0.5 text-xs font-semibold text-primary">Текущий</span>}
                  {stage.status === 'locked' && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <CardDescription className="text-xs mt-1 leading-relaxed">{stage.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground font-medium">Результат: <span className="text-foreground font-bold">{stage.score}</span></span>
                <Button 
                  size="sm" 
                  variant={stage.status === 'active' ? 'default' : 'outline'}
                  disabled={stage.status === 'locked'}
                  onClick={() => startTest(stage.id)}
                  className="font-bold px-6"
                >
                  {stage.status === 'completed' ? 'Повторить' : stage.status === 'active' ? 'Начать' : 'Закрыто'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


