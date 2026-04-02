"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getVault, getTransactions, type Transaction } from "@/lib/api";
import BalanceCard from "@/components/BalanceCard";
import VaultSummary from "@/components/VaultSummary";
import TransactionStatus from "@/components/TransactionStatus";
import ErrorBoundary from "@/components/ErrorBoundary";

interface VaultData { lockedBalance: string; yieldAccrued: string; totalWithYield: string }

export default function DashboardPage() {
  const { address } = useWallet();
  const [vault, setVault] = useState<VaultData | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    Promise.all([getVault(address), getTransactions(address)])
      .then(([v, t]) => { setVault(v); setTxs(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4">Dashboard</h1>
      <p className="text-gray-400">Connect your wallet to view your dashboard.</p>
    </main>
  );

  return (
    <ErrorBoundary>
      <main className="max-w-2xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-400">Dashboard</h1>
        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {vault && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <BalanceCard label="Locked Balance" value={vault.lockedBalance} />
              <BalanceCard label="Yield Accrued" value={vault.yieldAccrued} highlight />
            </div>
            <VaultSummary vault={vault} />
          </>
        )}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-300">Transaction History</h2>
          {!loading && txs.length === 0 && <p className="text-gray-500">No transactions yet.</p>}
          {txs.map((tx) => <TransactionStatus key={tx.id} tx={tx} userAddress={address} />)}
        </div>
      </main>
    </ErrorBoundary>
  );
}
