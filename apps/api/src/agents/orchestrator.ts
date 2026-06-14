import prisma from "../db/prisma";
import { runPlannerAgent, type PlannerOutput } from "./planner.agent";
import { runAudienceAgent, type AudienceOutput } from "./audience.agent";
import { runChannelAgent, type ChannelOutput } from "./channel.agent";
import { runCopyAgent, type CopyOutput } from "./copy.agent";

export interface OrchestrationResult {
  plan: PlannerOutput;
  audience: AudienceOutput;
  channel: ChannelOutput;
  copy: CopyOutput;
  campaignId: string;
}

export async function orchestrateGoal(
  goal: string,
  userId: string,
  onProgress?: (step: string, data?: any) => void
): Promise<OrchestrationResult> {
  // Ensure the user exists in our DB (Clerk users won't be in DB until first action)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@clerk.user`,
      name: "GrowthOS User",
    },
  });

  const agentRun = await prisma.agentRun.create({
    data: {
      agentType: "ORCHESTRATOR",
      input: { goal },
      userId,
      status: "RUNNING",
    },
  });

  try {
    // 1. Plan
    if (onProgress) onProgress("PLANNER_START");
    const plan = await runPlannerAgent(goal);
    if (onProgress) onProgress("PLANNER_COMPLETE", plan);

    // 2. Discover Audience
    if (onProgress) onProgress("AUDIENCE_START");
    const audience = await runAudienceAgent(plan);
    if (onProgress) onProgress("AUDIENCE_COMPLETE", audience);

    // 3. Select Channel
    if (onProgress) onProgress("CHANNEL_START");
    const channel = await runChannelAgent(plan, audience);
    if (onProgress) onProgress("CHANNEL_COMPLETE", channel);

    // 4. Generate Copy
    if (onProgress) onProgress("COPY_START");
    const copy = await runCopyAgent(plan, audience, channel.channel);
    if (onProgress) onProgress("COPY_COMPLETE", copy);

    // 5. Save Draft Campaign
    const segment = await prisma.segment.create({
      data: {
        name: audience.segmentName,
        description: audience.insights,
        criteria: plan.segmentCriteria,
        size: audience.size,
        members: {
          create: audience.customerIds.map((id) => ({
            customer: { connect: { id } },
          })),
        },
      },
    });

    const campaign = await prisma.campaign.create({
      data: {
        name: plan.campaignName,
        goal,
        status: "DRAFT",
        channel: channel.channel,
        messageTemplate: copy as any,
        userId,
        segmentId: segment.id,
        estimatedOpenRate: plan.expectedKPIs.openRate,
        estimatedClickRate: plan.expectedKPIs.clickRate,
        estimatedConversionRate: plan.expectedKPIs.conversionRate,
        estimatedRevenue: plan.expectedKPIs.revenueImpact,
        confidenceScore: channel.confidence,
      },
    });

    const result: OrchestrationResult = {
      plan,
      audience,
      channel,
      copy,
      campaignId: campaign.id,
    };

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: result as any,
        campaignId: campaign.id,
      },
    });

    if (onProgress) onProgress("ORCHESTRATION_COMPLETE", result);

    return result;
  } catch (error: any) {
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        error: error.message,
      },
    });
    if (onProgress) onProgress("ORCHESTRATION_FAILED", { error: error.message });
    throw error;
  }
}
