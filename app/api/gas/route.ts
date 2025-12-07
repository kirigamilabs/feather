import { NextRequest, NextResponse } from 'next/server';

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
    
    // IMPORTANT: Etherscan returns gas prices as decimal strings (e.g., "0.255570098")
    const baseFee = parseFloat(result.suggestBaseFee);
    const safeGas = parseFloat(result.SafeGasPrice);
    const proposeGas = parseFloat(result.ProposeGasPrice);
    const fastGas = parseFloat(result.FastGasPrice);

    // Calculate trending
    const trend = calculateTrend(baseFee);

    const gasData: GasData = {
      // Round to reasonable precision but keep the decimal values
      slow: Math.round(safeGas * 1000) / 1000,
      standard: Math.round(proposeGas * 1000) / 1000,
      fast: Math.round(fastGas * 1000) / 1000,
      instant: Math.round(fastGas * 1.2 * 1000) / 1000,
      baseFee: Math.round(baseFee * 1000) / 1000,
      trend,
      lastUpdate: Date.now(),
      suggestedMaxFee: {
        slow: Math.round(baseFee * 1.1 * 1000) / 1000,
        standard: Math.round(baseFee * 1.2 * 1000) / 1000,
        fast: Math.round(baseFee * 1.4 * 1000) / 1000,
        instant: Math.round(baseFee * 1.6 * 1000) / 1000
      },
      suggestedPriorityFee: {
        slow: 0.5,
        standard: 1,
        fast: 2,
        instant: 3
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
    slow: 12.5,
    standard: 18.3,
    fast: 25.7,
    instant: 35.2,
    baseFee: 15.8,
    trend: 'stable',
    lastUpdate: Date.now(),
    suggestedMaxFee: {
      slow: 17.4,
      standard: 19.0,
      fast: 22.1,
      instant: 25.3
    },
    suggestedPriorityFee: {
      slow: 0.5,
      standard: 1,
      fast: 2,
      instant: 3
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
      baseFee: Math.round((15 + Math.random() * 10 - 5) * 1000) / 1000,
      fast: Math.round((25 + Math.random() * 15 - 7) * 1000) / 1000
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