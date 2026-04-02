import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/farmers/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [total, active, agg] = await Promise.all([
      prisma.user.count(),
      prisma.loan.groupBy({ by: ["borrowerAddress"], where: { status: "active" } }).then((r) => r.length),
      prisma.loan.aggregate({ _sum: { amount: true } }),
    ]);
    res.json({
      totalFarmers: total,
      activeFarmers: active,
      totalBorrowed: (agg._sum.amount ?? 0n).toString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch farmer stats" });
  }
});

// GET /api/farmers/:address/loans
router.get("/:address/loans", async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const loans = await prisma.loan.findMany({
      where: { borrowerAddress: address },
      orderBy: { createdAt: "desc" },
    });
    res.json(loans.map((l) => ({
      ...l,
      amount: l.amount.toString(),
      collateral: l.collateral.toString(),
      dueDate: l.dueDate.toISOString(),
      createdAt: l.createdAt.toISOString(),
    })));
  } catch {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

export default router;
