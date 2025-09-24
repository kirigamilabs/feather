'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Web3Utils } from '@/utils/web3Utils';

export const Web3StatusBar: React.FC = () => {
  const { walletState, isConnecting, isSending } = useWallet();

  if (!walletState.isConnected) {
    return null;
  }

  const getChainName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 8453: return 'Base';
      case 11155111: return 'Sepolia';
      default: return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-40 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg"
    >
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          {isSending ? (
            <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <span className="font-medium">
            {Web3Utils.formatAddress(walletState.address || '')}
          </span>
        </div>
        
        <div className="h-3 w-px bg-border" />
        
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            walletState.chainId === 1 ? 'bg-blue-500' :
            walletState.chainId === 8453 ? 'bg-blue-600' :
            'bg-gray-500'
          }`} />
          <span className="text-muted-foreground">
            {getChainName(walletState.chainId)}
          </span>
        </div>

        <div className="h-3 w-px bg-border" />
        
        <span className="font-medium">
          {walletState.balance ? `${parseFloat(walletState.balance).toFixed(3)} ETH` : '0 ETH'}
        </span>
      </div>
    </motion.div>
  );
};