import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import PaymentTokenType from "@/types/payment-token.types";

type SelectTokensProps = {
  selectedToken: PaymentTokenType;
  tokens: PaymentTokenType[];
  title: string | React.ReactNode;
  onSelectToken: (token: PaymentTokenType) => void;
};

const SelectTokens = ({
  selectedToken,
  tokens,
  title,
  onSelectToken,
}: SelectTokensProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTitle className="m-0">
          <div
            className="flex items-center border border-[#505050] rounded-full px-2 py-1.5 cursor-pointer m-0"
            onClick={() => setIsOpen(true)}
          >
            {selectedToken ? (
              <div className="flex items-center">
                <img
                  src={selectedToken?.image}
                  alt={selectedToken?.token_symbol}
                  className="w-4 h-4 mr-1"
                />
                <span className="text-white text-sm font-medium">
                  {selectedToken?.token_symbol}
                </span>
              </div>
            ) : (
              <div className="text-white text-sm font-medium">Select token</div>
            )}
            <ChevronDown className="w-5 h-5 text-white ml-1" />
          </div>
        </DialogTitle>
        <DialogContent
          hideIconClose
          className="sm:max-w-[384px] border-white/12 rounded-xl"
        >
          <DialogHeader>
            {typeof title === "string" ? (
              <DialogTitle className="m-0 mb-0">
                <div className="flex items-center justify-between">
                  <div className="font-sans text-xl font-bold">{title}</div>
                  <button
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <X
                      size={20}
                      className="text-white"
                    />
                  </button>
                </div>
              </DialogTitle>
            ) : (
              title
            )}
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>

          <div>
            <div className="flex flex-col gap-3 -mx-2">
              {tokens.map((token) => (
                <div
                  key={token.token_symbol}
                  className="flex items-center cursor-pointer hover:bg-white/10 p-2 rounded-sm"
                  onClick={() => {
                    onSelectToken(token);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={`/coins/${token.token_symbol.toLocaleLowerCase()}.png`}
                    alt={token.token_symbol}
                    className="w-10 h-10 mr-3"
                  />
                  <span className="text-white text-base font-medium">
                    {token.token_symbol}
                  </span>
                </div>
              ))}
            </div>

            {!tokens?.length && (
              <div className="py-3">There are no tokens to select</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectTokens;
