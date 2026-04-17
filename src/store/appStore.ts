import { create } from 'zustand'
import {
  fetchCurrentUserProfile,
  fetchLatestUserResult,
  fetchLatestSimulatorResult,
  fetchLatestStage3Result,
  type Stage1Result,
  type Stage2Result,
  type Stage3Result,
} from '@/lib/api'
import { useTestStore } from './testStore'

interface AppState {
  userId: string | null
  userProfile: any | null
  latestResult: Stage1Result | null
  simulatorResult: Stage2Result | null
  stage3Result: Stage3Result | null
  isLoading: boolean
  isLoaded: boolean
  error: string | null

  // Actions
  loadAppData: (userId: string, force?: boolean) => Promise<void>
  clearAppData: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  userId: null,
  userProfile: null,
  latestResult: null,
  simulatorResult: null,
  stage3Result: null,
  isLoading: true, // Start with true to show skeletons while App is initializing
  isLoaded: false,
  error: null,

  loadAppData: async (userId: string, force = false) => {
    // If user changed, clear old data first
    if (get().userId && get().userId !== userId) {
      console.log('[store] User ID mismatch, clearing old state...')
      get().clearAppData()
    }

    if (get().isLoaded && !force && !get().error && get().userId === userId) return

    set({ isLoading: true, error: null, userId })
    try {
      console.log(`[store] Fetching data for user: ${userId}`)
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

  clearAppData: () => {
    console.log('[store] Clearing all app data...')
    
    // Reset test store too
    useTestStore.getState().resetTest()
    
    set({ 
      userId: null,
      userProfile: null, 
      latestResult: null, 
      simulatorResult: null, 
      stage3Result: null,
      isLoaded: false,
      isLoading: false,
      error: null
    })
  }
}))
