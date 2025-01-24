import { useState, useCallback } from 'react';

export const useAIContext = (initialContext = {}) => {
  const [context, setContext] = useState(initialContext);
  const [history, setHistory] = useState([]);

  const updateContext = useCallback((newData) => {
    setContext(prev => {
      const updated = { ...prev, ...newData };
      setHistory(h => [...h, { timestamp: Date.now(), changes: newData }]);
      return updated;
    });
  }, []);

  return { context, updateContext, history };
};