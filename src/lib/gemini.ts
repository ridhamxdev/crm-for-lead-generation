import { GoogleGenerativeAI } from '@google/generative-ai';

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(apiKey);
}

const STATUS_CONTEXT: Record<string, string> = {
  new: 'This is a brand-new lead who just showed interest.',
  follow_up: 'This lead needs a follow-up to confirm their intent.',
  orders_convert: 'This lead is in the process of converting into a confirmed order.',
  design_phase: 'This lead is actively in the design consultation/selection phase.',
  hold_order: 'This lead has put their order on hold temporarily.',
  payment_50: 'This lead has made 50% advance payment — project is confirmed.',
  order_complete: "This lead's order has been fully completed and delivered.",
  closed: 'This lead has been successfully closed — project done and client satisfied.',
  rejected: 'This lead was not converted; they chose not to proceed.',
};

export interface GenerateMessageParams {
  leadName: string;
  leadStatus: string;
  orderValue?: number | null;
  userPrompt: string;
}

export async function generateWhatsAppMessage(
  params: GenerateMessageParams,
): Promise<string> {
  const { leadName, leadStatus, orderValue, userPrompt } = params;

  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const statusCtx = STATUS_CONTEXT[leadStatus] ?? 'This is an active lead.';
  const orderCtx = orderValue
    ? `Their estimated order value is ₹${orderValue.toLocaleString('en-IN')}.`
    : '';

  const prompt = `You are a professional and friendly sales representative for Vision Glass Interiors — a premium glass interior design company based in India.

About this lead:
- Name: ${leadName}
- Pipeline stage: ${leadStatus.replace(/_/g, ' ')} — ${statusCtx}
${orderCtx}

Your task: ${userPrompt}

Instructions for the message:
- Open by addressing the lead by their first name warmly
- Keep the message concise — 2 to 3 short paragraphs maximum
- Tone: professional yet warm and conversational (this is WhatsApp, not email)
- Include a clear and polite call-to-action if appropriate
- End with "— Team Vision Glass Interiors"
- Do NOT add a subject line, "Message:", greeting prefix, or any meta-commentary
- Return only the final WhatsApp message text, ready to send

Write the WhatsApp message now:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  if (!text) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  return text;
}
