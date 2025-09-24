import {Action, AIContext} from '@/types/ai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  actions?: Action[];
  metadata?: {
    confidence?: number;
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
    processingTime?: number;
  };
  isStreaming?: boolean;
}

export interface ConversationHistory {
  messages: Message[];
  context: AIContext;
  startTime: number;
  lastActivity: number;
}