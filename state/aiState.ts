// store/aiState.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIState {
  mode: 'observing' | 'thinking' | 'speaking' | 'learning';
  context: Record<string, any>;
  confidence: number;
  learningProgress: number;
  updateMode: (mode: AIState['mode']) => void;
  updateContext: (context: Partial<AIState['context']>) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      mode: 'observing',
      context: {},
      confidence: 0.95,
      learningProgress: 0,
      updateMode: (mode) => set({ mode }),
      updateContext: (context) => 
        set((state) => ({ 
          context: { ...state.context, ...context },
          confidence: calculateConfidence(context)
        }))
    }),
    {
      name: 'ai-state',
      partialize: (state) => ({
        context: state.context,
        learningProgress: state.learningProgress
      })
    }
  )
);

const calculateConfidence = (context: Record<string, any>): number => {
  // Implement confidence calculation logic
  return 0.95;
};