import { NextRequest, NextResponse } from 'next/server';

// Community Ollama servers from ollamafreeapi (verified endpoints)
const OLLAMA_SERVERS = [
  'http://172.236.213.60:11434',
  'http://108.181.196.208:11434',
  'http://5.149.249.212:11434',
  'http://89.111.170.212:11434',
  'http://185.211.5.32:11434',
];
const OLLAMA_MODEL = 'llama3.2:3b';
const TIMEOUT_MS = 10_000;

const STATUS_CONTEXT: Record<string, string> = {
  new: 'a new inquiry who has not yet been contacted',
  follow_up: 'a lead who showed interest and needs a follow-up',
  orders_convert: 'a lead who is close to placing an order',
  design_phase: 'a customer currently in the design/measurement phase',
  hold_order: 'a customer who put their order on hold',
  payment_50: 'a customer who paid 50% advance and whose work is in progress',
  order_complete: 'a customer whose order/project has been completed',
  closed: 'a past customer we want to thank and stay in touch with',
  rejected: 'a lead who declined, but we want to leave the door open',
};

async function tryOllamaServer(serverUrl: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${serverUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json() as { response?: string };
    if (!data.response?.trim()) throw new Error('Empty response from server');
    return data.response.trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadName, leadStatus, orderValue, userPrompt } = body;

    if (!leadName?.trim()) {
      return NextResponse.json({ error: 'leadName is required.' }, { status: 400 });
    }
    if (!leadStatus?.trim()) {
      return NextResponse.json({ error: 'leadStatus is required.' }, { status: 400 });
    }
    if (!userPrompt?.trim()) {
      return NextResponse.json({ error: 'userPrompt is required.' }, { status: 400 });
    }

    const context = STATUS_CONTEXT[String(leadStatus)] ?? 'a lead';
    const orderNote = orderValue ? ` Their estimated order value is ₹${Number(orderValue).toLocaleString('en-IN')}.` : '';

    const prompt = `You are a professional sales executive at Vision Glass Interiors, a premium glass décor company (visionglassinteriors.in). Write a short, warm WhatsApp follow-up message for ${String(leadName).trim()}, who is ${context}.${orderNote}

Additional context from the sales team: ${String(userPrompt).trim()}

Rules:
- Write ONLY the WhatsApp message text, nothing else
- Keep it under 100 words
- Be warm, professional, and conversational
- Do NOT use markdown formatting
- End with: — Team Vision Glass Interiors`;

    let lastError = '';
    for (const server of OLLAMA_SERVERS) {
      try {
        const message = await tryOllamaServer(server, prompt);
        return NextResponse.json({ data: { message } });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[AI] Server ${server} failed:`, lastError);
      }
    }

    return NextResponse.json(
      { error: 'All AI servers are currently unavailable. Please use a template instead.' },
      { status: 503 },
    );
  } catch (err) {
    console.error('[POST /api/ai/generate-message]', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg || 'Failed to generate message.' }, { status: 500 });
  }
}
