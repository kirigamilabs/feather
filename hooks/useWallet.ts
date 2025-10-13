'use client'
import { useState, useEffect, useCallback } from 'react';
import { 
  useAccount, 
  useBalance, 
  useConnect, 
  useDisconnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSignMessage
} from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { useAIStore } from '@/state/aiState';

interface WalletState {
  isConnected: boolean;
  address?: string;
  ensName?: string;
  balance?: string;
  chainId?: number;
  connector?: any;
}

interface SendTransactionParams {
  to: string;
  value: string;
  data?: string;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false
  });
  
  const { updateContext } = useAIStore();
  
  // Wagmi hooks
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({ 
    address: address as `0x${string}` | undefined 
  });
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { 
    sendTransaction, 
    data: hash, 
    isPending: isSending,
    error: sendError 
  } = useSendTransaction();
  const { signMessage, data: signature, isPending: isSigning } = useSignMessage();
  
  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash });

  // Update wallet state when connection changes
  useEffect(() => {
    const newState: WalletState = {
      isConnected,
      address,
      balance: balance ? formatEther(balance.value) : undefined,
      chainId: 11155111, //TODO
      connector
    };
    
    setWalletState(newState);
    
    // Update AI context with wallet info
    if (isConnected && address) {
      updateContext({
        wallet: {
          address,
          balance: newState.balance,
          chainId: newState.chainId,
          connected: true
        }
      });
    } else {
      updateContext({
        wallet: { connected: false }
      });
    }
  }, [isConnected, address, balance, connector, updateContext]);

  // Connect wallet
  const connectWallet = useCallback(async (connectorType?: 'metamask' | 'walletconnect' | 'injected') => {
    try {
      let targetConnector = connectors[0]; // Default to first available
      
      if (connectorType === 'metamask') {
        targetConnector = connectors.find(c => c.name.toLowerCase().includes('metamask')) || connectors[0];
      } else if (connectorType === 'walletconnect') {
        targetConnector = connectors.find(c => c.name.toLowerCase().includes('walletconnect')) || connectors[0];
      }
      
      await connect({ connector: targetConnector });
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }, [connectors, connect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Send ETH transaction - FIXED to return a Promise<string>
  const sendETH = useCallback(async (params: SendTransactionParams): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isAddress(params.to)) {
      throw new Error('Invalid recipient address');
    }

    return new Promise((resolve, reject) => {
      try {
        sendTransaction({
          to: params.to as `0x${string}`,
          value: parseEther(params.value),
          data: params.data as `0x${string}` | undefined
        });

        // Wait for the hash to be available
        const checkForHash = (attempts = 0) => {
          if (hash) {
            resolve(hash);
          } else if (attempts < 50) { // Wait up to 5 seconds
            setTimeout(() => checkForHash(attempts + 1), 100);
          } else {
            reject(new Error('Transaction hash not received within timeout'));
          }
        };

        // Start checking after a small delay to let the transaction initiate
        setTimeout(() => checkForHash(), 100);

      } catch (error) {
        console.error('Transaction failed:', error);
        reject(error);
      }
    });
  }, [isConnected, address, sendTransaction, hash]);

  // Sign message
  const signMessageAsync = useCallback(async (message: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      await signMessage({ message });
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }, [isConnected, signMessage, signature]);

  // Get transaction status
  const getTransactionStatus = useCallback(() => {
    return {
      hash,
      isPending: isSending,
      isConfirming,
      isConfirmed,
      error: sendError
    };
  }, [hash, isSending, isConfirming, isConfirmed, sendError]);

  return {
    // State
    walletState,
    isConnecting,
    isSending,
    isSigning,
    isConfirming,
    isConfirmed,
    
    // Actions
    connectWallet,
    disconnectWallet,
    sendETH,
    signMessage: signMessageAsync,
    
    // Utilities
    getTransactionStatus,
    connectors
  };
};