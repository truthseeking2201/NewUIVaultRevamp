import { formatDate12Hours } from "@/utils/date";

export const renamingType = (type: string) => {
  switch (type) {
    case "ADD_LIQUIDITY":
      return "Add Liquidity";
    case "REMOVE_LIQUIDITY":
      return "Remove Liquidity";
    case "CLAIM_REWARDS":
      return "Add Reward";
    case "SWAP":
      return "Swap";
    case "ADD_PROFIT_UPDATE_RATE":
      return "Add Profit";
    case "OPEN":
      return "Open Position";
    case "CLOSE":
      return "Close Position";
    default:
      return type;
  }
};

export const formatTime = (timestamp: string) => {
  try {
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    // Timezone abbreviation
    const tzParts = d.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ');
    const tz = tzParts[tzParts.length - 1] || 'UTC';

    // Relative time
    const diffMs = Date.now() - d.getTime();
    const abs = Math.max(0, diffMs);
    const rel = abs < 60_000
      ? `${Math.floor(abs / 1000)}s ago`
      : abs < 3_600_000
      ? `${Math.floor(abs / 60_000)}m ago`
      : abs < 86_400_000
      ? `${Math.floor(abs / 3_600_000)}h ago`
      : `${Math.floor(abs / 86_400_000)}d ago`;

    const text = `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss} ${tz} (${rel})`;
    return <div className="text-xs text-white/70 font-mono">{text}</div>;
  } catch (e) {
    return <div className="text-xs text-white/70 font-mono">--</div>;
  }
};

export const displayTokenSymbol = (symbol?: string) => {
  if (!symbol) return "";
  return symbol.toUpperCase() === "NDLP" ? "SUI" : symbol;
};

export const tokenIconPath = (symbol?: string) => {
  if (!symbol) return "/coins/unknown.png";
  const alias = symbol.toUpperCase() === "NDLP" ? "SUI" : symbol;
  return `/coins/${alias.toLowerCase()}.png`;
};
