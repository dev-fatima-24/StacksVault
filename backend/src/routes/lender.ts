import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// POST /api/lender/deposit
router.post("/deposit", async (req: Request, res: Response) => {
  const { lenderAddress, amount } = req.body;
  if (!lenderAddress || !amount) return res.status(400).json({ error: "Missing required fields" });
  try {
    await prisma.user.upsert({ where: { address: lenderAddress }, create: { address: lenderAddress }, update: {} });
    const position = await prisma.lenderPosition.create({
      data: { lenderAddress, amount: BigInt(amount) },
    });
    res.status(201).json({ txId: position.id, ...position, amount: position.amount.toString() });
  } catch {
    res.status(500).json({ error: "Failed to record deposit" });
  }
});

// GET /api/lender/:address/portfolio
router.get("/:address/portfolio", async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const positions = await prisma.lenderPosition.findMany({
      where: { lenderAddress: address },
      orderBy: { since: "desc" },
    });
    const deposited = positions.reduce((s, p) => s + p.amount, 0n);
    // Simulate 5% APY yield on each position based on days held
    const now = Date.now();
    const earned = positions.reduce((s, p) => {
      const days = (now - p.since.getTime()) / 86_400_000;
      return s + BigInt(Math.floor(Number(p.amount) * 0.05 * days / 365));
    }, 0n);
    res.json({
      address,
      deposited: deposited.toString(),
      earned: earned.toString(),
      apy: 5.0,
      positions: positions.map((p) => ({
        id: p.id,
        amount: p.amount.toString(),
        earnedYield: BigInt(Math.floor(Number(p.amount) * 0.05 * ((now - p.since.getTime()) / 86_400_000) / 365)).toString(),
        since: p.since.toISOString(),
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

export default router;
