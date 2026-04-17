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
  }, [theme])

  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  return { theme, isDark: theme === 'dark', toggle }
}
