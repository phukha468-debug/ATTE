import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { simulatorData } from '@/lib/simulatorData';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SandboxPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я готов помочь с задачей. Что нужно сделать?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Найти данные задачи по ID
  const task = simulatorData
    .flatMap(d => d.roles)
    .flatMap(r => r.tasks)
    .find(t => t.id === taskId);

  // Авто-ресайз текстового поля
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Таймер
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isJudging) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error: any) {
      console.error('[Sandbox] Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Ошибка: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    if (messages.length < 2 || isJudging) return;
    
    setIsJudging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get user profile to pass IDs explicitly as requested
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      const response = await fetch('/api/ai/judge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          task, 
          chatHistory: messages,
          userId: user?.id,
          companyId: profile?.company_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Judging failed: ${response.status}`);
      }
      const result = await response.json();
      navigate('/simulator/result', { state: result });
    } catch (error: any) {
      console.error('[Sandbox] Judging error:', error);
      alert(`Ошибка при оценке: ${error.message}`);
    } finally {
      setIsJudging(false);
    }
  };

  if (!task) return <div className="p-8 text-center">Задача не найдена</div>;

  return (
    <div className="fixed inset-0 h-[100dvh] bg-background flex flex-col font-sans overflow-hidden">
      <AnimatePresence>
        {isJudging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-bold">Claude Sonnet анализирует ваши промпты...</h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
              Это может занять до 20 секунд. ИИ оценивает качество ваших инструкций и эффективность решения задачи.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="p-3 border-b bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xs font-bold truncate max-w-[150px]">Sandbox: {task.id}</h1>
            <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
              <Clock className="w-3 h-3" />
              <span>{formatTime(seconds)}</span>
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold gap-1" onClick={handleFinish}>
          <CheckCircle2 className="w-3 h-3" /> Завершить
        </Button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-accent/10 text-foreground rounded-tl-none border border-accent/10"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-accent/5 text-muted-foreground rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2 border border-accent/5">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-medium italic">ИИ печатает...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-card shrink-0 pb-safe">
        <div className="max-w-md mx-auto flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Введите сообщение..."
              className="w-full bg-accent/5 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none min-h-[44px] border border-accent/10 block"
              rows={1}
            />
          </div>
          <Button 
            size="icon" 
            className="rounded-full w-11 h-11 shrink-0 shadow-lg shadow-primary/20 mb-0.5"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isJudging}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[8px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold">
          Используйте ИИ как помощника для решения задачи
        </p>
      </div>
    </div>
  );
}
