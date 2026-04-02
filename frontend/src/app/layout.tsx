import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "StacksVault",
  description: "Programmable remittance with yield-bearing vault on Bitcoin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
