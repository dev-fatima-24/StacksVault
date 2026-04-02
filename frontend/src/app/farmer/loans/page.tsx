"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getFarmerLoans, repayLoan, type Loan } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import TransactionStatus from "@/components/TransactionStatus";

export default function FarmerLoansPage() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [repaying, setRepaying] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getFarmerLoans(address)
      .then(setLoans)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [address]);

  async function handleRepay(id: string) {
    setRepaying(id);
    try {
      await repayLoan(id);
      setLoans((prev) => prev.map((l) => l.id === id ? { ...l, status: "repaid" } : l));
      toast("Loan repaid successfully!", "success");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setRepaying(null);
    }
  }

  if (!address) return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4">My Loans</h1>
      <p className="text-gray-400">Connect your wallet to view loans.</p>
    </main>
  );

  return (
    <ErrorBoundary>
      <main className="max-w-2xl mx-auto p-8 space-y-4">
        <h1 className="text-3xl font-bold text-indigo-400">My Loans</h1>
        {loading && <p className="text-gray-400">Loading…</p>}
        {!loading && loans.length === 0 && <p className="text-gray-500">No loans found.</p>}
        {loans.map((loan) => (
          <div key={loan.id} className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Amount</p>
                <p className="font-bold text-white">{(Number(loan.amount) / 1_000_000).toFixed(4)} STX</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Due</p>
                <p className="text-sm text-gray-300">{new Date(loan.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className={`text-sm font-semibold ${loan.status === "active" ? "text-yellow-400" : loan.status === "repaid" ? "text-green-400" : "text-red-400"}`}>
                  {loan.status}
                </p>
              </div>
              {loan.status === "active" && (
                <button
                  onClick={() => handleRepay(loan.id)}
                  disabled={repaying === loan.id}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition"
                >
                  {repaying === loan.id ? "Repaying…" : "Repay"}
                </button>
              )}
            </div>
          </div>
        ))}
      </main>
    </ErrorBoundary>
  );
}
