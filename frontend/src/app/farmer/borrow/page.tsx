"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { borrowLoan, type Loan } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function FarmerBorrowPage() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [collateral, setCollateral] = useState("");
  const [termDays, setTermDays] = useState(30);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [loan, setLoan] = useState<Loan | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { toast("Connect wallet first", "error"); return; }
    setStatus("pending");
    try {
      const result = await borrowLoan({
        borrowerAddress: address,
        amount: String(Number(amount) * 1_000_000),
        collateral: String(Number(collateral) * 1_000_000),
        termDays,
      });
      setLoan(result);
      setStatus("success");
      toast("Loan created successfully!", "success");
    } catch (e: any) {
      setStatus("error");
      toast(e.message, "error");
    }
  }

  return (
    <ErrorBoundary>
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Borrow</h1>
        {!address && <p className="text-gray-400 mb-4">Connect your wallet to borrow.</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Loan Amount (STX)</label>
            <input
              type="number" min="0.000001" step="0.000001"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Collateral (STX)</label>
            <input
              type="number" min="0.000001" step="0.000001"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="150"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Term: {termDays} days</label>
            <input
              type="range" min={7} max={365} value={termDays}
              onChange={(e) => setTermDays(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === "pending" || !address}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {status === "pending" ? "Submitting…" : "Borrow"}
          </button>
        </form>

        {status === "success" && loan && (
          <div className="mt-6 bg-green-900/30 border border-green-700 rounded-xl p-4 space-y-1">
            <p className="text-green-400 font-semibold">✓ Loan Created</p>
            <p className="text-sm text-gray-300">ID: <span className="font-mono text-xs">{loan.id}</span></p>
            <p className="text-sm text-gray-300">Amount: {(Number(loan.amount) / 1_000_000).toFixed(4)} STX</p>
            <p className="text-sm text-gray-300">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
          </div>
        )}
        {status === "error" && (
          <p className="mt-4 text-red-400 text-sm">✗ Borrow failed. Try again.</p>
        )}
      </main>
    </ErrorBoundary>
  );
}
