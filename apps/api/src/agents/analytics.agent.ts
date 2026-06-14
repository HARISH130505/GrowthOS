import { generateJSON } from "../lib/gemini";
import prisma from "../db/prisma";

export interface AnalyticsOutput {
  insights: string[];
  recommendations: string[];
  overallPerformance: "POOR" | "FAIR" | "GOOD" | "EXCELLENT";
  nextBestAction: string;
}

const ANALYTICS_SYSTEM_PROMPT = `You are a Campaign Analytics AI for GrowthOS.
Analyze the provided campaign metrics and generate actionable insights and recommendations.

Given the actual performance metrics (sent, delivered, opened, clicked, purchased) and the original expected KPIs, evaluate the campaign's success.

Return ONLY valid JSON:
{
  "insights": [
    "Array of 2-3 specific insights based on the data (e.g., 'Open rate was 15% lower than expected, indicating the WhatsApp message might have been sent at the wrong time.')"
  ],
  "recommendations": [
    "Array of 2-3 actionable recommendations for the next campaign"
  ],
  "overallPerformance": "POOR" | "FAIR" | "GOOD" | "EXCELLENT",
  "nextBestAction": "The single most important next step (e.g., 'Retarget the 450 users who opened but did not click with a stronger SMS offer.')"
}`;

export async function runAnalyticsAgent(campaignId: string): Promise<AnalyticsOutput> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      segment: true,
    },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const context = {
    campaignName: campaign.name,
    objective: campaign.goal,
    channel: campaign.channel,
    audienceSize: campaign.segment.size,
    expectedKPIs: {
      openRate: campaign.estimatedOpenRate,
      clickRate: campaign.estimatedClickRate,
      conversionRate: campaign.estimatedConversionRate,
      revenue: campaign.estimatedRevenue,
    },
    actualMetrics: {
      sent: campaign.actualSent,
      delivered: campaign.actualDelivered,
      opened: campaign.actualOpened,
      clicked: campaign.actualClicked,
      purchased: campaign.actualPurchased,
      failed: campaign.actualFailed,
    },
  };

  return generateJSON<AnalyticsOutput>(ANALYTICS_SYSTEM_PROMPT, JSON.stringify(context));
}

// Conversational interface for the Analytics Agent
const CONVERSATIONAL_SYSTEM_PROMPT = `You are the GrowthOS Conversational Analytics AI.
You help marketers understand their campaign performance and customer segments through a conversational interface.
Answer the user's question clearly and concisely, using the provided context.
Use bolding for key metrics. Keep responses under 3 paragraphs.
Format the output in Markdown.`;

export async function runConversationalAnalytics(
  question: string,
  contextData: any
): Promise<{ answer: string }> {
  // We use generateJSON with a wrapper to ensure we always get a structured response back,
  // even though the output is markdown.
  const wrapperPrompt = `${CONVERSATIONAL_SYSTEM_PROMPT}\n\nReturn ONLY valid JSON:\n{\n  "answer": "Your markdown formatted answer here"\n}`;

  return generateJSON<{ answer: string }>(wrapperPrompt, `Question: ${question}\n\nContext Data: ${JSON.stringify(contextData)}`);
}
