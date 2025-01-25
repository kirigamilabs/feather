'use client'
import { useState, useEffect, useRef } from 'react';
import { useAIStore } from '@/state/aiState';

interface AudioAnalysis {
  volume: number;
  frequency: number[];
  isSpeaking: boolean;
}

export const useAudio = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysis>({
    volume: 0,
    frequency: [],
    isSpeaking: false
  });
  
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array());
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const { setMode } = useAIStore();

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 2048;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      setIsListening(true);
      setMode('listening');
      
      const processAudio = () => {
        if (!analyzer) return;
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const isSpeaking = volume > 30;
        
        const audioDataArray = new Float32Array(analyzer.frequencyBinCount);
        analyzer.getFloatTimeDomainData(audioDataArray);
        setAudioData(audioDataArray);
        
        setAnalysis({
          volume,
          frequency: Array.from(dataArray),
          isSpeaking
        });
        
        requestAnimationFrame(processAudio);
      };
      
      processAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsListening(false);
    setMode('observing');
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    isListening,
    analysis,
    audioData,
    startListening,
    stopListening
  };
};