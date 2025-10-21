'use client'
import { useState, useEffect, useCallback } from 'react';
import { 
  useAccount, 
  useBalance, 
  useConnect, 
  useDisconnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSignMessage,
  useSwitchChain
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

// Network configuration - Easy to disable/enable
const NETWORK_CONFIG = {
  enabled: true, // Set to false to disable network switching
  targetChainId: 11155111, // Sepolia testnet
  chainName: 'Sepolia test network',
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SepoliaETH',
    decimals: 18
  }
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false
  });
  
  const { updateContext } = useAIStore();
  
  // Wagmi hooks
  const { address, isConnected, connector, chain } = useAccount();
  const { data: balance } = useBalance({ 
    address: address as `0x${string}` | undefined 
  });
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();
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

  // Track if we've already checked network on this connection
  const [hasCheckedNetwork, setHasCheckedNetwork] = useState(false);

  // Update wallet state when connection changes
  useEffect(() => {
    const newState: WalletState = {
      isConnected,
      address,
      balance: balance ? formatEther(balance.value) : undefined,
      chainId: chain?.id,
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
      // Reset network check flag when disconnected
      setHasCheckedNetwork(false);
    }
  }, [isConnected, address, balance, chain, connector, updateContext]);

  // Ensure correct network
  const ensureCorrectNetwork = useCallback(async () => {
    if (!NETWORK_CONFIG.enabled) return true;
    
    if (!isConnected || !chain) {
      console.log('Wallet not connected or chain not available');
      return false;
    }

    // Check if already on correct network
    if (chain.id === NETWORK_CONFIG.targetChainId) {
      console.log(`Already on ${NETWORK_CONFIG.chainName}`);
      return true;
    }

    // Check if the target chain is available in wagmi config
    const targetChain = chains.find(c => c.id === NETWORK_CONFIG.targetChainId);
    
    if (!targetChain) {
      console.error(`Chain ${NETWORK_CONFIG.targetChainId} not found in wagmi config`);
      return false;
    }

    try {
      console.log(`Switching to ${NETWORK_CONFIG.chainName}...`);
      await switchChain({ chainId: NETWORK_CONFIG.targetChainId });
      return true;
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      // If user rejected or other error, still return false but don't crash
      if (error.message?.includes('User rejected')) {
        console.log('User rejected network switch');
      }
      
      return false;
    }
  }, [isConnected, chain, switchChain, chains]);

    // Auto-switch network when wallet connects
  useEffect(() => {
    if (isConnected && chain && !hasCheckedNetwork) {
      setHasCheckedNetwork(true);
      ensureCorrectNetwork();
    }
  }, [isConnected, chain, hasCheckedNetwork, ensureCorrectNetwork]);


  // Connect wallet with automatic network switching
  const connectWallet = useCallback(async (connectorType?: 'metamask' | 'walletconnect' | 'injected') => {
    try {
      let targetConnector = connectors[0]; // Default to first available
      
      if (connectorType === 'metamask') {
        targetConnector = connectors.find(c => c.name.toLowerCase().includes('metamask')) || connectors[0];
      } else if (connectorType === 'walletconnect') {
        targetConnector = connectors.find(c => c.name.toLowerCase().includes('walletconnect')) || connectors[0];
      }
      
      await connect({ connector: targetConnector });
      
      // Give the connection a moment to establish before checking network
      setTimeout(async () => {
        await ensureCorrectNetwork();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }, [connectors, connect, ensureCorrectNetwork]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Send ETH transaction - with network check
  const sendETH = useCallback(async (params: SendTransactionParams): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    // Ensure on correct network before sending
    if (NETWORK_CONFIG.enabled) {
      const onCorrectNetwork = await ensureCorrectNetwork();
      if (!onCorrectNetwork) {
        throw new Error(`Please switch to ${NETWORK_CONFIG.chainName} network`);
      }
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
          } else if (attempts < 750) { // Wait up to 150 seconds
            setTimeout(() => checkForHash(attempts + 1), 200);
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
  }, [isConnected, address, sendTransaction, hash, ensureCorrectNetwork]);

  // Sign message - with network check
  const signMessageAsync = useCallback(async (message: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    // Ensure on correct network before signing
    if (NETWORK_CONFIG.enabled) {
      const onCorrectNetwork = await ensureCorrectNetwork();
      if (!onCorrectNetwork) {
        throw new Error(`Please switch to ${NETWORK_CONFIG.chainName} network for signing`);
      }
    }

    try {
      await signMessage({ message });
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }, [isConnected, signMessage, signature, ensureCorrectNetwork]);

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
    ensureCorrectNetwork, // Expose for manual checks if needed
    
    // Utilities
    getTransactionStatus,
    connectors,
    
    // Network info
    currentChainId: chain?.id,
    isCorrectNetwork: NETWORK_CONFIG.enabled ? chain?.id === NETWORK_CONFIG.targetChainId : true
  };
};