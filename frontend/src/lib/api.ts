const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Remittance ────────────────────────────────────────────────
export const sendRemittanceRecord = (data: {
  txId: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  lockPct: number;
}) => req("/remittance/send", { method: "POST", body: JSON.stringify(data) });

// ── Vault ─────────────────────────────────────────────────────
export const getVault = (address: string) =>
  req<{ lockedBalance: string; yieldAccrued: string; totalWithYield: string }>(
    `/vault/${address}`
  );

// ── Transactions ──────────────────────────────────────────────
export const getTransactions = (address: string) =>
  req<Transaction[]>(`/transactions/${address}`);

// ── Loans ─────────────────────────────────────────────────────
export const getActiveLoans = () => req<ActiveLoansStats>("/loans/active");

export const getFarmerLoans = (address: string) =>
  req<Loan[]>(`/farmers/${address}/loans`);

export const repayLoan = (id: string) =>
  req<{ success: boolean }>(`/loans/${id}/repay`, { method: "POST" });

export const borrowLoan = (data: {
  borrowerAddress: string;
  amount: string;
  collateral: string;
  termDays: number;
}) => req<Loan>("/loans/borrow", { method: "POST", body: JSON.stringify(data) });

// ── Lender ────────────────────────────────────────────────────
export const lenderDeposit = (data: {
  lenderAddress: string;
  amount: string;
}) => req<{ txId: string }>("/lender/deposit", { method: "POST", body: JSON.stringify(data) });

export const getLenderPortfolio = (address: string) =>
  req<LenderPortfolio>(`/lender/${address}/portfolio`);

// ── Oracle / Vet ──────────────────────────────────────────────
export const submitHealthAttestation = (data: {
  farmerAddress: string;
  vetAddress: string;
  score: number;
  notes: string;
}) => req<{ id: string }>("/oracle/health", { method: "POST", body: JSON.stringify(data) });

export const getFarmersStats = () => req<FarmersStats>("/farmers/stats");

// ── Shared types ──────────────────────────────────────────────
export interface Transaction {
  id: string;
  txId: string;
  amount: string;
  lockedAmount: string;
  instantAmount: string;
  lockPct: number;
  status: string;
  createdAt: string;
  senderAddress: string;
  recipientAddress: string;
}

export interface Loan {
  id: string;
  borrowerAddress: string;
  amount: string;
  collateral: string;
  termDays: number;
  status: string; // active | repaid | defaulted
  dueDate: string;
  createdAt: string;
}

export interface ActiveLoansStats {
  totalLoans: number;
  totalValueLocked: string;
  activeFarmers: number;
}

export interface LenderPortfolio {
  address: string;
  deposited: string;
  earned: string;
  apy: number;
  positions: LenderPosition[];
}

export interface LenderPosition {
  id: string;
  amount: string;
  earnedYield: string;
  since: string;
}

export interface FarmersStats {
  totalFarmers: number;
  activeFarmers: number;
  totalBorrowed: string;
}
