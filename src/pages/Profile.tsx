import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Bell, label: 'Уведомления', value: 'Вкл' },
  { icon: Shield, label: 'Безопасность', value: '' },
  { icon: Settings, label: 'Настройки', value: '' },
];

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4 py-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
        <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
          <AvatarImage src="https://picsum.photos/seed/anna/200" />
          <AvatarFallback>АС</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-heading">Анна Смирнова</h1>
          <p className="text-muted-foreground font-medium mt-1">Менеджер по маркетингу</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {menuItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-lg">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-muted-foreground">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Выйти из аккаунта
      </Button>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Версия 2.0.4 • 66ai Platform</p>
      </div>
    </div>
  );
}
