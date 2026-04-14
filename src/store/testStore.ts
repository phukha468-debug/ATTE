import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/lib/api'

export interface Answer {
  question_id: string
  value: string | string[] | null  // string for open, selected option index/indices for mcq
  text?: string                     // raw text for open answers
}

interface TestState {
  // Data
  questions: Question[]
  currentIndex: number
  answers: Record<string, Answer>  // keyed by question_id
  isCompleted: boolean

  // Actions
  setQuestions: (questions: Question[]) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setAnswer: (questionId: string, answer: Partial<Answer>) => void
  getAnswer: (questionId: string) => Answer | undefined
  completeTest: () => void
  resetTest: () => void

  // Computed helpers (getters in implementation, plain props in interface)
  currentQuestion: Question | undefined
  progress: number               // 0-100
  answeredCount: number
  allAnswers: Answer[]
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      answers: {},
      isCompleted: false,

      setQuestions: (questions) => set({ questions, currentIndex: 0, answers: {}, isCompleted: false }),

      goToQuestion: (index) => set({ currentIndex: index }),

      nextQuestion: () => {
        const { currentIndex, questions } = get()
        if (currentIndex < questions.length - 1) {
          set({ currentIndex: currentIndex + 1 })
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get()
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 })
        }
      },

      setAnswer: (questionId, answer) =>
        set((state) => {
          const existing = state.answers[questionId]
          return {
            answers: {
              ...state.answers,
              [questionId]: {
                question_id: questionId,
                value: null,
                ...existing,
                ...answer,
              },
            },
          }
        }),

      getAnswer: (questionId) => {
        return get().answers[questionId]
      },

      completeTest: () => set({ isCompleted: true }),

      resetTest: () => set({ questions: [], currentIndex: 0, answers: {}, isCompleted: false }),

      get currentQuestion() {
        const { questions, currentIndex } = get()
        return questions[currentIndex]
      },

      get progress() {
        const { questions, currentIndex } = get()
        if (questions.length === 0) return 0
        return ((currentIndex + 1) / questions.length) * 100
      },

      get answeredCount() {
        return Object.keys(get().answers).length
      },

      get allAnswers() {
        return Object.values(get().answers)
      },
    }),
    {
      name: 'test-store',  // localStorage key
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        isCompleted: state.isCompleted,
      }),
    }
  )
)
