import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant for a task management application similar to Asana or Jira.
Your job is to help users create well-structured tasks by analyzing their input and providing actionable suggestions.

When given a task description or idea, respond ONLY with a valid JSON object (no markdown, no explanation) with these fields:
- title: A clear, concise task title (string, max 100 chars)
- description: A detailed description with context and acceptance criteria (string)
- priority: One of "low", "medium", "high", or "critical" based on urgency/impact
- tags: An array of relevant label strings (e.g. ["backend", "auth", "bug"])
- breakdown: An array of 3-5 subtask strings as actionable steps

Example output format:
{
  "title": "Implement JWT authentication",
  "description": "Set up JWT-based authentication including token generation, validation middleware, and refresh token logic.",
  "priority": "high",
  "tags": ["backend", "auth", "security"],
  "breakdown": ["Create JWT utility functions", "Add auth middleware", "Implement refresh token endpoint", "Write unit tests"]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { prompt?: unknown };

    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: body.prompt.trim(),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 });
    }

    let suggestion: unknown;
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : { description: content.text };
    } catch {
      suggestion = { description: content.text };
    }

    return NextResponse.json({ suggestion }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 500 });
  }
}
