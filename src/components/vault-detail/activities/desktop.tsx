import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, Plus, ArrowUpRight } from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import {
  ITEMS_PER_PAGE,
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
} from "@/components/vault-detail/constant";
import {
  formatTime,
  renamingType,
  displayTokenSymbol,
  tokenIconPath,
} from "@/components/vault-detail/activities/utils";
import AIHint from "@/components/vault-detail/activities/ai-hint";

const DesktopTable = ({
  paginatedTransactions,
  isFetching,
  isFetched,
  handleSelectTransaction,
  expandedId,
  onToggleExpand,
}: {
  paginatedTransactions: any[];
  isFetching: boolean;
  isFetched: boolean;
  handleSelectTransaction: (tx: any) => void;
  expandedId: string | null;
  onToggleExpand: (tx: any) => void;
}) => {
  return (
    <Table className="w-full border-0">
      <TableHeader className="border-b border-white/20">
        <TableRow className="border-b-0 border-white/10 hover:bg-transparent">
          <TableHead className="w-[28px] !px-0"></TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[140px] !px-0">
            Type
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[160px] px-2">
            Time
          </TableHead>

          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[220px] px-2">
            Tokens
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[100px] px-2">
            Value
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[60px] !px-0 text-right">
            Tx Hash
          </TableHead>
        </TableRow>
      </TableHeader>
      <div className="mt-4" />
      <TableBody>
        {isFetching ? (
          Array(ITEMS_PER_PAGE)
            .fill(0)
            .map((_, i) => (
              <TableRow
                key={i}
                className={cn("hover:bg-white/5 w-full h-[70px] border-0")}
              >
                {Array.from({ length: 5 }).map((_, col) => (
                  <TableCell
                    key={col}
                    className={cn("pr-0 pl-4 pt-3 border-0")}
                  >
                    <div className="h-5 bg-white/10 animate-pulse rounded mt-3"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
        ) : isFetched && paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((tx, index) => (
            <>
            <TableRow
              key={`transaction-${index}`}
              className={"hover:bg-[#FFFFFF14] cursor-pointer h-[70px] border-b border-white/10"}
              onClick={() => {/* toggle handled by parent via onClick of badge below */}}
            >
              <TableCell className={cn("pr-0 pl-2 pt-3 border-0 w-[28px]")}>
                <AIHint tx={tx} tone="subtle" showDot={false} size={14} />
              </TableCell>
              <TableCell className={cn("pr-0 pl-2 pt-3 border-0")}>
                <div className="flex items-center gap-2">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex items-center text-xs font-medium px-2 py-1 rounded-md",
                            REMOVE_LIQUIDITY_TYPES.includes(tx.type) &&
                              "bg-[#F97316]/30 text-[#F97316]",
                            ADD_LIQUIDITY_TYPES.includes(tx.type) &&
                              "bg-[#22C55E]/20 text-[#22C55E]",
                            tx.type === "SWAP" && "bg-[#3B82F6]/30 text-[#3B82F6]"
                          )}
                          title={tx?.reason || undefined}
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(tx); }}
                        >
                          {ADD_LIQUIDITY_TYPES.includes(tx.type) && (
                            <Plus size={16} className="inline-block mr-1" />
                          )}
                          {REMOVE_LIQUIDITY_TYPES.includes(tx.type) && (
                            <ArrowUpRight size={16} className="inline-block mr-1" />
                          )}
                          {tx.type === "SWAP" && (
                            <img
                              src={SwapIcon}
                              alt="Swap"
                              className="inline-block mr-1"
                            />
                          )}
                          {renamingType(tx.type)}
                        </span>
                      </TooltipTrigger>
                      {tx?.reason && (
                        <TooltipContent side="top" align="start" className="max-w-[320px] bg-black/90 border border-white/10 leading-snug text-[12px]">
                          {tx.reason}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  {tx?.reason && (
                    <div className="text-[11px] text-white/60 italic truncate max-w-[360px]">{tx.reason}</div>
                  )}
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "font-mono text-xs text-white/70 px-2 pt-2 border-0"
                )}
              >
                {formatTime(tx.time)}
              </TableCell>

              <TableCell className={cn("p-2 border-0")}> 
                {(() => {
                  const signFor = (idx: number) => {
                    if (tx.type === "SWAP") return idx === 0 ? "−" : "+";
                    if (REMOVE_LIQUIDITY_TYPES.includes(tx.type)) return "−";
                    return "+";
                  };
                  const usdOf = (t: any) => {
                    const dec = Number(t?.decimal || 0);
                    const amt = Number(t?.amount || 0) / Math.pow(10, dec);
                    const price = parseFloat(t?.price || "0");
                    return amt * price;
                  };
                  const left = tx.tokens?.[0];
                  const right = tx.tokens?.[1];
                  return (
                    <div className="flex flex-col gap-1">
                      {left && (
                        <div>
                          <div className="flex items-center justify-start gap-1">
                            <img
                              src={tokenIconPath(left?.token_symbol)}
                              alt={displayTokenSymbol(left?.token_name)}
                              className="w-[18px] h-[18px] inline-flex items-center"
                            />
                            <span className="font-mono text-sm text-white">
                              {signFor(0)}{formatCurrency(left?.amount || 0, left?.decimal, 0, 4)}{" "}
                              <span className="font-mono text-xs text-white/70">
                                {displayTokenSymbol(left?.token_symbol)}
                              </span>
                            </span>
                          </div>
                          <div className="pl-6 text-[11px] text-white/60">≈ {formatCurrency(usdOf(left), 0, 0, 2, "currency", "USD")}</div>
                        </div>
                      )}
                      {right && (
                        <div>
                          <div className="flex items-center justify-start gap-1 mt-1">
                            <img
                              src={tokenIconPath(right?.token_symbol)}
                              alt={displayTokenSymbol(right?.token_name)}
                              className="w-[18px] h-[18px] inline-flex items-center"
                            />
                            <span className="font-mono text-sm text-white">
                              {signFor(1)}{formatCurrency(right?.amount || 0, right?.decimal, 0, 4)}{" "}
                              <span className="font-mono text-xs text-white/70">
                                {displayTokenSymbol(right?.token_symbol)}
                              </span>
                            </span>
                          </div>
                          <div className="pl-6 text-[11px] text-white/60">≈ {formatCurrency(usdOf(right), 0, 0, 2, "currency", "USD")}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell
                className={cn(
                  "font-mono font-medium text-white px-2 flex pt-3.5 border-0"
                )}
              >
                {formatCurrency(tx.value, 0, 0, 2, "currency", "USD")}
              </TableCell>
              <TableCell className={cn("text-right font-mono font-medium pr-4 pt-4 border-0") }>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTransaction(tx);
                        }}
                        title="View on-chain details"
                      >
                        <ExternalLink size={16} className="text-white/60" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="bg-black/90 border border-white/10">
                      View on-chain details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
            {expandedId === tx.id && (
              <TableRow className="bg-white/[0.03] border-b border-white/10">
                <TableCell colSpan={6} className="p-3">
                  <div className="grid grid-cols-4 gap-3 text-[12px] text-white/80">
                    <div>
                      <div className="text-white/60 mb-1">AI Thinking</div>
                      <div>{tx.reason || 'Strategy-driven reallocation'}</div>
                    </div>
                    <div>
                      <div className="text-white/60 mb-1">Decision</div>
                      <div>{renamingType(tx.type)}</div>
                    </div>
                    <div>
                      <div className="text-white/60 mb-1">Impact</div>
                      <div>Value {formatCurrency(tx.value, 0, 0, 2, 'currency', 'USD')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 mb-1">On-chain</div>
                      <Button variant="link" size="sm" className="h-6 px-2" onClick={(e) => { e.stopPropagation(); handleSelectTransaction(tx); }}>View tx <ExternalLink size={14} className="ml-1 inline" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <a href="#pnl-card" className="text-[12px] text-white/80 underline underline-offset-4 decoration-dotted">View impact in Your Holdings</a>
                  </div>
                </TableCell>
              </TableRow>
            )}
            </>
          ))
        ) : (
          <TableRow className="border-0">
            <TableCell
              colSpan={6}
              className="text-center py-8 text-white/60 border-0"
            >
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DesktopTable;
