import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Standard',
    price: '5 500 ₽',
    description: 'Максимальная автоматизация',
    features: [
      'Доступ к Telegram-боту',
      'Доступ к ИИ-симулятору',
      'Автогенерация отчётов',
      'Карта автоматизации',
    ],
    recommended: false,
    color: 'bg-emerald-500/5 border-emerald-500/20',
    iconColor: 'text-emerald-500',
    btnVariant: 'outline' as const,
  },
  {
    name: 'Premium',
    price: '12 000 ₽',
    description: 'Автоматизация + Экспертиза',
    features: [
      'Все из Standard',
      'Комментарии эксперта к промптам',
      'Созвон-онбординг с экспертом',
      'Выделенный эксперт 24/7',
    ],
    recommended: true,
    color: 'bg-indigo-500/5 border-indigo-500/20',
    iconColor: 'text-indigo-500',
    btnVariant: 'default' as const,
  },
];

export default function Pricing() {
  const handleSelectPlan = (planName: string) => {
    const webapp = (window as any).Telegram?.WebApp;
    if (webapp) {
      webapp.showConfirm(`Вы хотите выбрать тариф ${planName}?`, (confirmed: boolean) => {
        if (confirmed) {
          webapp.showAlert('Перенаправляем на оплату...');
        }
      });
    } else {
      alert(`Вы выбрали тариф ${planName}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Тарифные планы</h1>
        <p className="text-muted-foreground">Выберите подходящий уровень поддержки</p>
      </header>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
              plan.color,
              plan.recommended ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
            )}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Популярно
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-heading">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/ сотрудник</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm">
                  <Check className={cn("w-4 h-4 mt-0.5 shrink-0", plan.iconColor)} />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full font-bold" 
                variant={plan.btnVariant}
                onClick={() => handleSelectPlan(plan.name)}
              >
                Выбрать тариф
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}


