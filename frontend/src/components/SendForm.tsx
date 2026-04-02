"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { sendRemittance } from "@/lib/stacks";
import { sendRemittanceRecord } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function SendForm() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [lockPct, setLockPct] = useState(20);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txId, setTxId] = useState("");

  const instantAmount = amount ? (Number(amount) * (100 - lockPct)) / 100 : 0;
  const lockedAmount = amount ? (Number(amount) * lockPct) / 100 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { toast("Connect wallet first", "error"); return; }
    setStatus("pending");
    try {
      const id = await sendRemittance({ recipient, amount: Number(amount) * 1_000_000, lockPct });
      setTxId(id);
      await sendRemittanceRecord({
        txId: id,
        senderAddress: address,
        recipientAddress: recipient,
        amount: String(Number(amount) * 1_000_000),
        lockPct,
      });
      setStatus("success");
      toast("Remittance sent successfully!", "success");
    } catch (err: any) {
      setStatus("error");
      toast(err.message ?? "Transaction failed", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Recipient Address</label>
        <input
          className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Amount (STX)</label>
        <input
          type="number"
          min="0.000001"
          step="0.000001"
          className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Lock Percentage: {lockPct}%</label>
        <input
          type="range" min={0} max={100} value={lockPct}
          onChange={(e) => setLockPct(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Instant: {instantAmount.toFixed(4)} STX</span>
          <span>Locked: {lockedAmount.toFixed(4)} STX</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "pending"}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition"
      >
        {status === "pending" ? "Sending…" : "Send Remittance"}
      </button>
      {status === "success" && (
        <p className="text-green-400 text-sm">✓ TX: <span className="font-mono">{txId.slice(0, 20)}…</span></p>
      )}
      {status === "error" && <p className="text-red-400 text-sm">✗ Transaction failed. Try again.</p>}
    </form>
  );
}
