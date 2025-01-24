import { useState, useEffect, useRef } from 'react';

export const useAudio = (audioRef) => {
  const [audioData, setAudioData] = useState(new Float32Array());
  const processorRef = useRef(null);

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    
    processorRef.current = processor;
    
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      setAudioData(input);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  return { startListening, audioData };
};