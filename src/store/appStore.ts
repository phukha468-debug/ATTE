import { create } from 'zustand'
import { 
  fetchCurrentUserProfile, 
  fetchLatestUserResult, 
  fetchLatestSimulatorResult, 
  fetchLatestStage3Result,
  type TestResult 
} from '@/lib/api'

interface AppState {
  userProfile: any | null
  latestResult: TestResult | null
  simulatorResult: TestResult | null
  stage3Result: TestResult | null
  isLoading: boolean
  isLoaded: boolean
  error: string | null

  // Actions
  loadAppData: (force?: boolean) => Promise<void>
  clearAppData: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  userProfile: null,
  latestResult: null,
  simulatorResult: null,
  stage3Result: null,
  isLoading: false,
  isLoaded: false,
  error: null,

  loadAppData: async (force = false) => {
    if (get().isLoaded && !force && !get().error) return

    set({ isLoading: true, error: null })
    try {
      const [profile, result, simResult, s3Result] = await Promise.all([
        fetchCurrentUserProfile(),
        fetchLatestUserResult(),
        fetchLatestSimulatorResult(),
        fetchLatestStage3Result()
      ])

      set({ 
        userProfile: profile, 
        latestResult: result, 
        simulatorResult: simResult, 
        stage3Result: s3Result,
        isLoaded: true,
        isLoading: false 
      })
    } catch (err: any) {
      console.error('Failed to load app data:', err)
      set({ error: err.message, isLoading: false })
    }
  },

  clearAppData: () => set({ 
    userProfile: null, 
    latestResult: null, 
    simulatorResult: null, 
    stage3Result: null,
    isLoaded: false 
  })
}))
