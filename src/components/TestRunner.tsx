import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { geminiService } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export function TestRunner({ category, onComplete }: { category: string, onComplete: (score: number) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await geminiService.generateTestQuestions(category, 'Менеджер по маркетингу');
        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [category]);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (idx === questions[currentIdx].correct_answer_index) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(c => c + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      onComplete(score);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Генерируем вопросы с помощью ИИ...</p>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span>Вопрос {currentIdx + 1} из {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold leading-tight font-heading">{q.question}</h2>
          
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isCorrect = idx === q.correct_answer_index;
              const isSelected = idx === selectedIdx;
              
              let variant = "outline";
              if (isAnswered) {
                if (isCorrect) variant = "default";
                else if (isSelected) variant = "destructive";
              }

              return (
                <Button
                  key={idx}
                  variant={variant as any}
                  className={cn(
                    "w-full justify-start text-left h-auto py-4 px-4 whitespace-normal transition-all duration-300 rounded-2xl border-2",
                    isAnswered && isCorrect ? 'bg-green-500 hover:bg-green-500 border-green-500 text-white' : 
                    isAnswered && isSelected && !isCorrect ? 'bg-red-500/10 border-red-500 text-red-600' :
                    !isAnswered && isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
                      isAnswered && isCorrect ? 'border-white text-white' : 
                      isAnswered && isSelected && !isCorrect ? 'border-red-500 text-red-600' :
                      'border-muted-foreground/30 text-muted-foreground'
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                selectedIdx === q.correct_answer_index ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedIdx === q.correct_answer_index ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-bold">
                  {selectedIdx === q.correct_answer_index ? 'Верно!' : 'Не совсем так'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {q.explanation}
              </p>
              <Button className="w-full mt-4" onClick={nextQuestion}>
                {currentIdx + 1 === questions.length ? 'Завершить' : 'Следующий вопрос'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
