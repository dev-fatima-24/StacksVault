"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getActiveLoans, getFarmersStats, type ActiveLoansStats, type FarmersStats } from "@/lib/api";

export default function Home() {
  const [loans, setLoans] = useState<ActiveLoansStats | null>(null);
  const [farmers, setFarmers] = useState<FarmersStats | null>(null);

  useEffect(() => {
    getActiveLoans().then(setLoans).catch(() => {});
    getFarmersStats().then(setFarmers).catch(() => {});
  }, []);

  const tvl = loans ? (Number(loans.totalValueLocked) / 1_000_000).toFixed(2) : "—";
  const activeLoans = loans?.totalLoans ?? "—";
  const totalFarmers = farmers?.totalFarmers ?? "—";

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-indigo-400 mb-2">StacksVault</h1>
        <p className="text-gray-400 text-lg">Send money. Save automatically. Build wealth — on Bitcoin.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xl">
        <Stat label="TVL" value={`${tvl} STX`} />
        <Stat label="Active Loans" value={String(activeLoans)} />
        <Stat label="Total Farmers" value={String(totalFarmers)} />
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <Link href="/send" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition">
          Send Remittance
        </Link>
        <Link href="/dashboard" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition">
          My Dashboard
        </Link>
        <Link href="/farmer/borrow" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition">
          Borrow
        </Link>
        <Link href="/lender/deposit" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition">
          Lend
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
