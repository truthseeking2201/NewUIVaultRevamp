import { RowItem } from "@/components/ui/row-item";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";

const TransactionFee = () => {
  return (
    <RowItem className="flex-col md:flex-row justify-start items-start md:items-center md:justify-between gap-1">
      <RowItem.Label>
        <span className="text-13px md:text-sm text-white/80">
          Transaction Fee
        </span>
      </RowItem.Label>
      <RowItem.Value>
        <LabelWithTooltip
          hasIcon={false}
          asChild={false}
          label="Only Gas Fee"
          labelClassName="text-sm font-mono text-white underline underline-offset-8 decoration-dotted decoration-gray-600"
          tooltipContent="NODO does not charge any platform fee for this transaction. You’ll only pay the standard gas fee to the Sui blockchain. The exact gas amount is estimated by your wallet based on current network activity."
          contentClassName="text-sm font-sans max-w-[250px]"
        />
      </RowItem.Value>
    </RowItem>
  );
};

export default TransactionFee;
