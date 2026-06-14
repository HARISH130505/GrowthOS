import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import prisma from "../db/prisma";

const CHANNEL_SIM_URL = process.env.CHANNEL_SIM_URL || "http://localhost:3001";

interface DeliveryJobData {
  communicationId: string;
  recipient: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  channel: string;
  message: string;
  campaignId: string;
}

export const deliveryWorker = new Worker<DeliveryJobData>(
  "campaign-delivery",
  async (job: Job<DeliveryJobData>) => {
    const { communicationId, recipient, channel, message, campaignId } = job.data;

    try {
      // Forward the request to the channel simulator microservice
      const response = await fetch(`${CHANNEL_SIM_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communicationId,
          recipient,
          channel,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Channel simulator rejected request: ${response.status}`);
      }

      // We successfully enqueued it to the simulator. The rest of the state
      // machine will be driven by webhooks coming back from the simulator.
      
      // Update actualSent metric immediately
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          actualSent: { increment: 1 }
        }
      });

      return { success: true };
    } catch (error: any) {
      // If we fail here, BullMQ will retry based on exponential backoff
      console.error(`Failed to send communication ${communicationId}:`, error.message);
      
      // If we've exhausted retries, mark the communication as failed
      if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
        await prisma.communication.update({
          where: { id: communicationId },
          data: { status: "FAILED" },
        });
        await prisma.communicationEvent.create({
          data: {
            communicationId,
            event: "FAILED",
            metadata: { error: error.message },
          },
        });
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { actualFailed: { increment: 1 } },
        });
      }
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 50, // Process 50 messages concurrently
  }
);

deliveryWorker.on("error", (err) => {
  console.error("Delivery worker error:", err);
});
