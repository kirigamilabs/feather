import { NextResponse } from 'next/server';

// Simulated response streaming
async function* generateResponse(message: string, context: any) {
  const chunks = [
    { content: 'I understand ', role: 'assistant' },
    { content: 'you want to ', role: 'assistant' },
    { content: `${message}. `, role: 'assistant' },
    { 
      content: 'Based on market conditions, I recommend:',
      metadata: {
        confidence: 0.95,
        market_sentiment: 'bullish',
        risk_level: 'moderate'
      }
    }
  ];

  for (const chunk of chunks) {
    yield chunk;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function POST(req: Request) {
  const { message } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateResponse(message, {})) {
          controller.enqueue(
            new TextEncoder().encode(
              JSON.stringify(chunk) + '\r\n'
            )
          );
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  });
}