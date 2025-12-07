import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';

const KIRIGAMI_RPC = 'https://rpc.kirigamilabs.com';

// Sepolia Uniswap V3 addresses
const UNISWAP_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const UNISWAP_QUOTER = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3';
const WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';

// Token addresses on Sepolia
const TOKENS: Record<string, { address: string; decimals: number }> = {
  WETH: { address: WETH_ADDRESS, decimals: 18 },
  USDC: { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
  DAI: { address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', decimals: 18 },
};

// Quoter V2 ABI
const QUOTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Router ABI for swap
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

interface QuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: string;
  fromAddress?: string;
}

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  rate: string;
  priceImpact: string;
  gasEstimate: string;
  route: string[];
  estimatedGas: string;
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(KIRIGAMI_RPC),
});

export async function POST(req: NextRequest) {
  try {
    const params: QuoteParams = await req.json();
    
    // Validation
    if (!params.fromToken || !params.toToken || !params.amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const slippage = parseFloat(params.slippage || '0.5');
    
    // Handle ETH/WETH wrapping (1:1 ratio)
    if (
      (params.fromToken === 'ETH' && params.toToken === 'WETH') ||
      (params.fromToken === 'WETH' && params.toToken === 'ETH')
    ) {
      const quote: SwapQuote = {
        fromAmount: params.amount,
        toAmount: params.amount,
        toAmountMin: (parseFloat(params.amount) * (1 - slippage / 100)).toFixed(18),
        rate: '1.0',
        priceImpact: '0.0',
        gasEstimate: '0.0001',
        route: [params.fromToken, params.toToken],
        estimatedGas: '50000'
      };
      
      return NextResponse.json(quote);
    }

    // Get token info
    const fromTokenInfo = TOKENS[params.fromToken] || { address: WETH_ADDRESS, decimals: 18 };
    const toTokenInfo = TOKENS[params.toToken] || { address: WETH_ADDRESS, decimals: 18 };

    // Parse amount
    const amountIn = parseUnits(params.amount, fromTokenInfo.decimals);

    try {
      // Try to get quote from Uniswap Quoter
      const quoteResult = await publicClient.simulateContract({
        address: UNISWAP_QUOTER as `0x${string}`,
        abi: QUOTER_ABI,
        functionName: 'quoteExactInputSingle',
        args: [{
          tokenIn: fromTokenInfo.address as `0x${string}`,
          tokenOut: toTokenInfo.address as `0x${string}`,
          amountIn,
          fee: 3000, // 0.3% pool
          sqrtPriceLimitX96: BigInt(0)
        }]
      });

      const [amountOut, , , gasEstimate] = quoteResult.result;

      const toAmount = formatUnits(amountOut, toTokenInfo.decimals);
      const minAmount = (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(toTokenInfo.decimals);
      const rate = (parseFloat(toAmount) / parseFloat(params.amount)).toFixed(6);

      const quote: SwapQuote = {
        fromAmount: params.amount,
        toAmount,
        toAmountMin: minAmount,
        rate,
        priceImpact: '0.1', // Simplified
        gasEstimate: formatUnits(gasEstimate * BigInt(50), 9), // Gas price * gas used
        route: [params.fromToken, params.toToken],
        estimatedGas: gasEstimate.toString()
      };

      return NextResponse.json(quote);

    } catch (quoteError) {
      console.error('Quoter error:', quoteError);
      
      // Fallback to mock pricing
      let mockRate = 1;
      
      // ETH/WETH to USDC: ~$3000
      if ((params.fromToken === 'ETH' || params.fromToken === 'WETH') && params.toToken === 'USDC') {
        mockRate = 3000;
      }
      // USDC to ETH/WETH
      else if (params.fromToken === 'USDC' && (params.toToken === 'ETH' || params.toToken === 'WETH')) {
        mockRate = 1 / 3000;
      }
      // WETH to DAI: ~$3000
      else if (params.fromToken === 'WETH' && params.toToken === 'DAI') {
        mockRate = 3000;
      }
      // DAI to WETH
      else if (params.fromToken === 'DAI' && params.toToken === 'WETH') {
        mockRate = 1 / 3000;
      }

      const estimatedOutput = (parseFloat(params.amount) * mockRate).toFixed(6);
      const minReceived = (parseFloat(estimatedOutput) * (1 - slippage / 100)).toFixed(6);

      const quote: SwapQuote = {
        fromAmount: params.amount,
        toAmount: estimatedOutput,
        toAmountMin: minReceived,
        rate: mockRate.toFixed(6),
        priceImpact: '0.1',
        gasEstimate: '0.003',
        route: [params.fromToken, params.toToken],
        estimatedGas: '150000'
      };

      return NextResponse.json({
        ...quote,
        _note: 'Using fallback pricing - Quoter unavailable'
      });
    }

  } catch (error) {
    console.error('Swap quote error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap quote', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Build swap transaction data
export async function PUT(req: NextRequest) {
  try {
    const { 
      fromToken, 
      toToken, 
      amount, 
      fromAddress,
      slippage,
      toAmount
    } = await req.json();

    if (!fromAddress) {
      return NextResponse.json({ error: 'fromAddress required' }, { status: 400 });
    }

    const slippageNum = parseFloat(slippage || '0.5');

    // Get token info
    const fromTokenInfo = TOKENS[fromToken] || { address: WETH_ADDRESS, decimals: 18 };
    const toTokenInfo = TOKENS[toToken] || { address: WETH_ADDRESS, decimals: 18 };

    const amountIn = parseUnits(amount, fromTokenInfo.decimals);
    const amountOutMin = parseUnits(
      (parseFloat(toAmount) * (1 - slippageNum / 100)).toFixed(toTokenInfo.decimals),
      toTokenInfo.decimals
    );

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min

    // Encode swap call
    const data = encodeFunctionData({
      abi: ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: fromTokenInfo.address as `0x${string}`,
        tokenOut: toTokenInfo.address as `0x${string}`,
        fee: 3000,
        recipient: fromAddress as `0x${string}`,
        deadline,
        amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: BigInt(0)
      }]
    });

    return NextResponse.json({
      to: UNISWAP_ROUTER,
      data,
      value: fromToken === 'ETH' ? amountIn.toString() : '0',
      gasLimit: '300000'
    });

  } catch (error) {
    console.error('Swap execution error:', error);
    return NextResponse.json(
      { error: 'Failed to build swap transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}