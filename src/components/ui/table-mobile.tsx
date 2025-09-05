import React from "react";
import { cn } from "@/lib/utils";
import { formatDate12Hours } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "./skeleton";

export const RowSkeleton = () => (
  <div className="flex justify-between items-start">
    <Skeleton className="w-1/3 h-6" />
    <Skeleton className="w-1/3 h-6" />
  </div>
);

export const RowType = ({
  type,
  className,
  icon,
  leftExtra,
  rightExtra,
}: {
  type: string;
  className?: string;
  icon?: React.ReactNode;
  leftExtra?: React.ReactNode;
  rightExtra?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2 w-full">
    <div className="flex items-center gap-1">
      {leftExtra && <div className="mr-1">{leftExtra}</div>}
      <div className="text-xs text-white/80">Type</div>
    </div>
    <div className="flex items-center">
      <div
        className={cn(
          "text-xs px-2 py-1 rounded-lg font-semibold ml-2",
          className
        )}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {type}
      </div>
      {rightExtra && <div className="ml-2">{rightExtra}</div>}
    </div>
  </div>
);

export const RowTime = ({
  timestamp,
  className,
}: {
  timestamp: string;
  className?: string;
  isLoading?: boolean;
  loadingClassName?: string;
  loadingLabelStyle?: string;
  loadingValueStyle?: string;
}) => {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const tzParts = d.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ');
  const tz = tzParts[tzParts.length - 1] || 'UTC';
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
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <div className="text-xs text-white/80">Time</div>
      <div className="text-[11px] text-white/70 font-mono">{text}</div>
    </div>
  );
};

export const RowTokens = ({
  tokens,
  type,
}: {
  tokens: Array<{
    token_symbol: string;
    token_name: string;
    amount: number;
    decimal: number;
    price?: string | number;
  }>;
  type: string;
}) => {
  const signFor = (idx: number) => {
    if (type === "SWAP") return idx === 0 ? "−" : "+";
    if (["REMOVE_LIQUIDITY", "CLOSE"].includes(type)) return "−";
    return "+";
  };
  const usdOf = (t: any) => {
    const dec = Number(t?.decimal || 0);
    const amt = Number(t?.amount || 0) / Math.pow(10, dec);
    const price = parseFloat(t?.price || "0");
    return amt * price;
  };
  return (
    <div className="flex justify-between items-start">
      <div className="text-xs text-white/80">Tokens</div>
      <div className="flex flex-col gap-1">
        {tokens?.[0] && (
          <div>
            <div className="flex items-center justify-start gap-1">
              <img
                src={`/coins/${tokens?.[0]?.token_symbol?.toLowerCase()}.png`}
                alt={tokens?.[0]?.token_name}
                className="w-[18px] h-[18px] inline-flex items-center"
              />
              <span className="font-mono text-xs text-white">
                {signFor(0)}{formatCurrency(tokens?.[0]?.amount || 0, tokens?.[0]?.decimal, 0, 4)}{" "}
                <span className="font-mono text-[10px] text-white/70">
                  {tokens?.[0]?.token_symbol}
                </span>
              </span>
            </div>
            <div className="pl-6 text-[11px] text-white/60">≈ {formatCurrency(usdOf(tokens?.[0]), 0, 0, 2, "currency", "USD")}</div>
          </div>
        )}
        {tokens?.[1] && tokens?.[1]?.token_name && (
          <div>
            <div className="flex items-center justify-start gap-1 mt-1">
              <img
                src={`/coins/${tokens?.[1]?.token_symbol?.toLowerCase()}.png`}
                alt={tokens?.[1]?.token_name}
                className="w-[18px] h-[18px] inline-flex items-center"
              />
              <span className="font-mono text-xs text-white">
                {signFor(1)}{formatCurrency(tokens?.[1]?.amount || 0, tokens?.[1]?.decimal, 0, 4)}{" "}
                <span className="font-mono text-[10px] text-white/70">
                  {tokens?.[1]?.token_symbol}
                </span>
              </span>
            </div>
            <div className="pl-6 text-[11px] text-white/60">≈ {formatCurrency(usdOf(tokens?.[1]), 0, 0, 2, "currency", "USD")}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RowValue = ({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string | number;
  labelClassName?: string;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className={cn("text-xs text-white/80", labelClassName)}>{label}</span>
    <span className={cn("text-xs text-white", valueClassName)}>{value}</span>
  </div>
);

export const RowNote = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("text-[11px] text-white/60 italic leading-snug", className)}>
    {children}
  </div>
);

export const RowAction = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <div className="text-xs text-white/80">{label}</div>
    {children && children}
  </div>
);

const TableMobile = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
};

export default TableMobile;
