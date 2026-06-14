import { Router } from "express";
import prisma from "../db/prisma";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", async (req, res) => {
  const [totalRevenue, totalCustomers, activeCampaigns] = await Promise.all([
    prisma.order.aggregate({ _sum: { amount: true } }),
    prisma.customer.count(),
    prisma.campaign.count({ where: { status: "RUNNING" } }),
  ]);

  res.json({
    totalRevenue: totalRevenue._sum.amount || 0,
    totalCustomers,
    activeCampaigns,
  });
});

analyticsRouter.get("/opportunities", async (req, res) => {
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "ACTIVE" },
    orderBy: { opportunityScore: "desc" },
  });
  res.json(opportunities);
});
