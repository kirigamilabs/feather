import React, { useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useTransactionManager } from '@/hooks/useTransactionManager';
import { useAIStore } from '@/state/aiState';

interface AIWeb3IntegrationProps {
  onWalletConnected?: (address: string) => void;
  onTransactionComplete?: (hash: string) => void;
}

export const AIWeb3Integration: React.FC<AIWeb3IntegrationProps> = ({
  onWalletConnected,
  onTransactionComplete
}) => {
  const { walletState } = useWallet();
  const { transactions } = useTransactionManager();
  const { updateContext, updatePersonality } = useAIStore();

  // Update AI context when wallet connects
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      updateContext({
        wallet: {
          address: walletState.address,
          balance: walletState.balance,
          chainId: walletState.chainId,
          connected: true,
          hasTransactionHistory: transactions.size > 0
        },
        web3Capabilities: {
          canSendETH: true,
          canSignMessages: true,
          canInteractWithContracts: true,
          supportedChains: [1, 8453, 11155111]
        }
      });

      // Increase AI confidence when wallet is connected
      updatePersonality({
        precision: Math.min(0.95, (0.9 + 0.05)) // Slight boost in precision
      });

      onWalletConnected?.(walletState.address);
    } else {
      updateContext({
        wallet: { connected: false }
      });
    }
  }, [walletState, updateContext, updatePersonality, onWalletConnected]);

  // Monitor transaction completions
  useEffect(() => {
    transactions.forEach((status, hash) => {
      if (status.status === 'confirmed') {
        onTransactionComplete?.(hash);
      }
    });
  }, [transactions, onTransactionComplete]);

  return null; // This is a logic-only component
};