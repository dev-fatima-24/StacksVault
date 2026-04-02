"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { submitHealthAttestation } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function VetVerifyPage() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [farmerAddress, setFarmerAddress] = useState("");
  const [score, setScore] = useState(80);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [attestationId, setAttestationId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { toast("Connect wallet first", "error"); return; }
    setStatus("pending");
    try {
      const result = await submitHealthAttestation({
        farmerAddress,
        vetAddress: address,
        score,
        notes,
      });
      setAttestationId(result.id);
      setStatus("success");
      toast("Health attestation submitted!", "success");
    } catch (e: any) {
      setStatus("error");
      toast(e.message, "error");
    }
  }

  return (
    <ErrorBoundary>
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Submit Health Attestation</h1>
        {!address && <p className="text-gray-400 mb-4">Connect your wallet to submit attestations.</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Farmer Address</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
              value={farmerAddress}
              onChange={(e) => setFarmerAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Health Score: {score}/100</label>
            <input
              type="range" min={0} max={100} value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span><span>Excellent</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Crop condition, soil quality, irrigation status…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={status === "pending" || !address}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {status === "pending" ? "Submitting…" : "Submit Attestation"}
          </button>
        </form>
        {status === "success" && (
          <div className="mt-4 bg-green-900/30 border border-green-700 rounded-xl p-4">
            <p className="text-green-400 font-semibold">✓ Attestation Submitted</p>
            <p className="text-sm text-gray-300 mt-1">ID: <span className="font-mono text-xs">{attestationId}</span></p>
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
}
