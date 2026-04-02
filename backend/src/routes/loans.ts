import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/loans/active — TVL + active loan count
router.get("/active", async (_req: Request, res: Response) => {
  try {
    const [count, agg] = await Promise.all([
      prisma.loan.count({ where: { status: "active" } }),
      prisma.loan.aggregate({ where: { status: "active" }, _sum: { amount: true } }),
    ]);
    res.json({
      totalLoans: count,
      totalValueLocked: (agg._sum.amount ?? 0n).toString(),
      activeFarmers: count,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch active loans" });
  }
});

// POST /api/loans/borrow
router.post("/borrow", async (req: Request, res: Response) => {
  const { borrowerAddress, amount, collateral, termDays } = req.body;
  if (!borrowerAddress || !amount || !collateral || !termDays) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await prisma.user.upsert({ where: { address: borrowerAddress }, create: { address: borrowerAddress }, update: {} });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(termDays));
    const loan = await prisma.loan.create({
      data: {
        borrowerAddress,
        amount: BigInt(amount),
        collateral: BigInt(collateral),
        termDays: Number(termDays),
        dueDate,
        status: "active",
      },
    });
    res.status(201).json(serialize(loan));
  } catch {
    res.status(500).json({ error: "Failed to create loan" });
  }
});

// POST /api/loans/:id/repay
router.post("/:id/repay", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    if (loan.status !== "active") return res.status(400).json({ error: "Loan is not active" });
    await prisma.loan.update({ where: { id }, data: { status: "repaid" } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to repay loan" });
  }
});

function serialize(loan: any) {
  return {
    ...loan,
    amount: loan.amount.toString(),
    collateral: loan.collateral.toString(),
    dueDate: loan.dueDate.toISOString(),
    createdAt: loan.createdAt.toISOString(),
  };
}

export default router;
