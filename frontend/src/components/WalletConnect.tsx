"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletConnect() {
  const { address, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-2">
        <span className="text-green-400 text-sm font-mono">
          {address.slice(0, 8)}…{address.slice(-6)}
        </span>
        <button
          onClick={disconnect}
          className="text-xs text-gray-400 hover:text-red-400 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition"
    >
      Connect Freighter Wallet
    </button>
  );
}
