import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Set max duration for the request
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let prompt: string;
    const conversationId = body.conversationId;
    
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

    // If we have a conversationId, load the full conversation history from Supabase
    let conversationHistory = [];
    if (conversationId) {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && messages) {
          conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }

    // Check if any message contains file data
    const hasFileData = body.messages?.some(m =>
      Array.isArray(m.content) &&
      m.content.some(c => c.type === 'file' && c.data)
    );

    if (hasFileData) {
      // Combine conversation history with current messages for file-based chat
      const allMessages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }]
        })),
        ...body.messages.map(m => {
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
          // For regular text messages
          return {
            role: m.role,
            content: [{ type: 'text', text: m.content }]
          };
        })
      ];

      const result = await generateText({
        model: google('gemini-1.5-flash'),
        messages: allMessages
      });

      return new Response(JSON.stringify({ text: result }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle regular text-based chat
    if ('prompt' in body) {
      prompt = body.prompt;

      // Include full conversation history from Supabase
      const allHistoryMessages = [
        ...conversationHistory,
        ...(body.messages || [])
      ];
      
      if (allHistoryMessages.length > 0) {
        const formattedHistory = allHistoryMessages.map(m =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');

        prompt = `${formattedHistory}\n\nUser: ${prompt}`;
      }
    } else if ('messages' in body && Array.isArray(body.messages)) {
      // Combine Supabase history with current request messages
      const allMessages = [...conversationHistory, ...body.messages];
      
      if (allMessages[0]?.role === 'system') {
        systemPrompt = allMessages[0].content;
        const otherMessages = allMessages.slice(1);
        prompt = otherMessages.map(m =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');
      } else {
        prompt = allMessages.map(m =>
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
