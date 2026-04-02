interface Tx {
  id: string;
  txId: string;
  amount: string;
  lockedAmount: string;
  instantAmount: string;
  lockPct: number;
  status: string;
  createdAt: string;
  senderAddress: string;
  recipientAddress: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  confirmed: "text-green-400",
  failed: "text-red-400",
};

export default function TransactionStatus({ tx, userAddress }: { tx: Tx; userAddress: string }) {
  const isSender = tx.senderAddress === userAddress;
  const stx = (Number(tx.amount) / 1_000_000).toFixed(4);
  const locked = (Number(tx.lockedAmount) / 1_000_000).toFixed(4);

  return (
    <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
      <div>
        <span className={`font-semibold ${isSender ? "text-red-300" : "text-green-300"}`}>
          {isSender ? "Sent" : "Received"}
        </span>
        <span className="text-gray-300 ml-2">{stx} STX</span>
        {Number(tx.lockedAmount) > 0 && (
          <span className="text-indigo-400 ml-2">({locked} locked)</span>
        )}
      </div>
      <div className="text-right">
        <span className={STATUS_COLORS[tx.status] ?? "text-gray-400"}>{tx.status}</span>
        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
