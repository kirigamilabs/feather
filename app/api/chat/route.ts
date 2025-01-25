import { NextRequest } from 'next/server'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockResponses = [
  {
    content: "I've analyzed the current market conditions. Based on your portfolio, I recommend considering DeFi yield opportunities. Would you like me to show you the top protocols?",
    action: { type: 'execute_trade' }
  },
  {
    content: "I notice your portfolio has high exposure to volatile assets. I can help you hedge using automated strategies. Should we explore some options?",
    action: { type: 'execute_trade' }
  },
  {
    content: "Looking at recent price movements, there might be an arbitrage opportunity between DEXs. I can execute this trade automatically if you're interested.",
    action: { type: 'execute_trade' }
  }
]

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { message } = data

  // Create stream
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Simulate streaming response
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
  const chunks = response.content.split(' ')

  // Stream response word by word
  streamResponse(writer, encoder, chunks, response.action)

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function streamResponse(
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  chunks: string[],
  action?: { type: string }
) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] + (i === chunks.length - 1 ? '' : ' ')
    const data = {
      content: chunk,
      ...(i === chunks.length - 1 && action ? { action } : {})
    }
    
    await writer.write(encoder.encode(JSON.stringify(data)))
    await sleep(50) // Simulate network delay
  }
  
  await writer.close()
}