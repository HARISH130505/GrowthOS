import prisma from "../db/prisma";
import { generateJSON } from "../lib/gemini";
import type { PlannerOutput } from "./planner.agent";

export interface AudienceOutput {
  segmentName: string;
  size: number;
  estimatedRevenue: number;
  topCities: string[];
  avgSpend: number;
  customerIds: string[];
  insights: string;
}

const AUDIENCE_INSIGHT_PROMPT = `You are an Audience Intelligence AI for GrowthOS.
Given audience statistics, generate 1-2 sentence insights about this segment that will help a marketer understand who they are targeting.
Return ONLY valid JSON:
{
  "insights": "Your insight sentence(s) here"
}`;

export async function runAudienceAgent(
  plan: PlannerOutput
): Promise<AudienceOutput> {
  const criteria = plan.segmentCriteria;

  // Build dynamic Prisma where clause from plan criteria
  const where: Record<string, unknown> = {};

  if (criteria.inactiveDays !== undefined) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - criteria.inactiveDays);

    if (criteria.maxInactiveDays !== undefined) {
      const maxCutoff = new Date();
      maxCutoff.setDate(maxCutoff.getDate() - criteria.maxInactiveDays);
      where.lastPurchaseDate = { lte: cutoffDate, gte: maxCutoff };
    } else {
      where.lastPurchaseDate = { lte: cutoffDate };
    }
  }

  if (criteria.minSpend !== undefined || criteria.maxSpend !== undefined) {
    where.totalSpent = {
      ...(criteria.minSpend !== undefined ? { gte: criteria.minSpend } : {}),
      ...(criteria.maxSpend !== undefined ? { lte: criteria.maxSpend } : {}),
    };
  }

  if (criteria.cities && criteria.cities.length > 0) {
    where.city = { in: criteria.cities };
  }

  if (criteria.preferredChannel) {
    where.preferredChannel = criteria.preferredChannel;
  }

  if (criteria.noPurchase) {
    where.totalSpent = { equals: 0 };
  }

  // Filter by order count if specified
  let customers = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { orders: true } },
    },
    take: 1000, // Safety cap
  });

  // Post-filter by order count
  if (criteria.minOrders !== undefined) {
    customers = customers.filter(
      (c) => c._count.orders >= (criteria.minOrders ?? 0)
    );
  }
  if (criteria.maxOrders !== undefined) {
    customers = customers.filter(
      (c) => c._count.orders <= (criteria.maxOrders ?? Infinity)
    );
  }

  if (criteria.newCustomers) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    customers = customers.filter((c) => c.createdAt >= thirtyDaysAgo);
  }

  // Aggregate stats
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpend =
    customers.length > 0 ? totalSpent / customers.length : 0;

  // Top cities
  const cityCounts: Record<string, number> = {};
  for (const c of customers) {
    if (c.city) {
      cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
    }
  }
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => city);

  const estimatedRevenue =
    customers.length * avgSpend * (plan.expectedKPIs.conversionRate || 0.08);

  // Get Gemini-generated audience insights
  const statsForInsight = {
    size: customers.length,
    avgSpend: Math.round(avgSpend),
    topCities,
    criteria: JSON.stringify(criteria),
    segmentGoal: plan.objective,
  };

  let insights = "High-potential segment identified for targeted outreach.";
  try {
    const insightResult = await generateJSON<{ insights: string }>(
      AUDIENCE_INSIGHT_PROMPT,
      JSON.stringify(statsForInsight)
    );
    insights = insightResult.insights;
  } catch {
    // Fallback to default insight
  }

  return {
    segmentName: plan.campaignName + " Segment",
    size: customers.length,
    estimatedRevenue: Math.round(estimatedRevenue),
    topCities,
    avgSpend: Math.round(avgSpend),
    customerIds: customers.map((c) => c.id),
    insights,
  };
}
