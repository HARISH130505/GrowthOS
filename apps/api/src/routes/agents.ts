import { Router } from "express";
import { orchestrateGoal } from "../agents/orchestrator";
import { runConversationalAnalytics } from "../agents/analytics.agent";
import prisma from "../db/prisma";

export const agentsRouter = Router();

// Full pipeline
agentsRouter.post("/orchestrate", async (req, res) => {
  const { goal, userId } = req.body;
  if (!goal || !userId) {
    return res.status(400).json({ error: "Missing goal or userId" });
  }

  // Use Server-Sent Events (SSE) to stream progress
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event: string, data?: any) => {
    res.write(`data: ${JSON.stringify({ event, data })}\n\n`);
  };

  try {
    const result = await orchestrateGoal(goal, userId, sendEvent);
    // Connection is closed by the client typically, but we can signal end
    res.write(`data: ${JSON.stringify({ event: "DONE" })}\n\n`);
    res.end();
  } catch (error: any) {
    sendEvent("ERROR", { message: error.message });
    res.end();
  }
});

// Conversational Analytics Chat
agentsRouter.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  // Gather basic platform context
  const campaigns = await prisma.campaign.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { segment: true },
  });
  const totalCustomers = await prisma.customer.count();

  const context = {
    totalCustomers,
    recentCampaigns: campaigns.map((c) => ({
      name: c.name,
      status: c.status,
      metrics: {
        sent: c.actualSent,
        opened: c.actualOpened,
        clicked: c.actualClicked,
        purchased: c.actualPurchased,
      },
    })),
  };

  try {
    const response = await runConversationalAnalytics(question, context);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
