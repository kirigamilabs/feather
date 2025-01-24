import { useState, useCallback } from 'react';
import { useSpring } from '@react-spring/web'; //need to replace

export const useGestures = () => {
  const [gesture, setGesture] = useState(null);
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const handleGesture = useCallback((event) => {
    // Process gesture data
    setGesture(event.type);
  }, []);

  return { gesture, handleGesture };
};