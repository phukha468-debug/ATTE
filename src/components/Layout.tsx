import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { loginWithTelegram } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { fetchCurrentUserProfile } from '@/lib/api';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Вход через Telegram...</p>
      </motion.div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Ошибка авторизации</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authState, setAuthState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          await loginWithTelegram();
        }

        // Fetch user profile for role-based routing
        const profile = await fetchCurrentUserProfile()
        if (profile) {
          setUserRole(profile.role)

          // Если менеджер/админ зашёл на главную — редирект на дашборд
          // Если employee пытается зайти на дашборд — редирект на tests
          const isManager = profile.role === 'manager' || profile.role === 'admin'
          const path = location.pathname

          if (isManager && path === '/') {
            navigate('/dashboard', { replace: true })
          } else if (!isManager && path === '/dashboard') {
            navigate('/tests', { replace: true })
          }
        }

        setAuthState('ready');
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setErrorMessage(err.message || 'Не удалось авторизоваться');
        setAuthState('error');
      }
    }

    initAuth();
  }, []);

  if (authState === 'loading') {
    return <SplashScreen />;
  }

  if (authState === 'error') {
    return <ErrorScreen message={errorMessage} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24" data-role={userRole || ''}>
      <main className="max-w-md mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
