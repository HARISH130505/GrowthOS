import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || "http://localhost:4000/api/v1/webhooks/receipt";

app.use(cors());
app.use(express.json());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWebhook(communicationId: string, event: string, metadata?: any) {
  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communicationId,
        event,
        timestamp: new Date().toISOString(),
        metadata,
      }),
    });
    if (!res.ok) {
      console.error(`Webhook failed for ${event} (${communicationId}):`, res.status);
    }
  } catch (error) {
    console.error(`Webhook network error for ${event} (${communicationId}):`, error);
  }
}

app.post("/send", (req, res) => {
  const { communicationId, recipient, channel, message } = req.body;

  if (!communicationId || !recipient || !channel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Acknowledge receipt immediately
  res.status(202).json({ status: "accepted", communicationId });

  // Simulate delivery asynchronously
  setTimeout(async () => {
    // 1. SENT (almost immediately)
    await sleep(500);
    await sendWebhook(communicationId, "SENT");

    // 2. DELIVERED
    const deliveryProbability = channel === "EMAIL" ? 0.98 : 0.95;
    if (Math.random() > deliveryProbability) {
      await sendWebhook(communicationId, "FAILED", { reason: "Delivery failed" });
      return;
    }
    await sleep(1000 + Math.random() * 2000);
    await sendWebhook(communicationId, "DELIVERED");

    // 3. OPENED
    let openProbability = 0.2; // Default
    if (channel === "WHATSAPP") openProbability = 0.68;
    else if (channel === "SMS") openProbability = 0.45;
    else if (channel === "EMAIL") openProbability = 0.28;

    if (Math.random() > openProbability) return;
    await sleep(2000 + Math.random() * 5000);
    await sendWebhook(communicationId, "OPENED");

    // 4. CLICKED
    let clickProbability = 0.1; // Default
    if (channel === "WHATSAPP") clickProbability = 0.35; // 35% of openers click
    else if (channel === "SMS") clickProbability = 0.25;
    else if (channel === "EMAIL") clickProbability = 0.30;

    if (Math.random() > clickProbability) return;
    await sleep(3000 + Math.random() * 8000);
    await sendWebhook(communicationId, "CLICKED");

    // 5. PURCHASED (Conversion)
    const purchaseProbability = 0.15; // 15% of clickers purchase
    if (Math.random() > purchaseProbability) return;
    await sleep(10000 + Math.random() * 20000); // 10-30s later
    await sendWebhook(communicationId, "PURCHASED", { orderAmount: 1500 + Math.random() * 5000 });

  }, 0);
});

app.listen(PORT, () => {
  console.log(`📡 Channel Simulator running on port ${PORT}`);
  console.log(`Webhook target: ${CRM_WEBHOOK_URL}`);
});
