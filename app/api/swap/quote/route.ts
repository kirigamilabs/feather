import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { fromToken, toToken, amount, slippage } = await req.json();
    
    // Call 1inch API
    const chainId = 1; // Ethereum mainnet
    const url = `https://api.1inch.dev/swap/v5.2/${chainId}/quote`;
    
    const params = new URLSearchParams({
      src: fromToken,
      dst: toToken,
      amount: amount,
      includeGas: 'true'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
      }
    });

    const data = await response.json();
    
    return NextResponse.json({
      fromAmount: amount,
      toAmount: data.toAmount,
      rate: (parseFloat(data.toAmount) / parseFloat(amount)).toFixed(6),
      priceImpact: data.priceImpact || '0.01',
      minimumReceived: (parseFloat(data.toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6),
      gasEstimate: data.estimatedGas || '150000',
      route: [fromToken, toToken]
    });

  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}