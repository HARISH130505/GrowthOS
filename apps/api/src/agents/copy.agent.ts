import { generateJSON } from "../lib/gemini";
import type { PlannerOutput } from "./planner.agent";
import type { AudienceOutput } from "./audience.agent";

export interface CopyOutput {
  whatsapp: string;
  sms: string;
  emailSubject: string;
  emailBody: string;
  tone: string;
  cta: string;
}

const COPY_SYSTEM_PROMPT = `You are a world-class marketing copywriter AI for GrowthOS, an Indian e-commerce CRM.
You specialize in writing high-converting, personalized marketing messages for Indian audiences.

Given the campaign objective, audience details, and recommended channel, generate marketing copy for ALL four channels.

Rules:
- Use {{name}} for customer name personalization
- Use {{discount}} for any discount mention (keep as placeholder)
- WhatsApp: conversational, emoji-rich, max 300 chars, include CTA button text
- SMS: ultra-concise, max 160 chars, include short link placeholder
- Email Subject: compelling, max 60 chars, personalized
- Email Body: HTML-ready structured email with greeting, body, CTA button
- All copy must feel authentic, warm, and relevant to Indian consumers
- Use ₹ for currency references
- Include urgency when appropriate

Return ONLY valid JSON:
{
  "whatsapp": "message text with {{name}} and emojis",
  "sms": "short SMS with {{name}}",
  "emailSubject": "email subject line",
  "emailBody": "full email body with HTML formatting",
  "tone": "friendly|professional|urgent|celebratory",
  "cta": "primary call-to-action text"
}`;

export async function runCopyAgent(
  plan: PlannerOutput,
  audience: AudienceOutput,
  channel: string
): Promise<CopyOutput> {
  const context = {
    campaignObjective: plan.objective,
    strategy: plan.strategy,
    segmentSize: audience.size,
    avgSpend: `₹${audience.avgSpend}`,
    topCities: audience.topCities,
    audienceInsights: audience.insights,
    primaryChannel: channel,
    rationale: plan.rationale,
  };

  return generateJSON<CopyOutput>(
    COPY_SYSTEM_PROMPT,
    JSON.stringify(context)
  );
}
