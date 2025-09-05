import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { TokenType } from "@/types/lp.type";
import { showFormatNumber } from "@/lib/number";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  amount: number | null;
  token: TokenType;
  className?: string;
  isLoading?: boolean;
};

const AmountToken = ({ amount, token, className = "", isLoading }: Props) => {
  return (
    <div
      className={cn(
        "font-mono font-bold flex items-center justify-start md:justify-between md:flex-row-reverse",
        className
      )}
    >
      <div className="flex items-center">
        <img
          src={token?.image}
          alt={token?.token_symbol}
          className="w-6 h-6 mr-2"
        />
        <div className="text-lg max-md:hidden">{token?.token_symbol}</div>
      </div>
      {isLoading ? (
        <Skeleton className="w-24 md:w-32 h-6 md:h-7" />
      ) : (
        <DynamicFontText
          maxWidth={300}
          breakpoints={[
            {
              minLength: 0,
              fontSize: "text-[32px] leading-[24px] max-sm:text-lg",
            },
            { minLength: 13, fontSize: "text-lg max-sm:text-base" },
            { minLength: 18, fontSize: "text-base max-sm:text-sm" },
          ]}
        >
          {amount
            ? `${showFormatNumber(amount, 0, Math.min(token.decimal, 6))} `
            : "--"}
        </DynamicFontText>
      )}
    </div>
  );
};

export default AmountToken;
