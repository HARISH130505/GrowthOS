import "dotenv/config";
import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { agentsRouter } from "./routes/agents";
import { campaignsRouter } from "./routes/campaigns";
import { webhooksRouter } from "./routes/webhooks";
import { customersRouter } from "./routes/customers";
import { analyticsRouter } from "./routes/analytics";
import { deliveryWorker } from "./queues/delivery.worker";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/agents", agentsRouter);
app.use("/api/v1/campaigns", campaignsRouter);
app.use("/api/v1/webhooks", webhooksRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/analytics", analyticsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`👷 BullMQ Delivery Worker initialized`);
});

// Start worker immediately
deliveryWorker.run().catch(console.error);

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await deliveryWorker.close();
  process.exit(0);
});
