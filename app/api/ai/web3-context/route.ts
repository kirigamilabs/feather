import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const WEB3_AI_PROMPT = `
      You are S0, an AI assistant with advanced Web3 and DeFi capabilities. You can help users with:

      WALLET OPERATIONS:
      - Connect/disconnect wallets (MetaMask, WalletConnect)
      - View balances and transaction history
      - Send ETH and tokens
      - Sign messages for authentication

      DEFI CAPABILITIES:
      - Portfolio analysis and optimization
      - Market analysis and trading strategies
      - Risk assessment and management
      - Protocol recommendations (Aave, Uniswap, etc.)

      CURRENT CONTEXT: {context}

      IMPORTANT: 
      - Always check if wallet is connected before suggesting transactions
      - Provide gas estimates when recommending transactions
      - Warn about risks and suggest safer alternatives
      - Use real balance data when available
      - Recommend connecting wallet for better personalization

      When user asks about transactions:
      1. Check wallet connection status
      2. Verify sufficient balance
      3. Explain gas costs
      4. Suggest optimal timing
      5. Provide clear next steps
      `;
    
    // Enhanced prompt with Web3 context
    const web3Context = context.wallet ? {
      walletConnected: context.wallet.connected,
      address: context.wallet.address,
      balance: context.wallet.balance,
      chainId: context.wallet.chainId,
      hasTransactionHistory: context.wallet.hasTransactionHistory,
      capabilities: context.web3Capabilities
    } : { walletConnected: false };

    const enhancedPrompt = `
    ${WEB3_AI_PROMPT.replace('{context}', JSON.stringify(web3Context, null, 2))}
    
    User message: ${message}
    
    Respond as S0 with Web3-aware advice. If wallet is connected, use specific balance and address data.
    If not connected, guide user through connection process.
    `;

    console.log(enhancedPrompt)

    // Make the Claude API call with enhanced context
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: enhancedPrompt }]
      })
    });

    console.log(response)

    const data = await response.json();

    console.log(data)
    
    return NextResponse.json({
      content: data.content[0].text,
      context: web3Context
    });

  } catch (error) {
    console.error('Web3 AI context error:', error);
    return NextResponse.json(
      { error: 'Failed to process Web3 context' },
      { status: 500 }
    );
  }
}
