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
