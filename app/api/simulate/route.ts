import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

const KIRIGAMI_RPC = 'https://rpc.kirigamilabs.com';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(KIRIGAMI_RPC),
});

interface SimulationRequest {
  from: string;
  to: string;
  data?: string;
  value?: string;
}

interface SimulationResult {
  success: boolean;
  gasEstimate: string;
  changes: Array<{
    type: string;
    token?: string;
    from?: string;
    to?: string;
    amount?: string;
    description: string;
  }>;
  warnings: string[];
  estimatedCost: {
    gas: string;
    gasPrice: string;
    totalEth: string;
    totalUsd: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { from, to, data, value }: SimulationRequest = await req.json();

    // Validation
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    // Get current gas price
    const gasPrice = await publicClient.getGasPrice();
    const gasPriceGwei = formatEther(gasPrice);

    try {
      // Simulate the transaction using eth_call
      const result = await publicClient.call({
        account: from as `0x${string}`,
        to: to as `0x${string}`,
        data: data as `0x${string}` | undefined,
        value: value ? parseEther(value) : undefined,
      });

      // Estimate gas for the transaction
      const gasEstimate = await publicClient.estimateGas({
        account: from as `0x${string}`,
        to: to as `0x${string}`,
        data: data as `0x${string}` | undefined,
        value: value ? parseEther(value) : undefined,
      });

      const gasCostEth = formatEther(gasEstimate * gasPrice);
      const gasCostUsd = (parseFloat(gasCostEth) * 3000).toFixed(2); // Mock ETH price

      // Analyze the transaction
      const changes: Array<{
        type: string;
        token?: string;
        from?: string;
        to?: string;
        amount?: string;
        description: string;
      }> = [];

      const warnings: string[] = [];

      // Check if it's a value transfer
      if (value && parseFloat(value) > 0) {
        changes.push({
          type: 'balance',
          token: 'ETH',
          from,
          to,
          amount: value,
          description: `Transfer ${value} ETH from ${from.slice(0, 6)}...${from.slice(-4)} to ${to.slice(0, 6)}...${to.slice(-4)}`
        });

        // Check if sender has sufficient balance
        const balance = await publicClient.getBalance({ address: from as `0x${string}` });
        const totalRequired = parseEther(value) + (gasEstimate * gasPrice);
        
        if (balance < totalRequired) {
          warnings.push('Insufficient balance for transaction + gas fees');
        }
      }

      // Check if it's a contract interaction
      if (data && data !== '0x') {
        const code = await publicClient.getBytecode({ address: to as `0x${string}` });
        
        if (code && code !== '0x') {
          changes.push({
            type: 'contract_interaction',
            description: `Contract interaction with ${to.slice(0, 6)}...${to.slice(-4)}`
          });

          // Try to decode common function signatures
          const functionSelector = data.slice(0, 10);
          
          // Common signatures
          const knownFunctions: Record<string, string> = {
            '0xa9059cbb': 'ERC20 Transfer',
            '0x095ea7b3': 'ERC20 Approve',
            '0x23b872dd': 'ERC20 TransferFrom',
            '0xd0e30db0': 'WETH Deposit (Wrap)',
            '0x2e1a7d4d': 'WETH Withdraw (Unwrap)',
            '0x414bf389': 'Uniswap Exact Input Single',
          };

          if (knownFunctions[functionSelector]) {
            changes.push({
              type: 'function_call',
              description: `Function: ${knownFunctions[functionSelector]}`
            });
          }
        }
      }

      // Gas price warning
      const gasPriceNum = parseFloat(gasPriceGwei) * 1e9; // Convert to Gwei
      if (gasPriceNum > 50) {
        warnings.push('High gas price detected - consider waiting for lower fees');
      }

      const simulation: SimulationResult = {
        success: true,
        gasEstimate: gasEstimate.toString(),
        changes,
        warnings,
        estimatedCost: {
          gas: gasEstimate.toString(),
          gasPrice: gasPriceGwei,
          totalEth: gasCostEth,
          totalUsd: gasCostUsd
        }
      };

      return NextResponse.json(simulation);

    } catch (simulationError: any) {
      // Transaction would fail
      console.error('Simulation failed:', simulationError);

      const simulation: SimulationResult = {
        success: false,
        gasEstimate: '0',
        changes: [],
        warnings: [
          'Transaction simulation failed',
          simulationError.message || 'Unknown error',
          'This transaction will likely revert on-chain'
        ],
        estimatedCost: {
          gas: '0',
          gasPrice: gasPriceGwei,
          totalEth: '0',
          totalUsd: '0'
        }
      };

      return NextResponse.json(simulation);
    }

  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json(
      { 
        error: 'Simulation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(req: NextRequest) {
  try {
    // Check if RPC is responsive
    const blockNumber = await publicClient.getBlockNumber();
    
    return NextResponse.json({
      status: 'ok',
      network: 'sepolia',
      rpc: KIRIGAMI_RPC,
      blockNumber: blockNumber.toString(),
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: 'RPC unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}