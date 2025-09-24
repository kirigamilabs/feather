import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

interface TokenData {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  rawBalance: bigint;
}

export const useTokenBalances = (tokenAddresses: string[]) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTokenBalances = async () => {
    if (!address || !publicClient || tokenAddresses.length === 0) return;

    setIsLoading(true);
    try {
      const tokenData = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          try {
            const [balance, decimals, symbol] = await Promise.all([
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address]
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'decimals'
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'symbol'
              })
            ]);

            return {
              address: tokenAddress,
              symbol: symbol as string,
              decimals: decimals as number,
              rawBalance: balance as bigint,
              balance: formatUnits(balance as bigint, decimals as number)
            };
          } catch (error) {
            console.error(`Failed to fetch token data for ${tokenAddress}:`, error);
            return null;
          }
        })
      );

      setTokens(tokenData.filter(token => token !== null) as TokenData[]);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenBalances();
  }, [address, tokenAddresses.join(',')]);

  return {
    tokens,
    isLoading,
    refetch: fetchTokenBalances
  };
};