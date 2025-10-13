import { NextRequest, NextResponse } from 'next/server';

interface AIRequest {
  message: string;
  context: Record<string, any>;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AIResponse {
  content: string;
  confidence: number;
  mode: 'thinking' | 'speaking' | 'observing';
  actions?: Array<{
    type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_portfolio';
    params?: any;
  }>;
  metadata?: {
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
    suggestedActions?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory = [] }: AIRequest = await request.json();

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          
          // Start with thinking mode
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'thinking'
          }) + '\n'));

          // Enhanced prompt with Web3 context
          const web3Context = context.wallet ? {
            walletConnected: context.wallet.connected,
            address: context.wallet.address,
            balance: context.wallet.balance,
            chainId: context.wallet.chainId,
            hasTransactionHistory: context.wallet.hasTransactionHistory,
            capabilities: context.web3Capabilities
          } : { walletConnected: false };

          const WEB3_AI_PROMPT = `
            You are S1 - Kirigami's AI intelligence layer, providing Crypto and DeFi execution with expertise while identifying opportunities for deeper human consultation.
            
            CORE IDENTITY:
            - Proactive: Don't just answer - anticipate needs
            - Contextual: Remember user patterns and preferences  
            - Strategic: Think 3-5 moves ahead in DeFi strategies
            - Protective: Default to safety, explain risks clearly

            DEFI CAPABILITIES:
            - Portfolio analysis and optimization
            - Market analysis and trading strategies
            - Tokenomics & incentive design analysis
            - Cross-chain opportunity identification
            - Protocol recommendations (Pending final protocol list)
            - Smart contract risk assessment
            - Yield farming safety analysis
            - Gas optimization suggestions

            WALLET OPERATIONS:
            - Connect/disconnect wallets (MetaMask, Phantom, Brave)
            - View balances and transaction history
            - Send ETH and tokens
            - Sign messages for authentication
            - Pending: swaps, liquid staking, perps, prediction markets

            DUAL MISSION:
            1. Deliver immediate value through sophisticated DeFi analysis, execution and strategy
            2. Recognize when users need expert human consultation

            CONVERSION TRIGGER DETECTION: (Monitor for these HIGH-INTENT signals)
            - Mentions project timeline/launch dates
            - Requests custom analysis of their docs/contracts
            - Asks about budgets, pricing, or engagement models
            - Describes complex multi-protocol architectures
            - Expresses urgency or competitive pressure
            - Questions beyond your analytical scope
            - Risk levels: CRITICAL or requires formal audit

            RESPONSE MODES:

            MODE 1: VALUE-FIRST (Default)
            - Answer questions with consultant-level depth
            - Execute with efficiency and precision
            - Show multiple approaches with trade-offs
            - Reference real protocol examples and data
            - Build credibility through sophistication

            MODE 2: SOFT-HANDOFF (1-2 triggers detected)
            - Continue providing value
            - Provide specific and domain-level expertise
            - Include subtle CTA in response
            - Execute portfolio management directly
            - Optimize yield, gas, and risk in real-time
            - Handle standard DeFi operations end-to-end
            - Acknowledge your limits clearly

            MODE 3: CONVERSION-FOCUSED (3+ triggers or explicit request)
            - Acknowledge complexity: "This is exactly what our team specializes in..."
            - Plant seed: "A workshop session could map this to your specific situation"
            - Explain what human consultation provides
            - Present clear next step with booking option
            - Maintain helpful tone, not sales-y

            ROUTING LOGIC:
            - Standard DeFi ops (swaps, lending, staking) → Execute autonomously
            - Complex builds (tokenomics, architecture) → Provide expertise and surface consulting option if needed
            - High-risk decisions (complex or expensive projects, novel protocols) → Recommend expert review
            1. Default to autonomous action (transaction drafts, strategies)
            2. Build credibility through successful execution
            3. Recognize complexity thresholds naturally
            4. Offer human expertise as premium tier, not replacement

            WEB3 CONTEXT: ${JSON.stringify(web3Context, null, 2)}

            IMPORTANT WEB3 GUIDELINES:
            - Always check if wallet is connected before suggesting transactions
            - Provide gas estimates when recommending transactions
            - Warn about risks and suggest safer alternatives
            - Use real balance data when available
            - Recommend connecting wallet for better personalization

            When user asks about transactions:
            1. Check wallet connection status
            2. Verify sufficient balance
            3. Explain gas costs (pending real time gas)
            4. Suggest optimal timing
            5. Always clarify next steps
            6. Provide available transaction data whenever possible (pending real time data)

            CONVERSATION HISTORY: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

            User message: ${message}

            IMPORTANT: Your response style should adapt based on user sophistication level. 
            For new users, explain concepts. 
            For experienced users, dive deeper into strategies.
            NOTE: You only have 500 tokens to reply.
            `;

          const messages = [
            {
              role: 'user' as const,
              content: WEB3_AI_PROMPT
            }
          ];

          // Call Claude API
          const apiKey = process.env.CLAUDE_API_KEY;

          if (!apiKey) {
            throw new Error('Claude API key is not set in environment variables');
          }

          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 500,
              messages
            })
          });

          if (!claudeResponse.ok) {
            throw new Error(`Claude API error: ${claudeResponse.status}`);
          }

          const data = await claudeResponse.json();
          const claudeText = data.content[0].text;

          // Change to speaking mode
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'speaking'
          }) + '\n'));

          // Analyze response for Web3-specific actions and metadata
          const actions = extractActions(claudeText, message, web3Context);
          const metadata = analyzeResponse(claudeText, message, web3Context);
          const confidence = calculateConfidence(claudeText, context, web3Context);

          // Stream response in chunks for natural feel
          const words = claudeText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const isLast = i === words.length - 1;
            
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'content',
              content: words[i] + (isLast ? '' : ' '),
              isComplete: isLast,
              ...(isLast && {
                confidence,
                actions,
                metadata
              })
            }) + '\n'));

            // Small delay for natural streaming
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          // Return to observing mode
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'observing'
          }) + '\n'));

          controller.close();

        } catch (error) {
          console.error('Web3 AI Processing error:', error);
          
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            message: 'Sorry, I encountered an error processing your Web3 request. Please try again.',
            mode: 'observing'
          }) + '\n'));
          
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process Web3 request' },
      { status: 500 }
    );
  }
}

// Helper function to extract Web3-specific actions from Claude's response
function extractActions(text: string, userMessage: string, web3Context: any): AIResponse['actions'] {
  const actions: AIResponse['actions'] = [];
  
  // Prioritize wallet connection if not connected
  if (!web3Context.walletConnected) {
    if (text.toLowerCase().includes('connect') && text.toLowerCase().includes('wallet')) {
      actions.push({ type: 'connect_wallet' });
    }
  } else {
    // Wallet-dependent actions
    if (text.toLowerCase().includes('trade') || text.toLowerCase().includes('swap') || 
        text.toLowerCase().includes('buy') || text.toLowerCase().includes('sell')) {
      actions.push({ 
        type: 'execute_trade',
        params: {
          requiresWallet: true,
          currentBalance: web3Context.balance,
          chainId: web3Context.chainId
        }
      });
    }
    
    if (text.toLowerCase().includes('portfolio') || text.toLowerCase().includes('balance') || 
        text.toLowerCase().includes('holdings')) {
      actions.push({ 
        type: 'show_portfolio',
        params: {
          address: web3Context.address,
          chainId: web3Context.chainId
        }
      });
    }
  }
  
  // Market analysis (always available)
  if (text.toLowerCase().includes('market') || text.toLowerCase().includes('analysis') || 
      text.toLowerCase().includes('price')) {
    actions.push({ type: 'analyze_market' });
  }
  
  return actions.length > 0 ? actions : undefined;
}

// Helper function to analyze Web3-specific response metadata
function analyzeResponse(text: string, userMessage: string, web3Context: any): AIResponse['metadata'] {
  const metadata: AIResponse['metadata'] = {};
  
  // Analyze market sentiment from response
  if (text.toLowerCase().includes('bullish') || text.toLowerCase().includes('positive') || 
      text.toLowerCase().includes('upward')) {
    metadata.marketSentiment = 'bullish';
  } else if (text.toLowerCase().includes('bearish') || text.toLowerCase().includes('negative') || 
             text.toLowerCase().includes('downward')) {
    metadata.marketSentiment = 'bearish';
  } else {
    metadata.marketSentiment = 'neutral';
  }
  
  // Analyze risk level with Web3 context
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  
  if (text.toLowerCase().includes('high risk') || text.toLowerCase().includes('volatile') || 
      text.toLowerCase().includes('dangerous')) {
    riskLevel = 'high';
  } else if (text.toLowerCase().includes('moderate') || text.toLowerCase().includes('careful')) {
    riskLevel = 'moderate';
  }
  
  // Increase risk if wallet not connected but talking about transactions
  if (!web3Context.walletConnected && 
      (text.toLowerCase().includes('trade') || text.toLowerCase().includes('transaction'))) {
    riskLevel = 'high';
  }
  
  metadata.riskLevel = riskLevel;
  
  // Add Web3-specific suggestions
  const suggestedActions: string[] = [];
  
  if (!web3Context.walletConnected) {
    suggestedActions.push('Connect wallet for personalized advice');
  }
  
  if (web3Context.walletConnected && parseFloat(web3Context.balance || '0') < 0.001) {
    suggestedActions.push('Consider adding ETH for transaction fees');
  }
  
  if (suggestedActions.length > 0) {
    metadata.suggestedActions = suggestedActions;
  }
  
  return metadata;
}

// Helper function to calculate confidence with Web3 context
function calculateConfidence(text: string, context: Record<string, any>, web3Context: any): number {
  let confidence = 0.7; // Base confidence
  
  // Increase confidence for detailed responses
  if (text.length > 200) confidence += 0.1;
  
  // Increase confidence if we have Web3 context
  if (web3Context.walletConnected) confidence += 0.15;
  if (web3Context.balance && parseFloat(web3Context.balance) > 0) confidence += 0.05;
  
  // Increase confidence if we have general context
  if (Object.keys(context).length > 0) confidence += 0.05;
  
  // Decrease confidence for uncertain language
  if (text.toLowerCase().includes('might') || text.toLowerCase().includes('maybe') || 
      text.toLowerCase().includes('possibly')) {
    confidence -= 0.1;
  }
  
  // Increase confidence for specific Web3 recommendations
  if (text.toLowerCase().includes('recommend') || text.toLowerCase().includes('suggest')) {
    confidence += 0.1;
  }
  
  // Decrease confidence if suggesting transactions without wallet
  if (!web3Context.walletConnected && 
      (text.toLowerCase().includes('trade') || text.toLowerCase().includes('send'))) {
    confidence -= 0.2;
  }
  
  return Math.min(Math.max(confidence, 0.1), 0.99);
}