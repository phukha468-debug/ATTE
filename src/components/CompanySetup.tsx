import { useState } from 'react'
import { Building2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { motion } from 'motion/react'

export function CompanySetup() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setIsNewUser, loadAppData, userId } = useAppStore()

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Минимум 2 символа')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Нет сессии')

      const res = await fetch('/api/company/setup', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Ошибка ${res.status}`)
      }

      // Refresh profile so company name updates everywhere
      if (userId) await loadAppData(userId, true)
      setIsNewUser(false)
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Добро пожаловать!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Введите название вашей компании
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Например: ООО Ромашка"
            maxLength={80}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            autoFocus
          />
          {error && <p className="text-xs text-destructive px-1">{error}</p>}
        </div>

        <Button
          className="w-full py-6 text-sm font-bold gap-2"
          onClick={handleSubmit}
          disabled={loading || name.trim().length < 2}
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><span>Продолжить</span><ArrowRight className="w-4 h-4" /></>
          }
        </Button>
      </motion.div>
    </div>
  )
}
