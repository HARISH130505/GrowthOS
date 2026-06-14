import { generateJSON } from "../lib/gemini";
import type { PlannerOutput } from "./planner.agent";
import type { AudienceOutput } from "./audience.agent";

export interface ChannelOutput {
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "RCS";
  reasoning: string;
  confidence: number;
  alternatives: Array<{
    channel: "EMAIL" | "SMS" | "WHATSAPP" | "RCS";
    score: number;
    reason: string;
  }>;
  expectedOpenRate: number;
  expectedClickRate: number;
}

const CHANNEL_SYSTEM_PROMPT = `You are a Channel Intelligence AI for GrowthOS.
Analyze the audience segment and campaign objective to recommend the optimal communication channel.

Indian e-commerce channel benchmarks:
- WHATSAPP: Open rate 68%, Click rate 25%, best for conversational, dormant customers, high engagement
- EMAIL: Open rate 28%, Click rate 8%, best for high-value customers, detailed offers, upselling
- SMS: Open rate 45%, Click rate 12%, best for urgent promos, transactional, churn risk
- RCS: Open rate 52%, Click rate 18%, best for rich media, premium segments, product showcases

Consider:
1. Segment characteristics (dormant vs active, high-value vs low-value)
2. Campaign objective (win-back vs upsell vs retention)
3. Average spend patterns
4. Geographic distribution

Return ONLY valid JSON:
{
  "channel": "EMAIL" | "SMS" | "WHATSAPP" | "RCS",
  "reasoning": "detailed explanation of why this channel was chosen",
  "confidence": number (0-1),
  "alternatives": [
    { "channel": "...", "score": number (0-1), "reason": "brief reason" }
  ],
  "expectedOpenRate": number (0-1),
  "expectedClickRate": number (0-1)
}`;

export async function runChannelAgent(
  plan: PlannerOutput,
  audience: AudienceOutput
): Promise<ChannelOutput> {
  const context = {
    campaignObjective: plan.objective,
    segmentSize: audience.size,
    avgSpend: audience.avgSpend,
    topCities: audience.topCities,
    audienceInsights: audience.insights,
    plannerRecommendation: plan.recommendedChannel,
  };

  return generateJSON<ChannelOutput>(
    CHANNEL_SYSTEM_PROMPT,
    JSON.stringify(context)
  );
}
