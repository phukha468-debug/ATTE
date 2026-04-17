import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';

const menuItems = [
  { icon: Bell, label: 'Уведомления', value: 'Вкл', action: 'Уведомления' },
  { icon: Shield, label: 'Безопасность', value: '', action: 'Безопасность' },
  { icon: Settings, label: 'Настройки', value: '', action: 'Настройки' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { userProfile, isLoading, clearAppData } = useAppStore();

  const fullName = userProfile?.full_name || 'Пользователь';
  const jobTitle = userProfile?.job_title || 'Сотрудник';
  const parts = userProfile?.full_name?.split(' ') || [];
  const initials = parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

  const handleLogout = async () => {
    console.log('[Profile] Logging out...')
    await supabase.auth.signOut()
    clearAppData()
    // Clear test store state
    localStorage.removeItem('test-store')
    navigate('/', { replace: true })
  }

  const handleMenuItem = (label: string) => {
    alert(`${label} — в разработке`);
  };

  return (
    <div className="space-y-6 min-h-[80vh] animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-4 py-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        {isLoading ? (
          <Skeleton className="w-28 h-28 rounded-full" />
        ) : (
          <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
        )}

        <div className="space-y-2 w-full flex flex-col items-center">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold font-heading">{fullName}</h1>
              <p className="text-muted-foreground font-medium mt-1">{jobTitle}</p>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleMenuItem(item.action)}
            >
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

      <Button variant="destructive" className="w-full flex items-center gap-2 py-6 font-bold" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        Выйти из аккаунта
      </Button>

      <div className="text-center pb-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Версия 2.0.5 • 66ai Platform</p>
      </div>
    </div>
  );
}
