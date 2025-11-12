'use client'
import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask
 } from 'wagmi/connectors';

const config = createConfig({
  chains: [mainnet, base, sepolia],
  connectors: [
    metaMask()
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http()
  }
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}