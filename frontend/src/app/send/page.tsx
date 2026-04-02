"use client";
import SendForm from "@/components/SendForm";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SendPage() {
  return (
    <ErrorBoundary>
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Send Remittance</h1>
        <SendForm />
      </main>
    </ErrorBoundary>
  );
}
