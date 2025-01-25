import { create } from 'zustand';
//import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface AIState {
  mode: 'observing' | 'thinking' | 'speaking' | 'learning' | 'listening' ;
  confidence: number;
  contextDepth: number;
  learningProgress: number;
  personality: {
    adaptability: number;
    creativity: number;
    precision: number;
  };
  feedback: {
    visual: boolean;
    haptic: boolean;
    audio: boolean;
  };
  context: Record<string, any>;
}

interface AIActions {
  setMode: (mode: AIState['mode']) => void;
  updateConfidence: (value: number) => void;
  updateContext: (context: Partial<AIState['context']>) => void;
  updatePersonality: (updates: Partial<AIState['personality']>) => void;
  setFeedback: (updates: Partial<AIState['feedback']>) => void;
}

const initialState: AIState = {
  mode: 'observing',
  confidence: 0.95,
  contextDepth: 0,
  learningProgress: 0,
  personality: {
    adaptability: 0.8,
    creativity: 0.7,
    precision: 0.9
  },
  feedback: {
    visual: true,
    haptic: true,
    audio: false
  },
  context: {}
};

export const useAIStore = create<AIState & AIActions>()(
  devtools(
    (set) => ({
      ...initialState,
      setMode: (mode) => set({ mode }),
      updateConfidence: (confidence) => set({ confidence }),
      updateContext: (context) => set((state) => ({ 
        context: { ...state.context, ...context }
      })),
      updatePersonality: (updates) => set((state) => ({
        personality: { ...state.personality, ...updates }
      })),
      setFeedback: (updates) => set((state) => ({
        feedback: { ...state.feedback, ...updates }
      }))
    }),
    { name: 'AI Store' }
  )
);