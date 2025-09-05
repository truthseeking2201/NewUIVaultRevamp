import { useEffect, useMemo, useState } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "@/components/chart/ChartTooltip";
import { cn } from "@/lib/utils";

export type NdLpPoint = { ts: string; ndlp: number; breakEven: number };
export type NdLpSeries = NdLpPoint[];

// Mock data generators (deterministic, no network)
const now = Date.now();
const HOUR = 60 * 60 * 1000;
const gen1D = (): NdLpSeries => {
  const points = 24;
  const base = 1.0;
  return Array.from({ length: points }, (_, i) => {
    const ts = new Date(now - (points - 1 - i) * HOUR).toISOString();
    const drift = Math.sin(i / 4) * 0.02; // ±2%
    const breakEven = base * (1 + 0.0); // flat break-even for demo
    const ndlp = breakEven * (1 + drift);
    return { ts, ndlp, breakEven };
  });
};
const gen1W = (): NdLpSeries => {
  const points = 7;
  const base = 1.0;
  return Array.from({ length: points }, (_, i) => {
    const ts = new Date(now - (points - 1 - i) * 24 * HOUR).toISOString();
    const drift = Math.sin(i / 1.5) * 0.05; // ±5%
    const breakEven = base * (1 + 0.0);
    const ndlp = breakEven * (1 + drift);
    return { ts, ndlp, breakEven };
  });
};

const mock1D = gen1D();
const mock1W = gen1W();

const PERIODS = [
  { value: "ONE_DAY", label: "1D" },
  { value: "ONE_WEEK", label: "1W" },
] as const;
type PeriodKey = (typeof PERIODS)[number]["value"];

function formatPct(n: number): string {
  const s = (Math.round(n * 100) / 100).toFixed(2);
  const trimmed = s.replace(/\.00$/, "").replace(/(\.\d*[1-9])0$/, "$1");
  return `${n > 0 ? "+" : n < 0 ? "" : ""}${trimmed}%`;
}
function formatPrice(n: number): string {
  return `$${n.toFixed(4)}`;
}
function fmtTime(ts: string, period: PeriodKey): string {
  const d = new Date(ts);
  if (period === "ONE_DAY") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}
function fmtTitle(ts: string): string {
  const d = new Date(ts);
  const tz = Intl.DateTimeFormat([], { timeZoneName: "short" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")} ${tz || ""}`;
}

export default function NdLpStatusChartCard() {
  const [period, setPeriod] = useState<PeriodKey>(() => (localStorage.getItem("ndlp_status_period") as PeriodKey) || "ONE_DAY");
  useEffect(() => {
    localStorage.setItem("ndlp_status_period", period);
  }, [period]);

  // Live streaming mock data derived from the baseline series
  const baseline: NdLpSeries = period === "ONE_WEEK" ? mock1W : mock1D;
  const [liveSeries, setLiveSeries] = useState<NdLpSeries>(baseline);

  useEffect(() => {
    setLiveSeries(baseline);
  }, [baseline]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeries((prev) => {
        if (!prev?.length) return prev;
        const last = prev[prev.length - 1];
        const lastTs = new Date(last.ts).getTime();
        const nextTs = lastTs + 60 * 1000; // advance by 1 minute per tick
        const be = last.breakEven; // keep break-even stable for clarity
        const prevPct = be > 0 ? last.ndlp / be - 1 : 0;
        // small drift with bounds ±12%
        const delta = (Math.random() - 0.5) * 0.004; // ±0.4% step
        let nextPct = prevPct + delta;
        nextPct = Math.max(-0.12, Math.min(0.12, nextPct));
        const next: NdLpPoint = {
          ts: new Date(nextTs).toISOString(),
          breakEven: be,
          ndlp: be * (1 + nextPct),
        };
        const size = prev.length;
        return prev.slice(1).concat(next).slice(-size);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const data = useMemo(
    () =>
      (liveSeries || []).map((p) => ({
        ...p,
        pct: (p.breakEven > 0 ? p.ndlp / p.breakEven - 1 : 0) * 100,
      })),
    [liveSeries]
  );

  const last = data[data.length - 1];
  const pctLast = last?.pct ?? 0;

  const headline = useMemo(() => {
    if (pctLast >= 1) return { text: "Your position is in Profit Zone.", cls: "text-green-increase" };
    if (pctLast <= -7) return { text: "Your position is in Risk Zone.", cls: "text-red-error" };
    return { text: "Your position is in Wait Zone.", cls: "text-yellow-warning" };
  }, [pctLast]);

  const tooltipRenderer = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    const rows = [
      { label: "NDLP Price", value: formatPrice(p.ndlp) },
      { label: "Break-even", value: formatPrice(p.breakEven) },
      { label: "Distance", value: formatPct(p.pct) },
    ];
    return <ChartTooltip title={fmtTitle(p.ts)} rows={rows} />;
  };

  return (
    <DetailWrapper
      title="Your Position Status"
      titleComponent={
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
          <TabsList className="p-1 flex gap-1">
            {PERIODS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      aria-label="Your Position Status chart"
    >
      <div className="text-white/90 text-sm mb-3">
        <span>Your position is in </span>
        <span className={cn("font-semibold", headline.cls)}>{headline.text.replace("Your position is in ", "").replace(".", "")}</span>
        <span>.</span>
      </div>

      <div className="rounded-lg overflow-hidden" role="img" aria-label="Your Position Status chart">
        <ResponsiveContainer height={300}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="ndlpGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F2BB89" />
                <stop offset="50.48%" stopColor="#F3D2B5" />
                <stop offset="100%" stopColor="#F5C8A4" />
              </linearGradient>
            </defs>
            {/* Zones: use currentColor via className to honor tokens */}
            <ReferenceArea y1={1} y2={15} fill="currentColor" className="text-green-increase/15" strokeOpacity={0} />
            <ReferenceArea y1={-7} y2={1} fill="currentColor" className="text-yellow-warning/20" strokeOpacity={0} />
            <ReferenceArea y1={-15} y2={-7} fill="currentColor" className="text-red-error/20" strokeOpacity={0} />

            {/* Axes */}
            <XAxis
              dataKey="ts"
              tickFormatter={(v) => fmtTime(v, period)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              minTickGap={24}
            />
            <YAxis
              domain={[-15, 15]}
              ticks={[-15, -7, 1, 9, 15]}
              tickFormatter={(v) => formatPct(Number(v))}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />

            {/* 0% dashed line */}
            <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.20)" strokeDasharray="6 4" strokeOpacity={1} />

            {/* NDLP line (pct) */}
            <Line
              type="monotone"
              dataKey="pct"
              stroke="url(#ndlpGrad)"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                const lastIndex = data.length - 1;
                if (index !== lastIndex) return null;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={4} fill="#F3D2B5" />
                    <circle cx={cx} cy={cy} r={8} fill="none" stroke="#F3D2B5" strokeOpacity={0.35} strokeWidth={6} />
                  </g>
                );
              }}
              activeDot={{ r: 4, stroke: "#F3D2B5", strokeOpacity: 0.35, strokeWidth: 8, fill: "#F3D2B5" }}
              isAnimationActive={false}
            />

            {/* Tooltip (dark, shared) */}
            <Tooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={tooltipRenderer} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-white/80">
        <div className="flex items-center gap-2">
          <span className="inline-block" style={{ width: 56, height: 0, borderTop: "2px solid hsl(var(--primary))" }} />
          <span>Vault’s NDLP Price</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block" style={{ width: 56, height: 0, borderTop: "2px dashed rgba(255, 255, 255, 0.20)" }} />
          <span>Break-Even Price</span>
        </div>
      </div>
    </DetailWrapper>
  );
}
