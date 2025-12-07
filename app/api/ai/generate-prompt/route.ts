import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    const generationPrompt = `You are an expert at creating system prompts for AI assistants.

Create a detailed system prompt for an AI named "${name}" with these characteristics:
${description}

The prompt should:
- Define clear personality traits
- Specify capabilities and limitations
- Include response style guidelines
- Be concise but comprehensive (200-400 words)
- Focus on DeFi/crypto context if relevant

Return ONLY the system prompt text, no explanations or meta-commentary.`;

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{ role: 'user', content: generationPrompt }]
      })
    });

    if (!response.ok) throw new Error('Claude API error');

    const data = await response.json();
    const content = data.content[0].text;

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generate prompt error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}