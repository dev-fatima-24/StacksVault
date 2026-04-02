import { Router, Request, Response } from "express";
import { readLockedBalance, readAccruedYield, readVaultBalance } from "../stacks";
import prisma from "../db";

const router = Router();

// GET /api/vault/:address
router.get("/:address", async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const [locked, yield_, total] = await Promise.all([
      readLockedBalance(address),
      readAccruedYield(address),
      readVaultBalance(address),
    ]);
    res.json({
      address,
      lockedBalance: locked.toString(),
      yieldAccrued: yield_.toString(),
      totalWithYield: total.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vault balance from chain" });
  }
});

export default router;
