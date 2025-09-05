import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn, formatAmount } from "@/lib/utils";
import { DepositToken } from "@/types/deposit-token.types";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

type SelectTokensProps = {
  selectedToken: string;
  tokens: DepositToken[];
  title: string | React.ReactNode;
  onSelectToken: (token: string) => void;
};

const SelectTokens = ({
  selectedToken,
  tokens,
  title,
  onSelectToken,
}: SelectTokensProps) => {
  const { isMd } = useBreakpoint();
  const currentToken = tokens.find(
    (token) => token.token_address.toLowerCase() === selectedToken.toLowerCase()
  );
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="flex items-center border border-[#505050] rounded-full px-2 py-1.5 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-1">
          <img
            src={`/coins/${currentToken?.symbol?.toLowerCase()}.png`}
            alt={currentToken?.symbol}
            className="w-4 h-4 mr-1 rounded-xl"
          />
          <span
            className={cn(
              "text-white font-medium",
              isMd ? "text-[13px]" : "text-sm"
            )}
          >
            {currentToken?.symbol}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-white ml-1" />
      </div>
      <DialogContent
        hideIconClose
        className="p-0 border-white/12 rounded-2xl md:rounded-xl md:w-[400px]"
      >
        <DialogHeader>
          {typeof title === "string" ? (
            <DialogTitle className="m-0 mb-2 px-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="font-sans text-xl font-bold">{title}</div>
                <button
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </DialogTitle>
          ) : (
            title
          )}
        </DialogHeader>
        <div className="w-full h-[0.25px] bg-[#676767]" />
        <DialogDescription>
          <div className="flex flex-col gap-5 px-4">
            <div className="font-sans text-base font-light text-white/50 flex justify-between">
              <div>Token</div>
              <div>Balance</div>
            </div>
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center cursor-pointer w-full justify-between hover:bg-white/5 p-2 rounded-lg"
                onClick={() => {
                  onSelectToken(token.token_address);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <img
                    src={`/coins/${token.symbol?.toLowerCase()}.png`}
                    alt={token.symbol}
                    className="w-10 h-10 mr-3 rounded-[20px]"
                  />
                  <span className="text-white text-base font-medium">
                    {token.symbol}
                  </span>
                </div>
                <div className="font-sans text-base font-medium">
                  {formatAmount({
                    amount: token.balance,
                    precision: token.decimals,
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default SelectTokens;
