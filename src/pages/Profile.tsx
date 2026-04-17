import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Bell, Shield, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';

const menuItems = [
  { icon: Bell,    label: 'Уведомления', value: 'Вкл',  action: 'Уведомления' },
  { icon: Shield,  label: 'Безопасность', value: '',    action: 'Безопасность' },
  { icon: Settings,label: 'Настройки',   value: '',    action: 'Настройки' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { userProfile, isLoading, clearAppData } = useAppStore();
  const { isDark, toggle } = useTheme();

  const fullName  = userProfile?.full_name || 'Пользователь';
  const jobTitle  = userProfile?.job_title || 'Сотрудник';
  const parts     = userProfile?.full_name?.split(' ') || [];
  const initials  = parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAppData();
    localStorage.removeItem('test-store');
    navigate('/', { replace: true });
  };

  const handleMenuItem = (label: string) => alert(`${label} — в разработке`);

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-20">

      {/* ── Аватар + имя ── */}
      <div className="flex flex-col items-center text-center pt-2 pb-1 gap-2">
        {isLoading ? (
          <Skeleton className="w-16 h-16 rounded-full" />
        ) : (
          <Avatar className="w-16 h-16 border-2 border-background shadow-neumorphic">
            <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
        )}
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-5 w-36 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ) : (
          <div>
            <h1 className="text-lg font-bold leading-tight">{fullName}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{jobTitle}</p>
          </div>
        )}
      </div>

      {/* ── Настройки ── */}
      <Card>
        <CardContent className="p-0 divide-y divide-border/40">
          {/* Тема */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={toggle}
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted/60 p-1.5 rounded-lg">
                {isDark
                  ? <Sun  className="w-4 h-4 text-primary" />
                  : <Moon className="w-4 h-4 text-muted-foreground" />}
              </div>
              <span className="text-sm font-medium">Тема оформления</span>
            </div>
            <span className="text-xs text-muted-foreground">{isDark ? 'Тёмная' : 'Светлая'}</span>
          </div>

          {menuItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => handleMenuItem(item.action)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted/60 p-1.5 rounded-lg">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Выход ── */}
      <Button
        variant="destructive"
        className="w-full flex items-center gap-2 py-3 text-sm font-semibold"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
        Выйти из аккаунта
      </Button>

      <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase pt-1">
        Версия 2.0.5 · 66ai Platform
      </p>
    </div>
  );
}
