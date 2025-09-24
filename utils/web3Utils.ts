// utils/web3Utils.ts - Utility functions for Web3 operations
import { formatEther, parseEther, isAddress } from 'viem';

export class Web3Utils {
  static formatAddress(address: string, short = true): string {
    if (!address) return '';
    return short 
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
  }

  static formatBalance(balance: string | bigint, decimals = 18, precision = 4): string {
    if (typeof balance === 'bigint') {
      return parseFloat(formatEther(balance)).toFixed(precision);
    }
    return parseFloat(balance).toFixed(precision);
  }

  static validateAddress(address: string): boolean {
    return isAddress(address);
  }

  static calculateGasPrice(priority: 'slow' | 'standard' | 'fast' = 'standard'): bigint {
    const baseFee = BigInt(20); // Base fee in gwei
    const tips = {
      slow: BigInt(1),
      standard: BigInt(2),
      fast: BigInt(5)
    };
    
    return (baseFee + tips[priority]) * (BigInt(10) ** BigInt(9)); // Convert to wei
  }

  static getExplorerUrl(hash: string, chainId: number): string {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      8453: 'https://basescan.org',
      11155111: 'https://sepolia.etherscan.io'
    };
    
    const baseUrl = explorers[chainId] || explorers[1];
    return `${baseUrl}/tx/${hash}`;
  }

  static async estimateTransactionTime(gasPrice: bigint): Promise<string> {
    // Mock estimation - in production, use gas tracker APIs
    const gwei = Number(gasPrice) / 1e9;
    
    if (gwei < 20) return '5-10 minutes';
    if (gwei < 50) return '2-5 minutes';
    return '< 2 minutes';
  }
}
