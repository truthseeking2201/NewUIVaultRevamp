import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Web3Button from "@/components/ui/web3-button";
import useBreakpoint from "@/hooks/use-breakpoint";

const RiskDisclosuresPopup = ({
  isOpen,
  setIsOpen,
  setVisibleDisclaimer,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setVisibleDisclaimer: () => void;
}) => {
  const { isMobile } = useBreakpoint();
  const [isRead, setIsRead] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setIsRead(checked);
  };

  const handleContinue = () => {
    setVisibleDisclaimer();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideIconClose
        className="md:p-6 px-4 py-6 md:gap-6 bg-[#141517] rounded-2xl border-white/10"
      >
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-base md:text-xl font-bold m-0">
            Acknowledge Risks
          </DialogTitle>
          <Button
            variant="icon"
            className="w-8 h-8 bg-white/5 p-2 text-gray-400 !mt-0"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} className="text-white" />
          </Button>
        </DialogHeader>
        <DialogDescription className="mb-0">
          By proceeding, you confirm that you understand and accept the risks
          associated with this product, and have read our
          {isMobile ? <br /> : " "}
          <span className="relative">
            <a
              href="https://docs.nodo.xyz/public/user-policy/nodo-ai-risk-disclosures"
              target="_blank"
              className="bg-clip-text text-transparent bg-[linear-gradient(87deg,_#9DEBFF_-0.54%,_#00FF5E_97.84%)]"
            >
              Risk Disclosure Policy
            </a>
            <span className="absolute bottom-0 left-0 bg-[linear-gradient(87deg,_#9DEBFF_-0.54%,_#00FF5E_97.84%)] w-full h-[1px]" />
          </span>
          <div className="mt-4 flex items-center gap-2">
            <Checkbox
              id="disclaimer-checkbox"
              checked={isRead}
              onCheckedChange={handleCheckboxChange}
              className="bg-transparent border-white/20 hover:bg-white/5"
            />
            <label
              htmlFor="disclaimer-checkbox"
              className="text-white text-sm select-none cursor-pointer"
            >
              I have read and accept the risks
            </label>
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Back
            </Button>
            <Web3Button
              className="rounded-lg grow"
              onClick={handleContinue}
              disabled={!isRead}
            >
              Continue
            </Web3Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDisclosuresPopup;
