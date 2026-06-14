import { Router } from "express";
import prisma from "../db/prisma";
import { deliveryQueue } from "../queues/campaign.queue";

export const campaignsRouter = Router();

campaignsRouter.get("/", async (req, res) => {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { segment: true },
  });
  res.json(campaigns);
});

campaignsRouter.get("/:id", async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { segment: true },
  });
  if (!campaign) return res.status(404).json({ error: "Not found" });
  res.json(campaign);
});

campaignsRouter.post("/:id/launch", async (req, res) => {
  const campaignId = req.params.id;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      segment: {
        include: {
          members: {
            include: { customer: true },
          },
        },
      },
    },
  });

  if (!campaign) return res.status(404).json({ error: "Not found" });
  if (campaign.status !== "DRAFT") {
    return res.status(400).json({ error: "Campaign already launched" });
  }

  // Update status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "RUNNING", launchedAt: new Date() },
  });

  // Prepare communications and enqueue jobs
  const messages = campaign.messageTemplate as any;
  const channelKey = campaign.channel.toLowerCase();
  
  // Choose the right message template based on channel
  let template = messages[channelKey] || messages.emailBody || messages.whatsapp || "Hello {{name}}!";

  for (const member of campaign.segment.members) {
    const customer = member.customer;
    
    // Simple personalization
    const personalizedMessage = template.replace(/{{name}}/gi, customer.name || "Customer");

    const comm = await prisma.communication.create({
      data: {
        campaignId,
        customerId: customer.id,
        channel: campaign.channel,
        message: personalizedMessage,
        status: "PENDING",
      },
    });

    await deliveryQueue.add("send", {
      communicationId: comm.id,
      campaignId: campaign.id,
      channel: campaign.channel,
      message: personalizedMessage,
      recipient: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  }

  res.json({ message: "Campaign launched successfully", enqueuedCount: campaign.segment.members.length });
});
