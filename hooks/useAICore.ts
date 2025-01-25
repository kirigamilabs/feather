import { useCallback, useEffect, useRef } from 'react';
import { useAIStore } from '../state/aiState';
import { useAudio } from './useAudio';
import { useNeuralAnimation } from './useNeuralAnimation';

export const useAICore = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const neuralRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    mode, 
    confidence,
    setMode,
    updateConfidence,
    updateContext
  } = useAIStore();

  const { startListening, audioData } = useAudio(audioRef);
  const { activateNodes } = useNeuralAnimation(neuralRef);

  const processInput = useCallback(async (input: string) => {
    setMode('thinking');
    
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, context: useAIStore.getState().context })
      });

      const reader = response.body!.getReader();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const chunks = text.split('\r\n').filter(Boolean);
        
        for (const chunk of chunks) {
          const data = JSON.parse(chunk);
          fullResponse += data.content;
        }
      }
      setMode('observing');
      return fullResponse;
    } catch (error) {
      console.error('AI Processing error:', error);
      throw error;
    }
  }, [setMode]);

  return {
    mode,
    confidence,
    processInput,
    startListening,
    audioData,
    neuralRef,
    audioRef
  };
};