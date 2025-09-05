import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AICard, AICardContent, AICardInsightBadge } from "@/components/ui/ai-card";
import { getVaultsActivities } from "@/apis/vault";
import { Types } from "@/types/vault";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

type Props = {
  vault_id: string;
  timeRange: '24h' | '7d';
  filter: Types["type"][];
};

const mapFilterToAction = (filter: Types["type"][]) => {
  if (filter.includes("ALL")) return "";
  if (filter.includes("SWAP")) return "SWAP";
  if (filter.includes("ADD_LIQUIDITY") || filter.includes("OPEN")) return "ADD_LIQUIDITY";
  if (filter.includes("REMOVE_LIQUIDITY") || filter.includes("CLOSE")) return "REMOVE_LIQUIDITY";
  return "";
};

export default function ActivitiesInsights({ vault_id, timeRange, filter }: Props) {
  const [showReasoning, setShowReasoning] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["activities-insights", vault_id, timeRange, filter],
    queryFn: async () => {
      const res = await getVaultsActivities({
        page: 1,
        limit: 100,
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

    // Likely driver heuristic
    let driver: string | null = null;
    if (stopLossCount > 0) driver = 'Protective exit after drawdown.';
    else if (rebalances >= 6) driver = 'High churn from narrow range.';
    else if (topReason && /deviation|drift|recenter/i.test(topReason)) driver = 'Inventory drift after deviation.';

    return { inflow, outflow, net, swapVol, topReason, typeCount, rebalances, stopLossCount, lastStopLossTs, driver };
  }, [data]);

  return (
    <AICard
      className={cn("mb-4")}
      gradient="nova"
      glowEffect
      aiEnhanced
      aiTag="AI Insights"
      title="AI Insights"
      subtitle={timeRange === '24h' ? 'Analyzing last 24 hours' : 'Analyzing last 7 days'}
      headerAction={
        <button
          onClick={() => setShowReasoning((s) => !s)}
          className="text-[12px] text-white/80 hover:text-white flex items-center gap-1"
        >
          {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showReasoning ? 'Hide explanation' : 'Explain'}
        </button>
      }
      collapsible={false}
      loading={isLoading}
    >
      <AICardContent className="pt-2">
        {insights ? (
          <div className="flex flex-col gap-3">
            {/* AI summary line */}
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Brain size={16} className="text-nova" />
              <span>
                AI summary: <span className="font-medium">{insights.net >= 0 ? 'Net inflow' : 'Net outflow'}</span> {formatCurrency(Math.abs(insights.net), 0, 0, 2, 'currency', 'USD')} ({timeRange}).
              </span>
            </div>

            {/* Stat badges */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
              <AICardInsightBadge type={insights.net >= 0 ? 'success' : 'alert'}>
                Net {insights.net >= 0 ? 'inflow' : 'outflow'} {formatCurrency(Math.abs(insights.net), 0, 0, 2, 'currency', 'USD')}
              </AICardInsightBadge>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                Inflow: <span className="text-white">{formatCurrency(insights.inflow, 0, 0, 2, 'currency', 'USD')}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                Outflow: <span className="text-white">{formatCurrency(insights.outflow, 0, 0, 2, 'currency', 'USD')}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                Swaps: <span className="text-white">{formatCurrency(insights.swapVol, 0, 0, 2, 'currency', 'USD')}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                Churn: <span className="text-white">{insights.rebalances}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                In-range (24h): <span className="text-white">—</span>
              </div>
            </div>

            {/* Trend reason */}
            <div className="text-white/70 italic truncate max-w-full">
              {insights.driver ? (
                <>Likely driver: “{insights.driver}”</>
              ) : (
                insights.topReason ? <>Likely driver: “{insights.topReason}”</> : null
              )}
            </div>

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
          <div className="text-white/60 text-sm">No recent data to analyze</div>
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
