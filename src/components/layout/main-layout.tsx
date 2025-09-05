import useBreakpoint from "@/hooks/use-breakpoint";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import { useRibbon } from "@/hooks/use-ribbon";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isMd } = useBreakpoint();
  const [visibleRibbon] = useRibbon();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden main-bg">
      <AnimatePresence mode="wait">
        <motion.div
          id="main-layout"
          className="flex flex-col h-screen relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AppHeader />
          <div
            id="main-layout-content"
            className={cn(
              "flex-1 overflow-y-auto ",
              visibleRibbon ? (isMd ? "pt-[122px]" : "pt-[93px]") : "pt-[70px]"
            )}
            style={{ height: "calc(100vh - 77px)" }}
          >
            <div>
              {children}
              <AppFooter />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
