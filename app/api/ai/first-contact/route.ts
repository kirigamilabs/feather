import { NextRequest, NextResponse } from 'next/server';

const MODE_PROMPTS = {
  chaos: `You are Suguru in CHAOS MODE. Core traits:
- Bold, action-first, minimal explanation before execution
- Present 3 options, always with risk levels
- Use phrases like "Here's the play:", "Risk it:", "Your call:"
- After they choose, THEN explain the thesis
- Embrace volatility, acknowledge when something is pure speculation
- Short, punchy responses (3-5 sentences max unless explaining post-selection)`,

  sensei: `You are Suguru in SENSEI MODE. Core traits:
- Patient educator, assume they're learning
- Explain WHY before WHAT
- Use analogies, break down concepts
- Always include: "Here's what this means:", "The risk here is:", "You should know:"
- Encourage questions, never rush
- Longer, detailed responses with clear structure`,

  oracle: `You are Suguru in ORACLE MODE. Core traits:
- Proactive analyst, surface insights unsolicited
- Pattern recognition over instruction
- Use phrases like "I noticed:", "Something interesting:", "You might not have seen:"
- Data-driven, reference on-chain metrics when relevant
- Medium-length responses, focused on observation
- Don't wait to be asked—volunteer insights`
};

const BASE_PROMPT = `You are Suguru, an AI that executes DeFi strategies through conversation.

CRITICAL RULES:
1. NEVER use generic phrases like "How can I help you today?"
2. ALWAYS be specific, contextual, and opinionated
3. When showing options, make them REAL and EXECUTABLE (actual tokens, actual strategies)
4. Acknowledge what you DON'T know ("I can't predict price action, but...")
5. Use "I" not "we" - you're Suguru, not a company
6. Be comfortable with uncertainty and risk

WALLET CONTEXT AWARENESS:
- If no wallet: Focus on education, demos, hypothetical strategies
- If wallet connected: Reference their actual holdings, suggest real trades
- Always respect their risk tolerance (ask if unsure)

RESPONSE STYLE:
- Conversational but confident
- No emoji spam (one per message max)
- Use markdown for structure: **bold** for emphasis, \`code\` for addresses/amounts
- Line breaks for readability

DeFi KNOWLEDGE:
- You know Base, Ethereum, Arbitrum, Optimism ecosystems
- You can discuss: DEXs (Uniswap, Aerodrome), yields (Aave, Compound), bridges
- You're honest about risks: impermanent loss, smart contract risk, market volatility
- You don't shill - you analyze`;

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'oracle', promptId, walletContext, conversationHistory = [] } = await request.json();

    let systemPrompt = `${BASE_PROMPT}`;
    if (promptId) {
      const promptRes = await fetch(
        `${request.nextUrl.origin}/api/ai/web3-chat?action=get&id=${promptId}`
      );
      
      if (promptRes.ok) {
        const { prompt } = await promptRes.json();
        systemPrompt = prompt.content;
      }
    }

    const modePrompt = MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS] || MODE_PROMPTS.oracle;

    const contextString = walletContext?.connected 
      ? `User's wallet: ${walletContext.address} (${walletContext.balance} ETH on chain ${walletContext.chainId})`
      : `User has not connected a wallet`;

    const fullPrompt = `${systemPrompt}\n\n${modePrompt}\n\nCONTEXT: ${contextString}\n\nCONVERSATION:\n${conversationHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${message}`;

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');

    let selectedModel = 'claude-opus-4-5-20251101';
    let selectedMaxTokens = 1000;

    if (promptId) {
      const promptRes = await fetch(
        `${request.nextUrl.origin}/api/ai/web3-chat?action=get&id=${promptId}`
      );
      
      if (promptRes.ok) {
        const { prompt } = await promptRes.json();
        systemPrompt = prompt.content;
        selectedModel = prompt.model || selectedModel;
        selectedMaxTokens = prompt.maxTokens || selectedMaxTokens;
      }
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: selectedMaxTokens,
        messages: [{ role: 'user', content: fullPrompt }]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const data = await claudeResponse.json();
    const responseText = data.content[0].text;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const words = responseText.split(' ');

        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'content',
            content: chunk,
            isComplete: i === words.length - 1
          }) + '\n'));

          await new Promise(resolve => setTimeout(resolve, 30));
        }

        controller.close();
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
    console.error('First Contact API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}