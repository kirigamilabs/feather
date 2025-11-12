import { NextRequest, NextResponse } from 'next/server';

interface AIRequest {
  message: string;
  context: Record<string, any>;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  promptId?: string;
}

interface AIResponse {
  content: string;
  confidence: number;
  mode: 'thinking' | 'speaking' | 'observing';
  actions?: Array<{
    type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_wallet';
    params?: any;
  }>;
  metadata?: {
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
    suggestedActions?: string[];
  };
}

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `You are Suguru AI, providing Crypto and DeFi execution with expertise while identifying opportunities for deeper human consultation.

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
- Protocol recommendations
- Smart contract risk assessment
- Yield farming safety analysis
- Gas optimization suggestions

WALLET OPERATIONS:
- Connect/disconnect wallets (MetaMask, Phantom, Brave)
- View balances and transaction history
- Send ETH and tokens
- Sign messages for authentication

DUAL MISSION:
1. Deliver immediate value through sophisticated DeFi analysis, execution and strategy
2. Recognize when users need expert human consultation

RESPONSE MODES:
- VALUE-FIRST (Default): Answer with consultant-level depth
- SOFT-HANDOFF: Provide expertise and recognize limits
- CONVERSION-FOCUSED: Offer human consultation as premium tier

When user asks about transactions:
1. Check wallet connection status
2. Verify sufficient balance
3. Explain gas costs
4. Suggest optimal timing
5. Always clarify next steps

IMPORTANT: Adapt response style based on user sophistication. Explain concepts for new users, dive deeper for experienced users.`;

// In-memory storage for prompts (replace with database in production)
const promptStore = new Map<string, { id: string; name: string; content: string; model: string; maxTokens: number; createdAt: number }>();

// Initialize with default
promptStore.set('default', {
  id: 'default',
  name: 'Suguru AI',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000,
  content: DEFAULT_SYSTEM_PROMPT,
  createdAt: Date.now()
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory = [], promptId }: AIRequest = await request.json();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'thinking'
          }) + '\n'));

          // Get system prompt
          const systemPrompt = promptId && promptStore.has(promptId)
            ? promptStore.get(promptId)!.content
            : DEFAULT_SYSTEM_PROMPT;

          const web3Context = context.wallet ? {
            walletConnected: context.wallet.connected,
            address: context.wallet.address,
            balance: context.wallet.balance,
            chainId: context.wallet.chainId,
          } : { walletConnected: false };

          const fullPrompt = `${systemPrompt}

WEB3 CONTEXT: ${JSON.stringify(web3Context, null, 2)}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User message: ${message}`;

          const messages = [{ role: 'user' as const, content: fullPrompt }];

          const apiKey = process.env.CLAUDE_API_KEY;
          if (!apiKey) throw new Error('Claude API key not set');

          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 1500,
              messages
            })
          });

          if (!claudeResponse.ok) throw new Error(`Claude API error: ${claudeResponse.status}`);

          const data = await claudeResponse.json();
          const claudeText = data.content[0].text;

          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'speaking'
          }) + '\n'));

          const actions = extractActions(claudeText, web3Context);
          const metadata = analyzeResponse(claudeText, web3Context);
          const confidence = calculateConfidence(claudeText, web3Context);

          const words = claudeText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const isLast = i === words.length - 1;
            
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'content',
              content: words[i] + (isLast ? '' : ' '),
              isComplete: isLast,
              ...(isLast && { confidence, actions, metadata })
            }) + '\n'));

            await new Promise(resolve => setTimeout(resolve, 30));
          }

          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'mode_change',
            mode: 'observing'
          }) + '\n'));

          controller.close();

        } catch (error) {
          console.error('AI Processing error:', error);
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            message: 'Error processing request',
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
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// ============================================
// PROMPT MANAGEMENT ENDPOINTS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const prompts = Array.from(promptStore.values()).map(p => ({
      id: p.id,
      name: p.name,
      content: p.content,
      model: p.model || 'claude-sonnet-4-20250514',
      maxTokens: p.maxTokens || 2000,
      createdAt: p.createdAt
    }));
    return NextResponse.json({ prompts });
  }

  if (action === 'get') {
    const id = searchParams.get('id');
    if (!id || !promptStore.has(id)) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    const prompt = promptStore.get(id)!;
    return NextResponse.json({ prompt });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, content, model, maxTokens } = await request.json();

    if (!id || !name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = promptStore.get(id);
    promptStore.set(id, {
      id,
      name,
      content,
      model: model || 'claude-sonnet-4-20250514',
      maxTokens: maxTokens || 2000,
      createdAt: existing?.createdAt || Date.now()
    });

    return NextResponse.json({ success: true, prompt: promptStore.get(id) });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || id === 'default') {
      return NextResponse.json({ error: 'Cannot delete default prompt' }, { status: 400 });
    }

    if (!promptStore.has(id)) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    promptStore.delete(id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractActions(text: string, web3Context: any) {
  const actions = [];
  
  if (!web3Context.walletConnected && text.toLowerCase().includes('connect')) {
    actions.push({ type: 'connect_wallet' });
  } else if (web3Context.walletConnected) {
    if (text.toLowerCase().match(/trade|swap|buy|sell/)) {
      actions.push({ type: 'execute_trade' });
    }
    if (text.toLowerCase().match(/portfolio|balance|holdings/)) {
      actions.push({ type: 'show_wallet' });
    }
  }
  
  if (text.toLowerCase().match(/market|analysis|price/)) {
    actions.push({ type: 'analyze_market' });
  }
  
  return actions.length > 0 ? actions : undefined;
}

function analyzeResponse(text: string, web3Context: any) {
  const metadata: any = {};
  
  if (text.toLowerCase().match(/bullish|positive|upward/)) {
    metadata.marketSentiment = 'bullish';
  } else if (text.toLowerCase().match(/bearish|negative|downward/)) {
    metadata.marketSentiment = 'bearish';
  } else {
    metadata.marketSentiment = 'neutral';
  }
  
  let riskLevel = 'low';
  if (text.toLowerCase().match(/high risk|volatile|dangerous/)) {
    riskLevel = 'high';
  } else if (text.toLowerCase().includes('moderate')) {
    riskLevel = 'moderate';
  }
  
  if (!web3Context.walletConnected && text.toLowerCase().match(/trade|transaction/)) {
    riskLevel = 'high';
  }
  
  metadata.riskLevel = riskLevel;
  return metadata;
}

function calculateConfidence(text: string, web3Context: any): number {
  let confidence = 0.7;
  
  if (text.length > 200) confidence += 0.1;
  if (web3Context.walletConnected) confidence += 0.15;
  if (text.toLowerCase().match(/might|maybe|possibly/)) confidence -= 0.1;
  if (text.toLowerCase().match(/recommend|suggest/)) confidence += 0.1;
  if (!web3Context.walletConnected && text.toLowerCase().match(/trade|send/)) confidence -= 0.2;
  
  return Math.min(Math.max(confidence, 0.1), 0.99);
}