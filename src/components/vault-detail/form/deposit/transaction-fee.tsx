import ModalRow from "./modal-row";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { cn } from "@/lib/utils";

const TransactionFee = ({
  className,
  labelClassName,
}: {
  className?: string;
  labelClassName?: string;
}) => {
  return (
    <ModalRow
      className={className}
      label="Transaction Fee"
      value={
        <LabelWithTooltip
          hasIcon={false}
          asChild={true}
          label="Only Gas Fee"
          labelClassName={cn(
            labelClassName,
            "text-lg font-mono max-md:text-sm text-white underline underline-offset-8 decoration-dotted decoration-gray-600"
          )}
          tooltipContent="NODO does not charge any platform fee for this transaction. You’ll only pay the standard gas fee to the Sui blockchain. The exact gas amount is estimated by your wallet based on current network activity."
          propsTooltipContent={{ align: "end" }}
        />
      }
    />
  );
};

export default TransactionFee;
