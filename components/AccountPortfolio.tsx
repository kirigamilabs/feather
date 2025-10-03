import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/Button';

interface Position {
  id: string;
  protocol: string;
  type: 'lending' | 'staking' | 'liquidity' | 'farming' | 'spot';
  token: string;
  amount: number;
  value: number;
  apy: number;
  health: number; // 0-1, for lending positions
  chain: string;
  logo: string;
}

interface PortfolioSummary {
  totalValue: number;
  pnl24h: number;
  pnlPercent: number;
  activePositions: number;
  totalYield: number;
}

// Mock data - replace with real API
const mockSummary: PortfolioSummary = {
  totalValue: 147823.45,
  pnl24h: 2341.23,
  pnlPercent: 1.61,
  activePositions: 12,
  totalYield: 8.4
};

const mockPositions: Position[] = [
  {
    id: '1',
    protocol: 'Aave',
    type: 'lending',
    token: 'USDC',
    amount: 25000,
    value: 25000,
    apy: 4.2,
    health: 0.85,
    chain: 'Ethereum',
    logo: '🏦'
  },
  {
    id: '2',
    protocol: 'Uniswap V3',
    type: 'liquidity',
    token: 'ETH/USDC',
    amount: 5.2,
    value: 18450,
    apy: 12.8,
    health: 0.92,
    chain: 'Ethereum',
    logo: '🦄'
  },
  {
    id: '3',
    protocol: 'Lido',
    type: 'staking',
    token: 'stETH',
    amount: 32.1,
    value: 89234.12,
    apy: 3.8,
    health: 1,
    chain: 'Ethereum',
    logo: '🔥'
  }
];

export const AccountPortfolio = () => {
  const [selectedTimeframe, setTimeframe] = useState('24h');
  const [positions] = useState<Position[]>(mockPositions);
  const [summary] = useState<PortfolioSummary>(mockSummary);

  const AIInsights = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Activity className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold">AI Portfolio Analysis</h3>
          <p className="text-sm text-muted-foreground">Last updated 2 minutes ago</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Strong Diversification</p>
            <p className="text-sm text-muted-foreground">
              Your portfolio shows good risk distribution across DeFi protocols. 
              Consider increasing exposure to yield farming opportunities.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Health Score Alert</p>
            <p className="text-sm text-muted-foreground">
              Your Aave position health factor is at 1.2. Consider adding collateral 
              or reducing borrowed amount for safety.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Yield Optimization</p>
            <p className="text-sm text-muted-foreground">
              Moving 10% of your USDC to Compound could increase your yield by 0.8% APY.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <Button size="sm" variant="outline" className="w-full">
          View Detailed Analysis
        </Button>
      </div>
    </motion.div>
  );

  const PortfolioSummaryCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Value</span>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            ${summary.totalValue.toLocaleString()}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            summary.pnl24h > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {summary.pnl24h > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {summary.pnl24h > 0 ? '+' : ''}${summary.pnl24h.toLocaleString()} 
              ({summary.pnlPercent > 0 ? '+' : ''}{summary.pnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Active Positions</span>
          <PieChart className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{summary.activePositions}</p>
        <p className="text-sm text-muted-foreground">Across 8 protocols</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Avg. Yield</span>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-green-500">{summary.totalYield}%</p>
        <p className="text-sm text-muted-foreground">Weighted APY</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Health Score</span>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold text-yellow-500">Good</p>
        <p className="text-sm text-muted-foreground">1 position at risk</p>
      </motion.div>
    </div>
  );

  const PositionCard = ({ position }: { position: Position }) => {
    const getHealthColor = (health: number) => {
      if (health > 0.8) return 'text-green-500';
      if (health > 0.5) return 'text-yellow-500';
      return 'text-red-500';
    };

    const getTypeIcon = (type: Position['type']) => {
      switch (type) {
        case 'lending': return '🏦';
        case 'staking': return '🔥';
        case 'liquidity': return '🌊';
        case 'farming': return '🌾';
        default: return '💎';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{position.logo}</div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 break-words">
                {position.protocol}
                <span className="text-xs bg-secondary/20 px-2 py-1 rounded-full whitespace-nowrap">
                  {position.type}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">{position.chain}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Position</p>
            <p className="font-medium break-words">
              {position.amount.toLocaleString()} {position.token}
            </p>
            <p className="text-sm text-muted-foreground">
              ${position.value.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="font-medium text-green-500">{position.apy}%</p>
          </div>
        </div>

        {position.type === 'lending' && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health Factor</span>
              <span className={`text-sm font-medium ${getHealthColor(position.health)}`}>
                {position.health.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 h-1 bg-background rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  position.health > 0.8 ? 'bg-green-500' :
                  position.health > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${position.health * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const TimeframeSelector = () => (
    <div className="flex items-center gap-2">
      {['1h', '24h', '7d', '30d'].map((tf) => (
        <Button
          key={tf}
          size="sm"
          variant={selectedTimeframe === tf ? "default" : "ghost"}
          onClick={() => setTimeframe(tf)}
        >
          {tf}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold break-words">Portfolio Overview</h1>
          <p className="text-muted-foreground break-words">Track your DeFi positions and yields</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeframeSelector />
          <Button size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
      >
        <span className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
          🚀 Coming Soon
        </span>
      </motion.div>

      {/* AI Analysis */}
      <AIInsights />

      {/* Summary Cards */}
      <PortfolioSummaryCard />

      {/* Positions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Positions</h2>
          <Button size="sm" variant="outline">
            Add Position
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      </div>
    </div>
  );
};