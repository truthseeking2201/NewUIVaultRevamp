import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, ArrowUpRight } from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import TableMobile, {
  RowTokens,
  RowType,
  RowTime,
  RowValue,
  RowNote,
  RowAction,
  RowSkeleton,
} from "@/components/ui/table-mobile";
import {
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
} from "@/components/vault-detail/constant";
import { renamingType, displayTokenSymbol } from "@/components/vault-detail/activities/utils";
import ConditionRenderer from "@/components/shared/condition-renderer";
import ExternalIcon from "@/assets/icons/external-gradient.svg?react";
import AIHint from "@/components/vault-detail/activities/ai-hint";

const MobileList = ({
  paginatedTransactions,
  isFetched,
  handleSelectTransaction,
  expandedId,
  onToggleExpand,
}: {
  paginatedTransactions: any[];
  isFetched: boolean;
  handleSelectTransaction: (transaction: any) => void;
  expandedId: string | null;
  onToggleExpand: (tx: any) => void;
}) => {
  return (
    <ConditionRenderer
      when={isFetched}
      fallback={
        <TableMobile>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Fragment key={i}>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <hr className="bg-white/80 my-4" />
              </Fragment>
            ))}
        </TableMobile>
      }
    >
      <TableMobile>
        {paginatedTransactions.map((tx, index) => {
          const displayTokens = (tx.tokens || []).map((t: any) => ({
            ...t,
            token_symbol: displayTokenSymbol(t.token_symbol),
            token_name: displayTokenSymbol(t.token_name),
          }));
          return (
          <Fragment key={`transaction-${index}`}>
            <RowType
              type={renamingType(tx.type)}
              leftExtra={<AIHint tx={tx} tone="subtle" showDot={false} size={14} />}
              icon={
                ADD_LIQUIDITY_TYPES.includes(tx.type) ? (
                  <Plus size={16} className="inline-block mr-1" />
                ) : REMOVE_LIQUIDITY_TYPES.includes(tx.type) ? (
                  <ArrowUpRight size={16} className="inline-block mr-1" />
                ) : tx.type === "SWAP" ? (
                  <img
                    src={SwapIcon}
                    alt="Swap"
                    className="inline-block mr-1"
                  />
                ) : null
              }
              className={cn(
                "inline-block text-xs font-medium px-2 py-1 rounded-md",
                REMOVE_LIQUIDITY_TYPES.includes(tx.type) &&
                  "bg-[#F97316]/30 text-[#F97316]",
                ADD_LIQUIDITY_TYPES.includes(tx.type) &&
                  "bg-[#22C55E]/20 text-[#22C55E]",
                tx.type === "SWAP" && "bg-[#3B82F6]/30 text-[#3B82F6]"
              )}
              rightExtra={null}
            />
            <RowTokens tokens={displayTokens} type={tx.type} />
            {tx?.reason && (
              <RowNote>{tx.reason}</RowNote>
            )}
            <RowValue
              label="Value"
              value={formatCurrency(tx.value, 0, 0, 2, "currency", "USD")}
            />
            <RowTime timestamp={tx.time} />
            <RowAction label="Tx Hash">
              <Button
                variant="link"
                size="sm"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTransaction(tx);
                }}
              >
                <ExternalIcon />
              </Button>
            </RowAction>
            {expandedId === tx.id && (
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-2">
                <div className="text-[11px] text-white/60">AI Thinking</div>
                <div className="text-[12px] text-white/80">{tx.reason || 'Strategy-driven reallocation'}</div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-white/80">
                  <div>Decision: {renamingType(tx.type)}</div>
                  <a href="#pnl-card" className="underline underline-offset-4 decoration-dotted">View P&L</a>
                </div>
              </div>
            )}
            <div className="mt-1">
              <Button variant="link" size="sm" className="px-0 h-6 text-[12px]" onClick={() => onToggleExpand(tx)}>
                {expandedId === tx.id ? 'Hide details' : 'View details'}
              </Button>
            </div>
            <hr className="bg-white/15 my-3 h-[1px] border-0" />
          </Fragment>
        );})}
      </TableMobile>
    </ConditionRenderer>
  );
};

export default MobileList;
