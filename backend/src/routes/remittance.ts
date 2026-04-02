import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// POST /api/remittance/send
// Body: { txId, senderAddress, recipientAddress, amount, lockPct }
router.post("/send", async (req: Request, res: Response) => {
  const { txId, senderAddress, recipientAddress, amount, lockPct } = req.body;

  if (!txId || !senderAddress || !recipientAddress || amount == null || lockPct == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (lockPct < 0 || lockPct > 100) {
    return res.status(400).json({ error: "lockPct must be 0–100" });
  }

  const amountBig = BigInt(amount);
  const lockedAmount = (amountBig * BigInt(lockPct)) / 100n;
  const instantAmount = amountBig - lockedAmount;

  try {
    // Upsert sender and recipient users
    await prisma.user.upsert({ where: { address: senderAddress }, create: { address: senderAddress }, update: {} });
    await prisma.user.upsert({ where: { address: recipientAddress }, create: { address: recipientAddress }, update: {} });

    const tx = await prisma.transaction.create({
      data: {
        txId,
        senderAddress,
        recipientAddress,
        amount: amountBig,
        lockedAmount,
        instantAmount,
        lockPct,
        status: "pending",
      },
    });

    // Update vault state for recipient
    if (lockedAmount > 0n) {
      await prisma.vaultState.upsert({
        where: { userAddress: recipientAddress },
        create: { userAddress: recipientAddress, lockedBalance: lockedAmount },
        update: { lockedBalance: { increment: lockedAmount }, lastUpdated: new Date() },
      });
    }

    res.status(201).json({ ...tx, amount: tx.amount.toString(), lockedAmount: tx.lockedAmount.toString(), instantAmount: tx.instantAmount.toString() });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Transaction already recorded" });
    res.status(500).json({ error: "Failed to record remittance" });
  }
});

export default router;
