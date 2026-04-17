import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { loginWithTelegram } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

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
  const { loadAppData, clearAppData, userProfile } = useAppStore()
  const [authState, setAuthState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    // 8-second timeout guard to prevent infinite splash screen
    const authTimer = setTimeout(() => {
      setAuthState('error')
      setErrorMessage('Превышено время ожидания авторизации (8 сек)')
    }, 8000)

    // Listener for session changes (logout/login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[auth] event: ${event}, userId: ${session?.user?.id}`)
      if (event === 'SIGNED_OUT') {
        clearAppData()
        navigate('/', { replace: true })
      }
    })

    async function initAuth() {
      try {
        console.log('[auth-debug] 1. Starting getSession...')
        let { data: { session } } = await supabase.auth.getSession()

        // Strict ID mismatch check for TMA (Telegram Mini App)
        // WebView shares localStorage between accounts on one device, so we must verify TG ID
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
        const currentTgId = tgUser?.id

        if (session && currentTgId) {
          const sessionTgId = session.user.user_metadata?.tg_id
          // If metadata is missing or ID doesn't match current Telegram user — force logout
          if (!sessionTgId || String(sessionTgId) !== String(currentTgId)) {
            console.warn(`[auth] ⚠ Session mismatch: session=${sessionTgId}, current=${currentTgId}. Logging out...`)
            await supabase.auth.signOut()
            clearAppData()
            session = null
          }
        }

        console.log('[auth-debug] 2. Session found:', !!session)

        if (!session) {
          console.log('[auth-debug] 2b. No session — calling loginWithTelegram...')
          await loginWithTelegram()
          console.log('[auth-debug] 2c. loginWithTelegram completed, fetching new session...')
          const { data: { session: newSession } } = await supabase.auth.getSession()
          session = newSession
        }

        if (!session) {
          throw new Error('Не удалось установить сессию после авторизации')
        }

        // Load all app data (including profile) through store with userId
        console.log('[auth-debug] 3. Loading app data...')
        await loadAppData(session.user.id)
        
        const profile = useAppStore.getState().userProfile
        console.log('[auth-debug] 3b. Profile loaded:', profile ? `role=${profile.role}` : 'null')

        if (profile) {
          // Role-based routing logic
          const isManager = profile.role === 'manager' || profile.role === 'admin'
          const path = location.pathname

          if (isManager && path === '/') {
            navigate('/dashboard', { replace: true })
          } else if (!isManager && path === '/dashboard') {
            navigate('/tests', { replace: true })
          }
        }

        setAuthState('ready')
      } catch (err: any) {
        console.error('[auth-debug] ✗ Auth initialization error:', err)
        setErrorMessage(err.message || 'Не удалось авторизоваться')
        setAuthState('error')
      } finally {
        clearTimeout(authTimer)
      }
    }

    initAuth()

    return () => {
      clearTimeout(authTimer)
      subscription.unsubscribe()
    }
  }, [loadAppData, clearAppData, navigate, location.pathname]);

  const userRole = userProfile?.role || ''
  const isNoNavPage = location.pathname.startsWith('/sandbox/') || location.pathname === '/simulator/result'

  if (authState === 'loading') {
    return <SplashScreen />;
  }

  if (authState === 'error') {
    return <ErrorScreen message={errorMessage} />;
  }

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300",
      !isNoNavPage && "pb-24"
    )} data-role={userRole || ''}>
      {!isNoNavPage && (
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className={cn(
            "fixed top-4 right-4 z-40 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
            "shadow-neumorphic dark:shadow-neon-cyan",
            "bg-card text-foreground hover:scale-110 active:scale-95"
          )}
        >
          {isDark
            ? <Sun className="w-4 h-4 text-primary" />
            : <Moon className="w-4 h-4 text-primary" />
          }
        </button>
      )}
      <main className={cn(
        "max-w-md mx-auto w-full",
        !isNoNavPage && "px-4 pt-6"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isNoNavPage && <BottomNav />}
    </div>
  );
}
