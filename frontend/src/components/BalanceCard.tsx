interface Props {
  label: string;
  value: string;
  highlight?: boolean;
}

export default function BalanceCard({ label, value, highlight }: Props) {
  const stx = (Number(value) / 1_000_000).toFixed(6);
  return (
    <div className={`rounded-xl p-5 ${highlight ? "bg-indigo-900/40 border border-indigo-700" : "bg-gray-800"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-indigo-300" : "text-white"}`}>
        {stx} <span className="text-sm font-normal text-gray-400">STX</span>
      </p>
    </div>
  );
}
