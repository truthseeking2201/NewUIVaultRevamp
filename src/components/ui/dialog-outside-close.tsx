import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogOutsideCloseProps {
  open: boolean;
  onOpenChange: (params?: any) => void;
  children: ReactNode;
  maxWidth?: number;
  className?: string;
  classNameDialog?: string;
  name?: string;
  hideIconClose?: boolean;
}

export function DialogOutsideClose({
  open = false,
  onOpenChange = () => {},
  children,
  className = "",
  classNameDialog = "",
  name = "dialog-outside-close",
  hideIconClose = false,
}: DialogOutsideCloseProps) {
  /**
   * RENDER
   */
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={cn(
          `!rounded-xl !p-0 bg-transparent border-none gap-0 max-h-[100vh] !pb-4 !pt-4 focus:outline-none focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-offset-0 !outline-none`,
          classNameDialog
        )}
        hideIconClose
      >
        {hideIconClose !== true && (
          <div className="flex justify-end mb-3">
            <DialogClose className="rounded-full bg-white/20 w-10 h-10 flex items-center justify-center hover:opacity-70">
              <X className="h-6 w-6 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        )}

        <DialogHeader className="p-0 relative flex flex-row items-start justify-between	flex-wrap">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">{name}</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "max-h-[calc(100vh-120px)] overflow-auto border bg-black py-6 px-4 md:px-6 rounded-xl shadow-lg",
            className
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
