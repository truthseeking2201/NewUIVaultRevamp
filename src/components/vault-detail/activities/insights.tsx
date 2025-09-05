import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AICard, AICardContent, AICardInsightBadge } from "@/components/ui/ai-card";
import { getVaultsActivities } from "@/apis/vault";
import { Types } from "@/types/vault";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type TimeRange = '24h' | '7d' | '30d';
type Props = {
  vault_id: string;
  timeRange: TimeRange;
  filter: Types["type"][];
  onQuickFilter?: (key: 'inflow' | 'outflow' | 'net' | 'swaps' | 'stoploss' | 'churn') => void;
  onChangeRange?: (r: TimeRange) => void;
};

const mapFilterToAction = (filter: Types["type"][]) => {
  if (filter.includes("ALL")) return "";
  if (filter.includes("SWAP")) return "SWAP";
  if (filter.includes("ADD_LIQUIDITY") || filter.includes("OPEN")) return "ADD_LIQUIDITY";
  if (filter.includes("REMOVE_LIQUIDITY") || filter.includes("CLOSE")) return "REMOVE_LIQUIDITY";
  return "";
};

export default function ActivitiesInsights({ vault_id, timeRange, filter, onQuickFilter, onChangeRange }: Props) {
  const [showReasoning, setShowReasoning] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["activities-insights", vault_id, timeRange, filter],
    queryFn: async () => {
      const res = await getVaultsActivities({
        page: 1,
        limit: 1000,
        action_type: mapFilterToAction(filter),
        time_range: timeRange,
        vault_id,
      });
      return res?.list ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });

  const insights = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) return null;

    const usdOf = (t: any) => {
      const dec = Number(t?.decimal || 0);
      const amt = Number(t?.amount || 0) / Math.pow(10, dec);
      const price = parseFloat(t?.price || "0");
      return amt * price;
    };

    let inflow = 0; // USD in
    let outflow = 0; // USD out
    let swapVol = 0; // USD volume (min leg)
    const reasons: Record<string, number> = {};
    const typeCount: Record<string, number> = {};
    let stopLossCount = 0;
    let lastStopLossTs: string | null = null;

    for (const tx of rows) {
      typeCount[tx.type] = (typeCount[tx.type] || 0) + 1;
      if (tx?.reason) {
        reasons[tx.reason] = (reasons[tx.reason] || 0) + 1;
        const r = String(tx.reason).toLowerCase();
        if (r.includes('stop-loss') || r.includes('drawdown')) {
          stopLossCount += 1;
          if (!lastStopLossTs || new Date(tx.time).getTime() > new Date(lastStopLossTs).getTime()) {
            lastStopLossTs = tx.time;
          }
        }
      }

      const t0 = tx.tokens?.[0];
      const t1 = tx.tokens?.[1];
      const usd0 = t0 ? usdOf(t0) : 0;
      const usd1 = t1 ? usdOf(t1) : 0;

      if (tx.type === "SWAP") {
        swapVol += Math.min(usd0, usd1);
        continue;
      }
      // Treat OPEN/ADD as inflow, CLOSE/REMOVE as outflow
      const sum = usd0 + usd1;
      if (tx.type === "ADD_LIQUIDITY" || tx.type === "OPEN") inflow += sum;
      if (tx.type === "REMOVE_LIQUIDITY" || tx.type === "CLOSE") outflow += sum;
    }

    const net = inflow - outflow;
    const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const rebalances = (typeCount["OPEN"] || 0) + (typeCount["CLOSE"] || 0);

    // Driver scoring (rule-based)
    const hasReason = (k: RegExp) => (topReason ? k.test(topReason) : false) ? 1 : 0;
    const zSwap = swapVol > 0 ? Math.min(1, Math.log10(1 + swapVol) / 6) : 0; // soft scale
    const zReb = rebalances > 0 ? Math.min(1, rebalances / 20) : 0;
    const narrowScore = zReb + hasReason(/churn|narrow/i);
    const driftScore = zSwap + hasReason(/deviation|drift|recenter|out of range/i);
    const protectiveScore = (stopLossCount > 0 ? 1 : 0) + (net < 0 ? 0.3 : 0);
    const stableScore = 0.2; // baseline fallback
    const scores = [narrowScore, driftScore, protectiveScore, stableScore];
    const labels = [
      "High churn from a narrow range. Many rebalances and low time in range increased costs.",
      "Inventory drift after a price move. Price moved and the position was rebalanced; fees may not yet cover the loss.",
      "Protective exit after a drawdown. Stop-loss was triggered to limit further downside.",
      "Stable period. Few rebalances and healthy time in range; fees should accumulate normally.",
    ];
    let maxIdx = 0;
    for (let i = 1; i < scores.length; i++) if (scores[i] > scores[maxIdx]) maxIdx = i;
    const sum = scores.reduce((a, b) => a + b, 0) || 1;
    const confidence = Math.max(0.05, scores[maxIdx] / sum);
    const driver = labels[maxIdx];

    // Next action mapping
    const nextMap = [
      "Widen the range to reduce churn and stay in range longer.",
      "Recenter the position if the price move persists.",
      "Stay in cooldown and re-evaluate shortly.",
      "Maintain current position and keep collecting fees.",
    ];
    const nextAction = nextMap[maxIdx];

    return { inflow, outflow, net, swapVol, topReason, typeCount, rebalances, stopLossCount, lastStopLossTs, driver, nextAction, confidence };
  }, [data]);

  return (
    <AICard
      className={cn("mb-4")}
      gradient="nova"
      glowEffect
      aiEnhanced
      aiTag="AI Insights"
      title="AI Insights"
      subtitle={(timeRange === '24h' ? 'Last 24h' : timeRange === '7d' ? 'Last 7d' : 'Last 30d')}
      headerAction={
        <div className="flex items-center gap-2">
          {(["24h","7d","30d"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => onChangeRange?.(r)}
              className={cn(
                "px-2 h-7 rounded-md border text-xs",
                r === timeRange ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/80 hover:text-white"
              )}
            >{r === '24h' ? 'Last 24h' : r === '7d' ? 'Last 7d' : 'Last 30d'}</button>
          ))}
          <button onClick={() => setShowReasoning((s) => !s)} className="text-[12px] text-white/80 hover:text-white flex items-center gap-1">
            {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReasoning ? 'Hide details' : 'Why this insight?'}
          </button>
        </div>
      }
      collapsible={false}
      loading={isLoading}
    >
      <AICardContent className="pt-2">
        {insights ? (
          <div className="flex flex-col gap-3">
            {/* Summary row */}
            <TooltipProvider delayDuration={0}>
              <div className="text-sm text-white/90 font-mono flex flex-wrap gap-x-3 gap-y-1">
                <span>Summary:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">In {formatCurrency(insights.inflow, 0, 0, 0, 'currency', 'USD')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Money added to the vault in this period.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">Out {formatCurrency(insights.outflow, 0, 0, 0, 'currency', 'USD')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Money withdrawn from the vault in this period.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">Net {insights.net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(insights.net), 0, 0, 0, 'currency', 'USD')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Difference between money added and withdrawn.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">Swaps {formatCurrency(insights.swapVol, 0, 0, 0, 'currency', 'USD')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Value of token swaps used to adjust the position.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">Churn {insights.rebalances}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">How many times the position was reset. High churn can increase costs.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">In-range —</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Average time the position stayed in the fee-earning zone.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline underline-offset-4 decoration-dotted cursor-help">Stop-loss {insights.stopLossCount || 0}{insights.lastStopLossTs ? ` (${new Date(insights.lastStopLossTs).toTimeString().slice(0,5)})` : ''}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Protective exits that lock in a loss to avoid bigger losses.</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Driver + Next action */}
            <div className="text-white/80 text-sm">
              <div className="mb-1">What this means: <span className="text-white/90">{insights.driver}</span></div>
              <div className="flex items-center gap-2">
                <span>What AI will likely do next: <span className="text-white/90">{insights.nextAction}</span></span>
                <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-xs">
                  {confidenceText(insights.confidence)} {confidenceMeter(insights.confidence)}
                </span>
              </div>
            </div>

            {/* How we read this (collapsed by default) */}
            <AnimatePresence initial={false}>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Accordion type="single" collapsible value={showReasoning ? 'ai-read' : ''} onValueChange={(v) => setShowReasoning(v === 'ai-read')}>
                    <AccordionItem value="ai-read">
                      <AccordionTrigger className="!pt-0 text-sm font-medium">How we read this</AccordionTrigger>
                      <AccordionContent className="text-sm text-white/80">
                        <ul className="list-disc pl-4 space-y-1 tabular-nums">
                          <li>Data we checked: {timeRange} adds, removes, swaps, rebalances, stop-loss.</li>
                          <li>What changed: {changeSummary(insights.inflow, insights.outflow, insights.swapVol, insights.rebalances)}</li>
                          <li>What it means: {insights.driver}</li>
                          <li>What AI will likely do next: {insights.nextAction} <span className="ml-1 text-white/70">{confidenceText(insights.confidence)} {confidenceMeter(insights.confidence)}</span></li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="text-xs text-white/70 mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Brain size={12} className="text-nova" />
                      How we inferred this
                    </span>
                  </div>
                  <ol className="space-y-2 text-[12px] text-white/80">
                    <motion.li initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
                      1. Parse {rowsCount(data)} recent transactions in {timeRange} window.
                    </motion.li>
                    <motion.li initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                      2. Classify by type and compute USD legs per tx.
                    </motion.li>
                    <motion.li initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                      3. Aggregate inflow (Add/Open) vs outflow (Remove/Close) to get net.
                    </motion.li>
                    <motion.li initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                      4. Estimate swap volume via min(USD leg A, leg B).
                    </motion.li>
                    {insights.topReason && (
                      <motion.li initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                        5. Detect dominant driver from reasons → “{insights.topReason}”.
                      </motion.li>
                    )}
                  </ol>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
                    <Chip label="Add/Open" value={insights.typeCount["ADD_LIQUIDITY"] || 0 + (insights.typeCount["OPEN"] || 0)} color="emerald" />
                    <Chip label="Remove/Close" value={insights.typeCount["REMOVE_LIQUIDITY"] || 0 + (insights.typeCount["CLOSE"] || 0)} color="orion" />
                    <Chip label="Swaps" value={insights.typeCount["SWAP"] || 0} color="violet" />
                    <div className="px-2 py-1 rounded-md border border-white/10 bg-white/5 text-white/80 flex items-center justify-between"><span>Stop-loss</span><span className="font-mono">{insights.stopLossCount || 0}</span></div>
                  </div>
                  <div className="mt-3 text-[11px] text-white/50 flex items-center gap-1">
                    <Sparkles size={12} className="text-nova" />
                    <span>Auto-adapts to filters and time range</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-white/60 text-sm">No activity in the selected period.</div>
        )}
      </AICardContent>
    </AICard>
  );
}

function rowsCount(data: any): number {
  return Array.isArray(data) ? data.length : 0;
}

function Chip({ label, value, color }: { label: string; value: number; color: "emerald" | "orion" | "violet" }) {
  const styles =
    color === "emerald"
      ? "bg-emerald/10 text-emerald border-emerald/20"
      : color === "orion"
      ? "bg-orion/10 text-orion border-orion/20"
      : "bg-violet/10 text-violet border-violet/20";
  return (
    <div className={cn("flex items-center justify-between px-2 py-1 rounded-md border text-[11px]", styles)}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function confidenceText(v: number): string {
  if (v <= 0.33) return 'Confidence: Low';
  if (v <= 0.66) return 'Confidence: Medium';
  return 'Confidence: High';
}
function confidenceMeter(v: number): string {
  const filled = Math.max(1, Math.min(5, Math.round(v * 5)));
  return ' ' + '▮'.repeat(filled) + '▯'.repeat(5 - filled);
}
