"use client";
import { useState } from "react";
import { withdrawFromVault } from "@/lib/stacks";
import { useToast } from "@/components/Toast";

interface VaultData { lockedBalance: string; yieldAccrued: string; totalWithYield: string }

export default function VaultSummary({ vault }: { vault: VaultData }) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const total  = (Number(vault.totalWithYield) / 1_000_000).toFixed(6);
  const locked = (Number(vault.lockedBalance)  / 1_000_000).toFixed(6);
  const yield_ = (Number(vault.yieldAccrued)   / 1_000_000).toFixed(6);

  async function handleWithdraw() {
    setPending(true);
    try {
      await withdrawFromVault(Number(vault.totalWithYield));
      toast("Withdrawal submitted!", "success");
    } catch (e: any) {
      toast(e.message ?? "Withdrawal failed", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-3">
      <h2 className="text-lg font-semibold text-gray-200">Vault Summary</h2>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div><p className="text-xs text-gray-400">Locked</p><p className="font-bold text-white">{locked} STX</p></div>
        <div><p className="text-xs text-gray-400">Yield</p><p className="font-bold text-green-400">+{yield_} STX</p></div>
        <div><p className="text-xs text-gray-400">Total</p><p className="font-bold text-indigo-300">{total} STX</p></div>
      </div>
      <button
        onClick={handleWithdraw}
        disabled={pending || Number(vault.totalWithYield) === 0}
        className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 rounded-lg font-semibold transition text-sm"
      >
        {pending ? "Withdrawing…" : "Withdraw All"}
      </button>
    </div>
  );
}
