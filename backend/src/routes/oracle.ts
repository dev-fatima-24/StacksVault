import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// POST /api/oracle/health
router.post("/health", async (req: Request, res: Response) => {
  const { farmerAddress, vetAddress, score, notes } = req.body;
  if (!farmerAddress || !vetAddress || score == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (score < 0 || score > 100) {
    return res.status(400).json({ error: "Score must be 0–100" });
  }
  try {
    await prisma.user.upsert({ where: { address: farmerAddress }, create: { address: farmerAddress }, update: {} });
    await prisma.user.upsert({ where: { address: vetAddress }, create: { address: vetAddress }, update: {} });
    const attestation = await prisma.healthAttestation.create({
      data: { farmerAddress, vetAddress, score: Number(score), notes: notes ?? "" },
    });
    res.status(201).json({ id: attestation.id, ...attestation });
  } catch {
    res.status(500).json({ error: "Failed to submit attestation" });
  }
});

export default router;
