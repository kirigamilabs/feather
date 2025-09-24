import { useCallback, useRef } from 'react';
import { useAIStore } from '../state/aiState';

interface StreamedResponse {
  type: 'content' | 'mode_change' | 'error';
  content?: string;
  mode?: 'thinking' | 'speaking' | 'observing';
  confidence?: number;
  actions?: Array<{
    type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_portfolio';
    params?: any;
  }>;
  metadata?: any;
  isComplete?: boolean;
  message?: string;
}

export const useAICore = () => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  
  const { 
    mode, 
    confidence,
    context,
    setMode,
    updateConfidence,
    updateContext
  } = useAIStore();

  const processInput = useCallback(async (
    input: string,
    onStream?: (content: string, isComplete: boolean) => void,
    onActionReceived?: (actions: any[]) => void
  ) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    // Add user message to history
    conversationHistoryRef.current.push({ role: 'user', content: input });

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          context,
          conversationHistory: conversationHistoryRef.current
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let currentConfidence = confidence;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data: StreamedResponse = JSON.parse(line);
            
            switch (data.type) {
              case 'mode_change':
                if (data.mode) {
                  setMode(data.mode);
                }
                break;
                
              case 'content':
                if (data.content) {
                  fullResponse += data.content;
                  onStream?.(data.content, data.isComplete || false);
                  
                  if (data.isComplete) {
                    // Update confidence if provided
                    if (data.confidence) {
                      currentConfidence = data.confidence;
                      updateConfidence(data.confidence);
                    }
                    
                    // Handle actions
                    if (data.actions) {
                      onActionReceived?.(data.actions);
                    }
                    
                    // Update context with metadata
                    if (data.metadata) {
                      updateContext({ 
                        lastResponse: fullResponse,
                        ...data.metadata,
                        timestamp: Date.now()
                      });
                    }
                  }
                }
                break;
                
              case 'error':
                throw new Error(data.message || 'AI processing error');
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', parseError);
          }
        }
      }
      
      // Add AI response to history
      conversationHistoryRef.current.push({ role: 'assistant', content: fullResponse });
      
      // Keep history manageable (last 10 exchanges)
      if (conversationHistoryRef.current.length > 20) {
        conversationHistoryRef.current = conversationHistoryRef.current.slice(-20);
      }
      
      return {
        content: fullResponse,
        confidence: currentConfidence
      };
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return { content: '', confidence: 0 };
      }
      
      console.error('AI Processing error:', error);
      setMode('observing');
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [mode, confidence, context, setMode, updateConfidence, updateContext]);

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setMode('observing');
    }
  }, [setMode]);

  const clearHistory = useCallback(() => {
    conversationHistoryRef.current = [];
    updateContext({});
  }, [updateContext]);

  return {
    mode,
    confidence,
    processInput,
    cancelProcessing,
    clearHistory
  };
};