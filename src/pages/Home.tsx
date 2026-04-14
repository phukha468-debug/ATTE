import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain, Target, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="space-y-6 relative">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-heading">Привет, Анна!</h1>
          <p className="text-muted-foreground mt-1">Твой прогресс в ИИ-аттестации</p>
        </div>
        <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-sm">
          <AvatarImage src="https://picsum.photos/seed/anna/200" />
          <AvatarFallback>АС</AvatarFallback>
        </Avatar>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Навыки</span>
            </div>
            <div className="text-3xl font-bold">78%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">+5% за неделю</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/10 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <Target className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground/70">Цель</span>
            </div>
            <div className="text-3xl font-bold">Грейд 4</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">Осталось 2 этапа</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Общий прогресс
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Этап 1: Базовые знания</span>
                <span className="text-green-500 font-medium">Завершено</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Этап 2: ИИ-Симулятор</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Этап 3: Микро-проект</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Рекомендации 66ai</h2>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className="bg-primary/10 p-2 rounded-full h-fit">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Улучши навыки промптинга</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Твои результаты в симуляторе показывают, что стоит поработать над структурой ролевых инструкций.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs mt-2">Пройти обучение →</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20">
        Продолжить аттестацию
      </Button>
    </div>
  );
}
