import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/vault";
import { formatCurrency } from "@/utils/currency";

function usdOf(t?: any) {
  if (!t) return 0;
  const dec = Number(t?.decimal || 0);
  const amt = Number(t?.amount || 0) / Math.pow(10, dec);
  const price = parseFloat(t?.price || "0");
  return amt * price;
}

function inferIntent(tx: Transaction) {
  const reason = (tx?.reason || "").toLowerCase();
  if (reason.includes("rebalance") || reason.includes("target") || reason.includes("mix")) return "Rebalance to target mix";
  if (reason.includes("vola") || reason.includes("hedge") || reason.includes("risk")) return "Risk control adjustment";
  if (tx.type === "SWAP") return "Optimize token exposure";
  if (tx.type === "ADD_LIQUIDITY" || tx.type === "OPEN") return "Increase liquidity position";
  if (tx.type === "REMOVE_LIQUIDITY" || tx.type === "CLOSE") return "Decrease liquidity position";
  return "Execution update";
}

function confidenceOf(tx: Transaction) {
  // Heuristic: have explicit reason -> higher confidence; otherwise moderate
  const hasReason = !!tx?.reason?.trim();
  const val = Math.max(0, parseFloat(String(tx.value || 0)) || 0);
  const scaled = Math.min(1, (hasReason ? 0.7 : 0.5) + Math.tanh(val / 5000) * 0.2);
  return scaled; // 0..1
}

function buildSummary(tx: Transaction) {
  const t0 = tx.tokens?.[0];
  const t1 = tx.tokens?.[1];
  const u0 = usdOf(t0);
  const u1 = usdOf(t1);
  if (tx.type === "SWAP") {
    const from = t0?.token_symbol || "";
    const to = t1?.token_symbol || "";
    const vol = Math.min(u0, u1);
    return `Shifted exposure ${formatCurrency(vol, 0, 0, 2, 'currency', 'USD')} from ${from} to ${to}`;
  }
  const sum = u0 + u1;
  if (tx.type === "ADD_LIQUIDITY" || tx.type === "OPEN") {
    return `Added liquidity ${formatCurrency(sum, 0, 0, 2, 'currency', 'USD')}`;
  }
  if (tx.type === "REMOVE_LIQUIDITY" || tx.type === "CLOSE") {
    return `Removed liquidity ${formatCurrency(sum, 0, 0, 2, 'currency', 'USD')}`;
  }
  return `Value ${formatCurrency(sum || parseFloat(String(tx.value || 0)) || 0, 0, 0, 2, 'currency', 'USD')}`;
}

export default function AIHint({
  tx,
  size = 16,
  className,
  tone = "accent",
  showDot = true,
}: {
  tx: Transaction;
  size?: number;
  className?: string;
  tone?: "accent" | "subtle";
  showDot?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const intent = useMemo(() => inferIntent(tx), [tx]);
  const conf = useMemo(() => confidenceOf(tx), [tx]);
  const summary = useMemo(() => buildSummary(tx), [tx]);
  const reason = tx?.reason?.trim();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className={cn(
            "h-6 px-1 relative ai-thinking",
            tone === "accent" ? "text-nova hover:text-nova/80" : "text-white/50 hover:text-white/80",
            className
          )}
          title="AI-initiated transaction"
          onClick={(e) => e.stopPropagation()}
        >
          <Brain size={size} />
          {showDot && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-nova" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-[#111] text-white border-white/10" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="text-xs text-white/60 mb-1">AI Thinking</div>
        <div className="text-sm font-medium mb-1">{intent}</div>
        <div className="text-[12px] text-white/80 mb-2">{summary}</div>
        {reason && (
          <div className="text-[12px] text-white/60 italic mb-2">“{reason}”</div>
        )}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>Confidence</span>
            <span>{Math.round(conf * 100)}%</span>
          </div>
          <div className="h-1.5 rounded bg-white/10 overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-nova/50 to-nova" style={{ width: `${Math.max(8, Math.round(conf * 100))}%` }} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          {tx.tokens?.[0] && (
            <div className="bg-white/5 rounded-md p-2">
              <div className="text-white/60">Leg A</div>
              <div className="text-white truncate">{tx.tokens[0].token_symbol}</div>
              <div className="text-white/70">≈ {formatCurrency(usdOf(tx.tokens[0]), 0, 0, 2, 'currency', 'USD')}</div>
            </div>
          )}
          {tx.tokens?.[1] && (
            <div className="bg-white/5 rounded-md p-2">
              <div className="text-white/60">Leg B</div>
              <div className="text-white truncate">{tx.tokens[1].token_symbol}</div>
              <div className="text-white/70">≈ {formatCurrency(usdOf(tx.tokens[1]), 0, 0, 2, 'currency', 'USD')}</div>
            </div>
          )}
        </div>
        <div className="mt-3 text-[10px] text-white/50 flex items-center gap-1">
          <Sparkles size={12} className="text-nova" />
          <span>Heuristic explanation for clarity; not financial advice</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
