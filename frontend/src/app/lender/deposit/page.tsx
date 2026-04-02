"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { lenderDeposit } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function LenderDepositPage() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txId, setTxId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { toast("Connect wallet first", "error"); return; }
    setStatus("pending");
    try {
      const result = await lenderDeposit({
        lenderAddress: address,
        amount: String(Number(amount) * 1_000_000),
      });
      setTxId(result.txId);
      setStatus("success");
      toast(`Deposit of ${amount} STX confirmed!`, "success");
      setAmount("");
    } catch (e: any) {
      setStatus("error");
      toast(e.message, "error");
    }
  }

  return (
    <ErrorBoundary>
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Deposit</h1>
        {!address && <p className="text-gray-400 mb-4">Connect your wallet to deposit.</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (STX)</label>
            <input
              type="number" min="0.000001" step="0.000001"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "pending" || !address}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {status === "pending" ? "Depositing…" : "Deposit"}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-4 text-green-400 text-sm">
            ✓ Deposited! TX: <span className="font-mono">{txId.slice(0, 20)}…</span>
          </p>
        )}
      </main>
    </ErrorBoundary>
  );
}
