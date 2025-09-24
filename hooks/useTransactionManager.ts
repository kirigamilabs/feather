import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useAIStore } from '@/state/aiState';
import { Web3Utils } from '@/utils/web3Utils';

interface TransactionRequest {
  type: 'send_eth' | 'send_token' | 'swap' | 'approve';
  to?: string;
  amount?: string;
  tokenAddress?: string;
  data?: string;
}

interface TransactionStatus {
  hash?: string;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  timestamp: number;
  gasUsed?: bigint;
  error?: string;
}

export const useTransactionManager = () => {
  const [transactions, setTransactions] = useState<Map<string, TransactionStatus>>(new Map());
  const { sendETH, getTransactionStatus, walletState } = useWallet();
  const { updateContext } = useAIStore();

  const executeTransaction = useCallback(async (request: TransactionRequest): Promise<string> => {
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      let hash: string;

      switch (request.type) {
        case 'send_eth':
          if (!request.to || !request.amount) {
            throw new Error('Missing required parameters for ETH transfer');
          }
          
          // Fix: sendETH returns a hash, but we need to await it and handle the return properly
          const result = await sendETH({
            to: request.to,
            value: request.amount,
            data: request.data
          });
          
          // The result might be the transaction hash directly, or we need to get it from the transaction status
          if (typeof result === 'string') {
            hash = result;
          } else {
            // If sendETH doesn't return hash directly, get it from the transaction status
            const status = getTransactionStatus();
            if (!status.hash) {
              throw new Error('Transaction hash not available');
            }
            hash = status.hash;
          }
          break;
        
        default:
          throw new Error(`Transaction type ${request.type} not implemented`);
      }

      // Track transaction
      const txStatus: TransactionStatus = {
        hash,
        status: 'pending',
        timestamp: Date.now()
      };

      setTransactions(prev => new Map(prev.set(hash, txStatus)));

      // Update AI context
      updateContext({
        lastTransaction: {
          hash,
          type: request.type,
          timestamp: Date.now(),
          status: 'pending'
        }
      });

      // Start monitoring
      monitorTransaction(hash);

      return hash;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    }
  }, [walletState.isConnected, sendETH, updateContext, getTransactionStatus]);

  const monitorTransaction = useCallback((hash: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    const checkStatus = () => {
      const status = getTransactionStatus();
      
      if (status.hash === hash) {
        setTransactions(prev => {
          const updated = new Map(prev);
          const current = updated.get(hash);
          
          if (current) {
            updated.set(hash, {
              ...current,
              status: status.isConfirmed ? 'confirmed' : 
                     status.isConfirming ? 'confirming' : 
                     status.error ? 'failed' : 'pending',
              error: status.error?.message
            });
          }
          
          return updated;
        });

        // Update AI context when confirmed
        if (status.isConfirmed) {
          updateContext({
            lastTransaction: {
              hash,
              status: 'confirmed',
              timestamp: Date.now(),
              explorerUrl: Web3Utils.getExplorerUrl(hash, walletState.chainId || 1)
            }
          });
          return; // Stop monitoring when confirmed
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 2000); // Check again in 2 seconds
      }
    };
    
    // Start monitoring
    setTimeout(checkStatus, 1000); // First check after 1 second
  }, [getTransactionStatus, updateContext, walletState.chainId]);

  const getTransactionHistory = useCallback(() => {
    return Array.from(transactions.entries()).map(([hash, status]) => ({
      hash,
      ...status
    }));
  }, [transactions]);

  return {
    executeTransaction,
    transactions,
    getTransactionHistory
  };
};