import { useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark'
    return (localStorage.getItem('66ai-theme') as Theme) ?? 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('66ai-theme', theme)
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      const bgColor = theme === 'dark' ? '#0D1520' : '#EAE5DE'
      try { tg.setHeaderColor(bgColor) } catch {}
      try { tg.setBackgroundColor(bgColor) } catch {}
    }
  }, [theme])

  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  return { theme, isDark: theme === 'dark', toggle }
}
