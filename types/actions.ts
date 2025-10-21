export interface TradeAction {
  type: 'execute_trade';
  params: {
    fromToken: string;
    toToken: string;
    amount: number;
    slippage?: number;
    gasPrice?: string;
  };
}

export interface WalletAction {
  type: 'connect_wallet';
  params?: {
    preferredWallet?: 'metamask' | 'walletconnect' | 'coinbase';
  };
}

export interface AnalysisAction {
  type: 'analyze_market';
  params: {
    assets?: string[];
    timeframe?: '1h' | '4h' | '1d' | '1w' | '1m';
    analysisType?: 'technical' | 'fundamental' | 'sentiment';
  };
}

export interface PortfolioAction {
  type: 'show_wallet';
  params?: {
    view?: 'overview' | 'positions' | 'history' | 'analytics';
  };
}

export type ActionType = TradeAction | WalletAction | AnalysisAction | PortfolioAction;