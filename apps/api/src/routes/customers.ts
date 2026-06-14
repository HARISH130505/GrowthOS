import { Router } from "express";
import prisma from "../db/prisma";

export const customersRouter = Router();

customersRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.customer.count(),
  ]);

  res.json({ data: customers, meta: { total, page, limit } });
});

customersRouter.get("/:id", async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      orders: { orderBy: { orderDate: "desc" }, take: 10 },
      communications: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) return res.status(404).json({ error: "Not found" });
  res.json(customer);
});
