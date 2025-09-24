export interface AIPersonality {
  adaptability: number;
  creativity: number;
  precision: number;
}

export interface AIContext {
  lastResponse?: string;
  marketSentiment?: 'bullish' | 'bearish' | 'neutral';
  riskLevel?: 'low' | 'moderate' | 'high';
  timestamp?: number;
  userPreferences?: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    tradingExperience?: 'beginner' | 'intermediate' | 'advanced';
    preferredAssets?: string[];
  };
}

export interface AIResponse {
  content: string;
  confidence: number;
  actions?: Action[];
  metadata?: {
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
    suggestedActions?: string[];
    reasoning?: string;
  };
}

export interface Action {
  type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_portfolio' | 'optimize_portfolio';
  params?: any;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}