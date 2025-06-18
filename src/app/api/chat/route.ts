import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { NextRequest } from 'next/server';

// Set max duration for the request
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let prompt: string;
    let systemPrompt = `You are a helpful assistant for estate matters. Format your responses using markdown:
- Use bullet points for lists
- Use numbered lists for steps or sequences
- Use headings (##) for main topics
- Use bold (**) for emphasis
- Use proper line breaks between paragraphs
- Use code blocks (\`\`) for technical terms
- Keep paragraphs concise and well-spaced

You will answer non-legal, estate matters. When asked a legal question, refuse politely and explain concisely.

Remember to maintain context from the previous messages in the conversation when responding.`;

    // Check if any message contains file data
    const hasFileData = body.messages?.some(m =>
      Array.isArray(m.content) &&
      m.content.some(c => c.type === 'file' && c.data)
    );

    if (hasFileData) {
      // Format messages for file-based chat, including history
      const formattedMessages = body.messages.map(m => {
        // For messages with file content
        if (Array.isArray(m.content)) {
          return {
            role: m.role,
            content: m.content.map(c => {
              if (c.type === 'file' && c.data) {
                return {
                  type: 'file',
                  data: Buffer.from(c.data, 'base64'),
                  mimeType: c.mimeType
                };
              }
              return c;
            })
          };
        }
        // For regular text messages in history
        return {
          role: m.role,
          content: [{ type: 'text', text: m.content }]
        };
      });

      const result = await generateText({
        model: google('gemini-1.5-flash'),
        messages: formattedMessages
      });

      return new Response(JSON.stringify({ text: result }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle regular text-based chat
    if ('prompt' in body) {
      prompt = body.prompt;

      // Format conversation history
      if (body.messages && Array.isArray(body.messages)) {
        const conversationHistory = body.messages.map(m =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');

        prompt = `${conversationHistory}\n\nUser: ${prompt}`;
      }
    } else if ('messages' in body && Array.isArray(body.messages)) {
      if (body.messages[0]?.role === 'system') {
        systemPrompt = body.messages[0].content;
        const otherMessages = body.messages.slice(1);
        prompt = otherMessages.map(m =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');
      } else {
        prompt = body.messages.map(m =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      prompt
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
