import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchCurrentUserProfile } from '@/lib/api';

const menuItems = [
  { icon: Bell, label: 'Уведомления', value: 'Вкл', action: 'Уведомления' },
  { icon: Shield, label: 'Безопасность', value: '', action: 'Безопасность' },
  { icon: Settings, label: 'Настройки', value: '', action: 'Настройки' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [initials, setInitials] = useState('?');

  useEffect(() => {
    async function loadProfile() {
      const profile = await fetchCurrentUserProfile();
      if (profile) {
        setFullName(profile.full_name || 'Пользователь');
        setJobTitle(profile.job_title || 'Сотрудник');
        const parts = profile.full_name?.split(' ') || [];
        setInitials(parts.map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?');
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear localStorage and reload to re-trigger auth flow
    localStorage.clear();
    window.location.reload();
  };

  const handleMenuItem = (label: string) => {
    // Toast-like notification
    alert(`${label} — в разработке`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4 py-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
        <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
          <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-heading">{fullName}</h1>
          <p className="text-muted-foreground font-medium mt-1">{jobTitle}</p>
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

      <Button variant="destructive" className="w-full flex items-center gap-2" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        Выйти из аккаунта
      </Button>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Версия 2.0.4 • 66ai Platform</p>
      </div>
    </div>
  );
}
