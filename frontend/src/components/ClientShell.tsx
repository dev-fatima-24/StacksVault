"use client";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import { ToastProvider } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const NAV = [
  { href: "/send",               label: "Send" },
  { href: "/dashboard",          label: "Dashboard" },
  { href: "/farmer/borrow",      label: "Borrow" },
  { href: "/farmer/loans",       label: "My Loans" },
  { href: "/lender/deposit",     label: "Deposit" },
  { href: "/lender/portfolio",   label: "Portfolio" },
  { href: "/vet/verify",         label: "Vet Verify" },
];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-wrap gap-2">
        <Link href="/" className="font-bold text-indigo-400 text-lg shrink-0">StacksVault</Link>
        <nav className="flex flex-wrap gap-3 text-sm text-gray-400">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white transition">
              {n.label}
            </Link>
          ))}
        </nav>
        <WalletConnect />
      </header>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ToastProvider>
  );
}
