import React, { useState } from "react";
import {
  Drawer,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Menu, X } from "lucide-react";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReferralTooltip from "../my-referrals/referral-tooltip";

import Icon from "@/components/icon";
import { useScrollbarWidth } from "@/hooks/use-scrollbar-width";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { ReferralContent } from "@/components/my-referrals/referral-tooltip";
import { useWallet } from "@/hooks";
import { Ribbon } from "@/components/shared/ribbon";
import { cn } from "@/lib/utils";
import { useRibbon } from "@/hooks/use-ribbon";

const pageRoutes = [
  {
    icon: "Vault",
    label: "Vaults",
    path: "/",
  },
  // {
  //   icon: "Dashboard",
  //   label: "Dashboard",
  //   path: "/dashboard",
  // },
] as const;

type HeaderProps = {
  dataRefer: {
    referCode: string | null;
    referLinkCode: string;
    referTotal: number | null;
  };
};

const DesktopHeader = ({ dataRefer }: HeaderProps) => {
  const navigate = useNavigate();
  const [visibleRibbon] = useRibbon();
  return (
    <div
      className={cn(
        "container flex items-center justify-between",
        visibleRibbon ? "pt-4" : "pt-0"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-6 cursor-pointer">
        <div
          className="relative"
          onClick={() => navigate("/")}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/nodo-logo.png"
              alt="NODO AI Logo"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </motion.div>
        </div>
        <div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {pageRoutes.map((route) => (
              <Link
                key={route.label}
                to={route.path}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 bg-white/10 text-white`}
              >
                <Icon
                  name={route.icon}
                  className="h-4 w-4"
                  color="currentColor"
                />

                <span className="font-medium text-sm">{route.label}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Right side */}
      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ReferralTooltip dataRefer={dataRefer}>
            <Button
              variant="link"
              className="text-white flex items-center gap-2 text !no-underline hover:text-white/80"
              disabled={!dataRefer.referCode}
            >
              My Referral
            </Button>
          </ReferralTooltip>
          <Button
            variant="link"
            className="!no-underline hover:text-white/80"
            onClick={() => {
              window.open("https://docs.nodo.xyz", "_blank");
            }}
          >
            Read Docs
            <ArrowUpRight />
          </Button>
        </motion.div>
        <ConnectWalletButton />
      </div>
    </div>
  );
};

const MobileHeader = ({ dataRefer }: HeaderProps) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "link">("code");
  const [openModalRefer, setOpenModalRefer] = useState(false);
  const { isAuthenticated } = useWallet();

  return (
    <>
      <div className="container flex items-center justify-between px-4 py-2">
        {/* Left: Menu icon and logo */}
        <div className="flex items-center gap-3">
          {/* Menu icon from lucide-react */}
          <Button
            type="button"
            aria-label="Open menu"
            variant="ghost"
            className="rounded-lg bg-white/10 p-2 flex items-center justify-center w-10 h-10"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-7 h-7 text-white" />
          </Button>
          {/* Logo */}
          <div
            className="relative"
            onClick={() => navigate("/")}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="/nodo-logo.png"
                alt="NODO AI Logo"
                className="h-8 w-auto transition-transform duration-300"
              />
            </motion.div>
          </div>
        </div>
        {/* Right: Connect Wallet button */}
        <ConnectWalletButton />
      </div>
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        direction="top"
      >
        <DrawerContent
          fullWidth
          className="bg-black shadow-lg p-6 rounded-none"
        >
          <DrawerTitle className="sr" />
          <DrawerDescription className="sr" />
          <DrawerHeader className="py-2 absolute top-0 right-0 w-full">
            <div className="">
              <div className="flex items-center justify-between mb-4 ">
                <img
                  src="/nodo-logo.png"
                  alt="NODO AI Logo"
                  className="h-8 ml-2"
                />
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className=" text-white text-xl"
                  >
                    <X />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>
          <div className="mt-10">
            {/* Referral section */}
            {isAuthenticated && (
              <>
                <div className=" text-[#A6A6B0] font-sans text-base font-medium">
                  My Referral
                </div>
                <div className="bg-[#1A1B21] rounded-md mt-2">
                  <ReferralContent
                    dataRefer={dataRefer}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setOpenModalRefer={setOpenModalRefer}
                    openModalRefer={openModalRefer}
                  />
                </div>
              </>
            )}

            {/* Docs button */}
            <Button
              variant="secondary"
              className="w-full mt-3 bg-white/10"
              onClick={() => window.open("https://docs.nodo.xyz", "_blank")}
            >
              Read Docs <ArrowUpRight className="inline w-4 h-4 ml-1" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export function AppHeader() {
  const scrollbarWidth = useScrollbarWidth();
  const { walletDetails } = useWhitelistWallet();
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);
  const { isMobile } = useBreakpoint();
  const [visibleRibbon] = useRibbon();

  const handleReadMore = () => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/nodo-ai-vault-genesis-yield-campaign-phase-1",
      "_blank"
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full backdrop-blur-md  bg-transparent border-b border-white/10",
        visibleRibbon ? "md:pb-4" : "md:py-4 py-2"
      )}
    >
      <div className="bg-black">
        <Ribbon
          message={
            <span className="w-full flex items-center justify-center text-center whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="truncate max-w-[80vw] md:max-w-full">
                Up to 10,000 USDC + 2,000,000,000 XP Share Rewards. Read more
              </span>
              <ArrowRight className="inline ml-1 !h-4 !w-4 flex-shrink-0" />
            </span>
          }
          onClick={handleReadMore}
          className="text-white text-sm md:text-lg px-2 py-2 md:px-0 md:py-1 flex items-center md:justify-center  justify-start text-center w-full"
        />
      </div>
      {/* Main header content */}
      {isMobile ? (
        <MobileHeader dataRefer={dataRefer} />
      ) : (
        <DesktopHeader dataRefer={dataRefer} />
      )}
    </header>
  );
}
