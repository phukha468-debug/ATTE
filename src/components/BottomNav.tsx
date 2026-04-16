import { NavLink } from 'react-router-dom';
import { Home, ClipboardCheck, BarChart3, User, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

const employeeNavItems = [
  { icon: Home, label: 'Главная', path: '/' },
  { icon: ClipboardCheck, label: 'Тесты', path: '/tests' },
  { icon: BarChart3, label: 'Отчеты', path: '/reports' },
  { icon: CreditCard, label: 'Тарифы', path: '/pricing' },
  { icon: User, label: 'Профиль', path: '/profile' },
];

const managerNavItems = [
  { icon: Home, label: 'Главная', path: '/' },
  { icon: Users, label: 'Дашборд', path: '/dashboard' },
  { icon: ClipboardCheck, label: 'Тесты', path: '/tests' },
  { icon: CreditCard, label: 'Тарифы', path: '/pricing' },
  { icon: User, label: 'Профиль', path: '/profile' },
];

export function BottomNav() {
  const { userProfile } = useAppStore();
  const role = userProfile?.role;

  const navItems = role === 'manager' || role === 'admin' ? managerNavItems : employeeNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-4 py-2 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
