import { NextRequest, NextResponse } from 'next/server';
//TODO: REPLACE 1INCH WITH PROP SWAP
const ONEINCH_API_BASE = 'https://api.1inch.dev/swap/v5.2';
const SUPPORTED_CHAINS = {
  ethereum: 1,
  base: 8453,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10
};

interface QuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: string;
  chainId: number;
  fromAddress?: string;
}

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  rate: string;
  priceImpact: string;
  gasEstimate: string;
  route: Array<{
    name: string;
    part: number;
    fromToken: string;
    toToken: string;
  }>;
  protocols: string[];
  estimatedGas: string;
}

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

    const chainId = params.chainId || SUPPORTED_CHAINS.ethereum;
    const slippage = parseFloat(params.slippage) || 0.5;

    // Call 1inch API
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      console.warn('1inch API key not configured, using fallback');
      return getMockQuote(params);
    }

    const queryParams = new URLSearchParams({
      src: params.fromToken,
      dst: params.toToken,
      amount: params.amount,
      from: params.fromAddress || '0x0000000000000000000000000000000000000000',
      slippage: slippage.toString(),
      includeGas: 'true',
      includeProtocols: 'true'
    });

    const response = await fetch(
      `${ONEINCH_API_BASE}/${chainId}/quote?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status}`);
    }

    const data = await response.json();

    // Format response
    const quote: SwapQuote = {
      fromAmount: params.amount,
      toAmount: data.toAmount || data.dstAmount,
      toAmountMin: calculateMinAmount(data.toAmount || data.dstAmount, slippage),
      rate: calculateRate(params.amount, data.toAmount || data.dstAmount),
      priceImpact: data.priceImpact || calculatePriceImpact(data),
      gasEstimate: formatGasEstimate(data.gas || data.estimatedGas),
      route: formatRoute(data.protocols),
      protocols: extractProtocols(data.protocols),
      estimatedGas: data.gas?.toString() || data.estimatedGas?.toString() || '150000'
    };

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Swap quote error:', error);
    
    // Fallback to mock data if API fails
    if (error instanceof Error && error.message.includes('API')) {
      return getMockQuote(await req.json());
    }

    return NextResponse.json(
      { error: 'Failed to fetch swap quote' },
      { status: 500 }
    );
  }
}

// Helper Functions

function calculateMinAmount(amount: string, slippage: number): string {
  const amountNum = parseFloat(amount);
  const minAmount = amountNum * (1 - slippage / 100);
  return minAmount.toFixed(0);
}

function calculateRate(fromAmount: string, toAmount: string): string {
  const rate = parseFloat(toAmount) / parseFloat(fromAmount);
  return rate.toFixed(6);
}

function calculatePriceImpact(data: any): string {
  // Simplified price impact calculation
  if (data.priceImpact) return data.priceImpact;
  
  // Estimate based on route complexity
  const routeCount = data.protocols?.length || 1;
  return (routeCount * 0.01).toFixed(2);
}

function formatGasEstimate(gas: string | number): string {
  const gasNum = typeof gas === 'string' ? parseInt(gas) : gas;
  const gasPrice = 20; // Assume 20 gwei
  const ethCost = (gasNum * gasPrice) / 1e9;
  return ethCost.toFixed(6);
}

function formatRoute(protocols: any[]): Array<{
  name: string;
  part: number;
  fromToken: string;
  toToken: string;
}> {
  if (!protocols || protocols.length === 0) {
    return [];
  }

  return protocols.map((protocol: any) => ({
    name: protocol.name || 'Unknown',
    part: protocol.part || 100,
    fromToken: protocol.fromTokenAddress || '',
    toToken: protocol.toTokenAddress || ''
  }));
}

function extractProtocols(protocols: any[]): string[] {
  if (!protocols || protocols.length === 0) return ['Direct'];
  
  const uniqueProtocols = new Set<string>();
  protocols.forEach((p: any) => {
    if (p.name) uniqueProtocols.add(p.name);
  });
  
  return Array.from(uniqueProtocols);
}

function getMockQuote(params: QuoteParams): NextResponse {
  // Mock fallback data
  const mockRate = 1.0002;
  const estimatedOutput = (parseFloat(params.amount) * mockRate).toFixed(6);
  const slippage = parseFloat(params.slippage) || 0.5;
  const minReceived = (parseFloat(estimatedOutput) * (1 - slippage / 100)).toFixed(6);

  const quote: SwapQuote = {
    fromAmount: params.amount,
    toAmount: estimatedOutput,
    toAmountMin: minReceived,
    rate: mockRate.toString(),
    priceImpact: '0.01',
    gasEstimate: '0.003',
    route: [{
      name: 'Direct',
      part: 100,
      fromToken: params.fromToken,
      toToken: params.toToken
    }],
    protocols: ['Uniswap V3'],
    estimatedGas: '150000'
  };

  return NextResponse.json({
    ...quote,
    _note: 'Mock data - 1inch API key not configured'
  });
}

// Swap execution endpoint
export async function PUT(req: NextRequest) {
  try {
    const { 
      fromToken, 
      toToken, 
      amount, 
      fromAddress,
      slippage,
      chainId 
    } = await req.json();

    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      );
    }

    const queryParams = new URLSearchParams({
      src: fromToken,
      dst: toToken,
      amount: amount,
      from: fromAddress,
      slippage: slippage.toString(),
      disableEstimate: 'false'
    });

    const response = await fetch(
      `${ONEINCH_API_BASE}/${chainId || 1}/swap?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to prepare swap transaction');
    }

    const swapData = await response.json();
    
    return NextResponse.json({
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value,
      gasLimit: swapData.tx.gas
    });

  } catch (error) {
    console.error('Swap execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute swap' },
      { status: 500 }
    );
  }
}