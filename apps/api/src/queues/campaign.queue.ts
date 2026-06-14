import { Queue } from "bullmq";

export const deliveryQueue = new Queue("campaign-delivery", {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
