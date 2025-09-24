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

          // Build conversation context for Claude
          const messages = [
            {
              role: 'user' as const,
              content: `You are S0, an advanced AI assistant specialized in cryptocurrency and DeFi management. You help users with:

- Portfolio analysis and optimization
- Market analysis and insights  
- DeFi protocol recommendations
- Trading strategies
- Risk assessment
- Wallet management guidance

Current context: ${JSON.stringify(context, null, 2)}

Conversation history: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User message: ${message}

Respond as S0 with:
1. Helpful, actionable advice
2. If the user needs to connect a wallet, suggest it
3. If they ask about trades, provide analysis first
4. Always consider risk management
5. Be conversational but professional

If you recommend specific actions, indicate them clearly.`
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
              'x-api-key': apiKey, // Make sure this is set in your .ENV
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1000,
              messages
            })
          });

          console.log(claudeResponse)

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

          // Analyze response for actions and metadata
          const actions = extractActions(claudeText, message);
          const metadata = analyzeResponse(claudeText, message);
          const confidence = calculateConfidence(claudeText, context);

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
          console.error('AI Processing error:', error);
          
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            message: 'Sorry, I encountered an error processing your request. Please try again.',
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
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function to extract potential actions from Claude's response
function extractActions(text: string, userMessage: string): AIResponse['actions'] {
  const actions: AIResponse['actions'] = [];
  
  // Check for wallet connection suggestions
  if (text.toLowerCase().includes('connect') && text.toLowerCase().includes('wallet')) {
    actions.push({ type: 'connect_wallet' });
  }
  
  // Check for trade suggestions
  if (text.toLowerCase().includes('trade') || text.toLowerCase().includes('swap') || text.toLowerCase().includes('buy') || text.toLowerCase().includes('sell')) {
    actions.push({ type: 'execute_trade' });
  }
  
  // Check for market analysis requests
  if (text.toLowerCase().includes('market') || text.toLowerCase().includes('analysis') || text.toLowerCase().includes('price')) {
    actions.push({ type: 'analyze_market' });
  }
  
  // Check for portfolio requests
  if (text.toLowerCase().includes('portfolio') || text.toLowerCase().includes('balance') || text.toLowerCase().includes('holdings')) {
    actions.push({ type: 'show_portfolio' });
  }
  
  return actions.length > 0 ? actions : undefined;
}

// Helper function to analyze response metadata
function analyzeResponse(text: string, userMessage: string): AIResponse['metadata'] {
  const metadata: AIResponse['metadata'] = {};
  
  // Analyze market sentiment from response
  if (text.toLowerCase().includes('bullish') || text.toLowerCase().includes('positive') || text.toLowerCase().includes('upward')) {
    metadata.marketSentiment = 'bullish';
  } else if (text.toLowerCase().includes('bearish') || text.toLowerCase().includes('negative') || text.toLowerCase().includes('downward')) {
    metadata.marketSentiment = 'bearish';
  } else {
    metadata.marketSentiment = 'neutral';
  }
  
  // Analyze risk level
  if (text.toLowerCase().includes('high risk') || text.toLowerCase().includes('volatile') || text.toLowerCase().includes('dangerous')) {
    metadata.riskLevel = 'high';
  } else if (text.toLowerCase().includes('moderate') || text.toLowerCase().includes('careful')) {
    metadata.riskLevel = 'moderate';
  } else {
    metadata.riskLevel = 'low';
  }
  
  return metadata;
}

// Helper function to calculate confidence based on response characteristics
function calculateConfidence(text: string, context: Record<string, any>): number {
  let confidence = 0.7; // Base confidence
  
  // Increase confidence for detailed responses
  if (text.length > 200) confidence += 0.1;
  
  // Increase confidence if we have context
  if (Object.keys(context).length > 0) confidence += 0.1;
  
  // Decrease confidence for uncertain language
  if (text.toLowerCase().includes('might') || text.toLowerCase().includes('maybe') || text.toLowerCase().includes('possibly')) {
    confidence -= 0.1;
  }
  
  // Increase confidence for specific recommendations
  if (text.toLowerCase().includes('recommend') || text.toLowerCase().includes('suggest')) {
    confidence += 0.1;
  }
  
  return Math.min(Math.max(confidence, 0.1), 0.99);
}