import { Queue } from "bullmq";
import redis from "../lib/redis";

export const deliveryQueue = new Queue("campaign-delivery", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
