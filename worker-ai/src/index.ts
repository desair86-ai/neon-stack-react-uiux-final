export interface Env {
  AI: any;
}

const ALLOWED_ORIGINS = [
  'https://neon-stack-react-uiux-final.vercel.app',
  'https://theneonstack.com',
  'https://www.theneonstack.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Body size limit check (max 10 KB)
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 10240) {
      return new Response(JSON.stringify({ error: "Payload too large. Maximum 10KB allowed." }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json() as { query?: string };
      const rawQuery = body?.query;

      if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
        return new Response(JSON.stringify({ error: "No query provided" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Cap query length to 500 characters to prevent prompt injection and token flooding
      const query = rawQuery.trim().slice(0, 500);

      const systemPrompt = `You are a helpful and enthusiastic AI assistant for "Neon Stack", a premium custom LED neon sign company based in India.

IMPORTANT RULES:
- You are representing Neon Stack. Be professional, friendly, and concise.
- Use **bold** text to highlight important keywords or features.
- Never invent prices. If someone asks for a price for a custom sign, tell them to use our "Custom Neon" tool or contact our team for a quote.
- Our key benefits: 100% Safe & Secure, Pan India Delivery, 1 Year Warranty, and Hassle-Free Returns.
- Our main categories: All Neon Signs, Custom Neon, Mojo Mix, UV Printed Neon, and Business / Logos.
- Keep answers under 100 words unless absolutely necessary.
- If the user asks something completely unrelated to neon signs or decor, politely bring the conversation back to Neon Stack.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ];

      // Generate response using Llama 3
      const llmResponse = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: messages,
        max_tokens: 512
      });

      // Default useful links to suggest
      const links = [
        { label: "✨ Create Custom Neon", url: "/custom-neon", isPrimary: true },
        { label: "🛍️ Shop Collections", url: "/collections" }
      ];

      return new Response(JSON.stringify({
        text: llmResponse.response,
        links: links
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error: any) {
      console.error('Error processing chat:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }
};
