import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const data = await response.json();
    
    if (data.status === '1') {
      return NextResponse.json({
        slow: parseInt(data.result.SafeGasPrice),
        standard: parseInt(data.result.ProposeGasPrice),
        fast: parseInt(data.result.FastGasPrice),
        instant: parseInt(data.result.FastGasPrice) * 1.2,
        baseFee: parseInt(data.result.suggestBaseFee),
        trend: 'stable' // You can calculate this based on historical data
      });
    }

    throw new Error('Failed to fetch gas prices');

  } catch (error) {
    console.error('Gas tracker error:', error);
    return NextResponse.json({ error: 'Failed to fetch gas prices' }, { status: 500 });
  }
}