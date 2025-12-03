import { NextRequest, NextResponse } from 'next/server';
//TODO: REPLACE ETHERSCAN WITH PROP GAS
interface GasData {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  baseFee: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: number;
  suggestedMaxFee: {
    slow: number;
    standard: number;
    fast: number;
    instant: number;
  };
  suggestedPriorityFee: {
    slow: number;
    standard: number;
    fast: number;
    instant: number;
  };
}

// In-memory cache to reduce API calls
let gasCache: { data: GasData; timestamp: number } | null = null;
const CACHE_DURATION = 12000; // 12 seconds

export async function GET(req: NextRequest) {
  try {
    // Check cache
    if (gasCache && Date.now() - gasCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(gasCache.data);
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      console.warn('Etherscan API key not configured, using fallback');
      return getMockGasData();
    }

    // Fetch from Etherscan
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error('Etherscan API returned error');
    }

    const result = data.result;
    const baseFee = parseFloat(result.suggestBaseFee);

    // Calculate trending
    const trend = calculateTrend(baseFee);

    const gasData: GasData = {
      slow: parseInt(result.SafeGasPrice),
      standard: parseInt(result.ProposeGasPrice),
      fast: parseInt(result.FastGasPrice),
      instant: Math.round(parseInt(result.FastGasPrice) * 1.2),
      baseFee: Math.round(baseFee),
      trend,
      lastUpdate: Date.now(),
      suggestedMaxFee: {
        slow: Math.round(baseFee * 1.1),
        standard: Math.round(baseFee * 1.2),
        fast: Math.round(baseFee * 1.4),
        instant: Math.round(baseFee * 1.6)
      },
      suggestedPriorityFee: {
        slow: 1,
        standard: 2,
        fast: 3,
        instant: 5
      }
    };

    // Update cache
    gasCache = { data: gasData, timestamp: Date.now() };

    return NextResponse.json(gasData);

  } catch (error) {
    console.error('Gas tracker error:', error);
    
    // Return cached data if available
    if (gasCache) {
      return NextResponse.json({
        ...gasCache.data,
        _cached: true
      });
    }

    // Fallback to mock data
    return getMockGasData();
  }
}

function calculateTrend(currentBaseFee: number): 'up' | 'down' | 'stable' {
  if (!gasCache) return 'stable';
  
  const previousBaseFee = gasCache.data.baseFee;
  const change = ((currentBaseFee - previousBaseFee) / previousBaseFee) * 100;
  
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

function getMockGasData(): NextResponse {
  const mockGasData: GasData = {
    slow: 12,
    standard: 18,
    fast: 25,
    instant: 35,
    baseFee: 15,
    trend: 'stable',
    lastUpdate: Date.now(),
    suggestedMaxFee: {
      slow: 17,
      standard: 18,
      fast: 21,
      instant: 24
    },
    suggestedPriorityFee: {
      slow: 1,
      standard: 2,
      fast: 3,
      instant: 5
    }
  };

  return NextResponse.json({
    ...mockGasData,
    _note: 'Mock data - Etherscan API key not configured'
  });
}

// Historical gas prices endpoint
export async function POST(req: NextRequest) {
  try {
    const { hours = 24 } = await req.json();
    
    // This would integrate with a service like Dune Analytics or Etherscan's historical API
    // For now, return mock historical data
    const historicalData = Array.from({ length: hours }, (_, i) => ({
      timestamp: Date.now() - (hours - i) * 3600000,
      baseFee: Math.round(15 + Math.random() * 10 - 5),
      fast: Math.round(25 + Math.random() * 15 - 7)
    }));

    return NextResponse.json(historicalData);

  } catch (error) {
    console.error('Historical gas data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}