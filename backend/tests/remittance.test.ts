import request from "supertest";
import app from "../src/index";

jest.mock("../src/db", () => ({
  user: { upsert: jest.fn().mockResolvedValue({}) },
  transaction: {
    create: jest.fn().mockResolvedValue({
      id: "1", txId: "0xabc", senderAddress: "ST1SENDER", recipientAddress: "ST1RECIPIENT",
      amount: 1000000n, lockedAmount: 300000n, instantAmount: 700000n,
      lockPct: 30, status: "pending", blockHeight: null, createdAt: new Date(),
    }),
    findMany: jest.fn().mockResolvedValue([]),
  },
  vaultState: { upsert: jest.fn().mockResolvedValue({}) },
  loan: {
    count: jest.fn().mockResolvedValue(3),
    aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 5000000n } }),
    create: jest.fn().mockResolvedValue({
      id: "loan1", borrowerAddress: "ST1A", amount: 1000000n, collateral: 1500000n,
      termDays: 30, status: "active", dueDate: new Date("2026-05-01"), createdAt: new Date(),
    }),
    findUnique: jest.fn().mockResolvedValue({ id: "loan1", status: "active" }),
    update: jest.fn().mockResolvedValue({ id: "loan1", status: "repaid" }),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  lenderPosition: {
    create: jest.fn().mockResolvedValue({ id: "pos1", lenderAddress: "ST1L", amount: 500000n, since: new Date() }),
    findMany: jest.fn().mockResolvedValue([]),
  },
  healthAttestation: {
    create: jest.fn().mockResolvedValue({ id: "att1", farmerAddress: "ST1F", vetAddress: "ST1V", score: 85, notes: "", createdAt: new Date() }),
  },
}));

describe("POST /api/remittance/send", () => {
  it("records a remittance", async () => {
    const res = await request(app).post("/api/remittance/send").send({
      txId: "0xabc", senderAddress: "ST1SENDER", recipientAddress: "ST1RECIPIENT",
      amount: "1000000", lockPct: 30,
    });
    expect(res.status).toBe(201);
    expect(res.body.lockedAmount).toBe("300000");
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/remittance/send").send({ txId: "0x1" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/loans/active", () => {
  it("returns loan stats", async () => {
    const res = await request(app).get("/api/loans/active");
    expect(res.status).toBe(200);
    expect(res.body.totalLoans).toBe(3);
    expect(res.body.totalValueLocked).toBe("5000000");
  });
});

describe("POST /api/loans/borrow", () => {
  it("creates a loan", async () => {
    const res = await request(app).post("/api/loans/borrow").send({
      borrowerAddress: "ST1A", amount: "1000000", collateral: "1500000", termDays: 30,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("active");
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/loans/borrow").send({ borrowerAddress: "ST1A" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/loans/:id/repay", () => {
  it("repays a loan", async () => {
    const res = await request(app).post("/api/loans/loan1/repay");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/lender/deposit", () => {
  it("records a deposit", async () => {
    const res = await request(app).post("/api/lender/deposit").send({
      lenderAddress: "ST1L", amount: "500000",
    });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe("500000");
  });
});

describe("POST /api/oracle/health", () => {
  it("submits attestation", async () => {
    const res = await request(app).post("/api/oracle/health").send({
      farmerAddress: "ST1F", vetAddress: "ST1V", score: 85, notes: "Good crop",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("att1");
  });

  it("rejects invalid score", async () => {
    const res = await request(app).post("/api/oracle/health").send({
      farmerAddress: "ST1F", vetAddress: "ST1V", score: 150,
    });
    expect(res.status).toBe(400);
  });
});
