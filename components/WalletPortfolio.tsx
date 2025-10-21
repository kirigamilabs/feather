import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  Eye,
  Send,
  Plus
} from 'lucide-react';
import { Button } from '@/components/Button';
import { useWallet } from '@/hooks/useWallet';
import { useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { SendTransaction } from '@/components/SendTransaction';

interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  decimals: number;
  value: number; // USD value
  logo?: string;
}

const COMMON_TOKENS: Record<number, Array<{address: string, symbol: string, decimals: number}>> = {
  1: [ // Ethereum mainnet
    { address: '0xA0b86a33E6441da0F4bffFDE0A7c52Bd0ffD779D', symbol: 'USDC', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18 },
  ],
  8453: [ // Base
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18 },
  ]
};

export const WalletPortfolio: React.FC = () => {
  const { walletState } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  // Get ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: walletState.address as `0x${string}` | undefined
  });

  // Refresh all balances
  const refreshBalances = async () => {
    setIsLoading(true);
    await refetchEthBalance();
    // Add token balance fetching logic here
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Calculate total portfolio value
  const totalValue = React.useMemo(() => {
    const ethValue = ethBalance ? parseFloat(formatEther(ethBalance.value)) * 4500 : 0; // Mock ETH price
    const tokenValue = tokenBalances.reduce((sum, token) => sum + token.value, 0);
    return ethValue + tokenValue;
  }, [ethBalance, tokenBalances]);

  if (!walletState.isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Connect your wallet to view portfolio</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Total Balance</h3>
            <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshBalances}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Chain</p>
            <p className="font-medium">
              {walletState.chainId === 1 ? 'Ethereum' : 
               walletState.chainId === 8453 ? 'Base' : 
               walletState.chainId === 11155111 ? 'Sepolia' : 
               'Unknown'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Assets</p>
            <p className="font-medium">{tokenBalances.length + 1}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">24h Change</p>
            <p className="font-medium text-green-500">+2.3%</p>
          </div>
        </div>
      </motion.div>

      {/* Asset List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assets</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSendModal(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <SendTransaction
            isOpen={showSendModal}
            onClose={() => setShowSendModal(false)}
          />
        </div>

        {/* ETH Balance */}
        {ethBalance && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  ETH
                </div>
                <div>
                  <h4 className="font-medium">Ethereum</h4>
                  <p className="text-sm text-muted-foreground">ETH</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(parseFloat(formatEther(ethBalance.value)) * 3000).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Token Balances */}
        {tokenBalances.map((token, index) => (
          <motion.div
            key={token.address}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-medium">{token.symbol}</h4>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{token.balance}</p>
                <p className="text-sm text-muted-foreground">${token.value.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {tokenBalances.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tokens found</p>
            <p className="text-sm">Your token balances will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};