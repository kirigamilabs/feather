'use client'
import React, { createContext, useContext, useRef } from 'react';
import { useNeuralAnimation } from '@/hooks/useNeuralAnimation';
import { useAudio } from '@/hooks/useAudio';
import { useAIStore } from '@/state/aiState';

interface AIContextValue {
  neuralRef: React.RefObject<HTMLCanvasElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  activateNodes: (nodes: number[]) => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  audioAnalysis: {
    volume: number;
    frequency: number[];
    isSpeaking: boolean;
  };
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const neuralRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { activateNodes } = useNeuralAnimation(neuralRef);
  const { startListening, stopListening, analysis: audioAnalysis } = useAudio(audioRef);

  const value: AIContextValue = {
    neuralRef,
    audioRef,
    activateNodes,
    startListening,
    stopListening,
    audioAnalysis
  };

  return (
    <AIContext.Provider value={value}>
      <canvas ref={neuralRef} className="fixed inset-0 pointer-events-none opacity-50" />
      <audio ref={audioRef} className="hidden" />
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};