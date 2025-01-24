import { useState, useCallback } from 'react';
import { parseAIResponse } from '../utils/responseParser';

interface ChatResponse {
  text: string;
  actions?: Action[];
  transactions?: Transaction[];
  insights?: MarketInsight[];
}

export const useChatSystem = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingActions, setPendingActions] = useState<Action[]>([]);

  const processMessage = useCallback(async (message: string) => {
    const response = await fetch('/api/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const reader = response.body?.getReader();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader?.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      fullResponse += chunk;
      
      const { text, actions, transactions } = parseAIResponse(fullResponse);
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: text,
        metadata: { actions, transactions }
      }]);
    }
  }, []);

  return { messages, processMessage, pendingActions };
};