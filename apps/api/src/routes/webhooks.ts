import { Router } from "express";
import prisma from "../db/prisma";

export const webhooksRouter = Router();

// Receive events from the Channel Simulator
webhooksRouter.post("/receipt", async (req, res) => {
  const { communicationId, event, timestamp, metadata } = req.body;

  if (!communicationId || !event) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const comm = await prisma.communication.findUnique({
      where: { id: communicationId },
      include: { campaign: true },
    });

    if (!comm) {
      return res.status(404).json({ error: "Communication not found" });
    }

    // Record the event
    await prisma.communicationEvent.create({
      data: {
        communicationId,
        event,
        metadata: metadata || {},
        occurredAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Update the communication status
    // Note: In reality, we'd ensure events are processed in order.
    await prisma.communication.update({
      where: { id: communicationId },
      data: {
        status: event,
        sentAt: event === "SENT" ? new Date() : undefined,
      },
    });

    // Update campaign roll-up metrics
    const updateData: any = {};
    if (event === "DELIVERED") updateData.actualDelivered = { increment: 1 };
    else if (event === "OPENED") updateData.actualOpened = { increment: 1 };
    else if (event === "CLICKED") updateData.actualClicked = { increment: 1 };
    else if (event === "PURCHASED") updateData.actualPurchased = { increment: 1 };
    else if (event === "FAILED") updateData.actualFailed = { increment: 1 };

    if (Object.keys(updateData).length > 0) {
      await prisma.campaign.update({
        where: { id: comm.campaignId },
        data: updateData,
      });
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: error.message });
  }
});
