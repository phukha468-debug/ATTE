import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, ChevronRight, Clock, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { simulatorData, Direction, Role, SimulatorTask } from '@/lib/simulatorData';

type Step = 'direction' | 'role' | 'brief';

export default function SimulatorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('direction');
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTask, setSelectedTask] = useState<SimulatorTask | null>(null);

  const handleSelectDirection = (dir: Direction) => {
    setSelectedDirection(dir);
    setStep('role');
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    // Для простоты берем первую базовую задачу
    const task = role.tasks.find(t => t.level === 'basic') || role.tasks[0];
    setSelectedTask(task);
    setStep('brief');
  };

  const goBack = () => {
    if (step === 'brief') setStep('role');
    else if (step === 'role') setStep('direction');
  };

  return (
    <div className="space-y-4 font-sans antialiased overflow-x-hidden pb-8">
      <header className="py-2 flex items-center gap-2">
        {step !== 'direction' && (
          <Button variant="ghost" size="icon" onClick={goBack} className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight">ИИ-Симулятор</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Этап 2</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'direction' && (
          <motion.div
            key="direction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-2"
          >
            <h2 className="text-sm font-bold px-1 col-span-2">Выберите направление</h2>
            {simulatorData.map((dir) => (
              <Card 
                key={dir.id} 
                className="cursor-pointer hover:bg-accent/5 transition-colors border-none bg-card shadow-sm flex flex-col items-center justify-center p-3 text-center gap-2"
                onClick={() => handleSelectDirection(dir)}
              >
                <span className="text-3xl">{dir.icon}</span>
                <span className="font-bold text-[11px] leading-tight">{dir.title}</span>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 'role' && selectedDirection && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-bold px-1 flex items-center gap-2">
              <span className="text-muted-foreground">Направление:</span> {selectedDirection.title}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {selectedDirection.roles.map((role) => (
                <Card 
                  key={role.id} 
                  className="cursor-pointer hover:bg-accent/5 transition-colors border-none bg-card shadow-sm"
                  onClick={() => handleSelectRole(role)}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-bold">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 flex justify-between items-center">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                      {role.tasks.length > 0 ? `${role.tasks.length} Задач доступно` : 'В разработке'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'brief' && selectedRole && (
          <motion.div
            key="brief"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {selectedTask ? (
              <>
                <Card className="border-none bg-card shadow-md overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter bg-background">
                        {selectedTask.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{selectedTask.benchmarkMinutes} мин.</span>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                       Ваша задача
                    </CardTitle>
                    <CardDescription className="text-[10px] font-medium leading-relaxed">
                       Роль: {selectedRole?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                        <Info className="w-3 h-3" /> Контекст
                      </h4>
                      <p className="text-xs leading-relaxed">{selectedTask.context}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                        <Target className="w-3 h-3" /> Задание
                      </h4>
                      <p className="text-xs font-bold leading-relaxed">{selectedTask.objective}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> Формат результата
                      </h4>
                      <p className="text-xs leading-relaxed italic">{selectedTask.format}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-3 bg-accent/5 rounded-lg border border-accent/10 flex gap-3 items-center">
                   <div className="p-2 bg-accent/10 rounded-full h-fit">
                      <Info className="w-4 h-4 text-accent-foreground" />
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-snug">
                      Для решения этой задачи используйте любые инструменты ИИ. Ваша цель — сэкономить время, сохранив качество.
                   </p>
                </div>

                <Button 
                  className="w-full py-6 text-sm font-bold shadow-lg shadow-primary/20"
                  onClick={() => navigate(`/sandbox/${selectedTask.id}`)}
                >
                  Начать экзамен
                </Button>
              </>
            ) : (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-bold">Задания в разработке</h2>
                <p className="text-sm text-muted-foreground">
                  Задания для роли <strong>{selectedRole.title}</strong> находятся в разработке. 
                  Выберите другую роль или попробуйте базовый тест в другом направлении.
                </p>
                <Button variant="outline" onClick={goBack} className="mt-4">
                  Вернуться к выбору
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
