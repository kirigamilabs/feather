import { NextRequest, NextResponse } from 'next/server';

//TODO: REPLACE TENDERLY WITH PROP SIM
export async function POST(req: NextRequest) {
  try {
    const { from, to, data, value } = await req.json();

    // Call Tenderly simulation API
    const response = await fetch(
      'https://api.tenderly.co/api/v1/account/YOUR_ACCOUNT/project/YOUR_PROJECT/simulate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': process.env.TENDERLY_ACCESS_KEY || ''
        },
        body: JSON.stringify({
          network_id: '1',
          from,
          to,
          input: data,
          value: value || '0',
          save: false,
          save_if_fails: false
        })
      }
    );

    const simulation = await response.json();

    return NextResponse.json({
      success: !simulation.transaction.error_message,
      gasEstimate: (parseInt(simulation.transaction.gas_used) / 1e18 * 50).toFixed(6), // Mock gas price
      changes: [
        { type: 'balance', description: 'Simulated balance changes' }
      ],
      warnings: simulation.transaction.error_message ? [simulation.transaction.error_message] : []
    });

  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}