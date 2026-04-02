"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getLenderPortfolio, type LenderPortfolio } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BalanceCard from "@/components/BalanceCard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function LenderPortfolioPage() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<LenderPortfolio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getLenderPortfolio(address)
      .then(setPortfolio)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4">My Portfolio</h1>
      <p className="text-gray-400">Connect your wallet to view your portfolio.</p>
    </main>
  );

  return (
    <ErrorBoundary>
      <main className="max-w-2xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-400">My Portfolio</h1>
        {loading && <p className="text-gray-400">Loading…</p>}
        {portfolio && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <BalanceCard label="Deposited" value={portfolio.deposited} />
              <BalanceCard label="Earned" value={portfolio.earned} highlight />
              <div className="bg-gray-800 rounded-xl p-5 text-center">
                <p className="text-xs text-gray-400 mb-1">APY</p>
                <p className="text-2xl font-bold text-indigo-300">{portfolio.apy.toFixed(2)}%</p>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-300">Positions</h2>
              {portfolio.positions.length === 0 && <p className="text-gray-500">No positions yet.</p>}
              {portfolio.positions.map((pos) => (
                <div key={pos.id} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Deposited</p>
                    <p className="font-semibold text-white">{(Number(pos.amount) / 1_000_000).toFixed(4)} STX</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Yield Earned</p>
                    <p className="font-semibold text-green-400">+{(Number(pos.earnedYield) / 1_000_000).toFixed(6)} STX</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Since</p>
                    <p className="text-gray-300">{new Date(pos.since).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </ErrorBoundary>
  );
}
