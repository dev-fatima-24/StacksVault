import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/transactions/:address
router.get("/:address", async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const txs = await prisma.transaction.findMany({
      where: {
        OR: [{ senderAddress: address }, { recipientAddress: address }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(txs.map((t) => ({ ...t, amount: t.amount.toString(), lockedAmount: t.lockedAmount.toString(), instantAmount: t.instantAmount.toString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;
