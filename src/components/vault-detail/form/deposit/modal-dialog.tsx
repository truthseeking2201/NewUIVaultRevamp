import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export const DepositDialogContent = ({
  children,
  depositStep,
}: {
  children: React.ReactNode;
  depositStep: number;
}) => {
  const { isMd } = useBreakpoint();

  return (
    <DialogContent
      hideIconClose
      className={cn(
        "max-md:px-4 px-6 md:pb-6 md:pt-0 gap-6 bg-[#141517] rounded-2xl border-white/10",
        depositStep === 2 && !isMd && "py-0",
        depositStep === 1 && isMd && "md:pt-4"
      )}
    >
      {children}
    </DialogContent>
  );
};

export const DepositDialogHeader = ({
  depositStep,
  onOpenChange,
}: {
  depositStep: number;
  onOpenChange: () => void;
}) => {
  return (
    <DialogHeader className="flex flex-row justify-between items-center">
      {depositStep === 1 && (
        <>
          <DialogTitle className="text-base md:text-xl font-bold m-0">
            Confirm Your Deposit
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm Your Deposit
          </DialogDescription>
          <Button
            variant="icon"
            className="w-8 h-8 bg-white/5 p-2 text-gray-400 !mt-0"
            onClick={onOpenChange}
          >
            <X size={20} className="text-white" />
          </Button>
        </>
      )}
    </DialogHeader>
  );
};
