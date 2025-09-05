/**
 * ReferralTooltip Component
 * Tooltip/popover component that displays referral code information and actions
 */

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ItemRow } from "./item-row";
import { MyReferralsDashboardModal } from "./my-referrals-dashboard-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightContained } from "@/assets/icons";

interface ReferralTooltipProps {
  dataRefer?: {
    referCode: string;
    referLinkCode: string;
    referTotal: number;
  };
  children: React.ReactNode;
}

export const ReferralContent = ({
  dataRefer,
  activeTab,
  setActiveTab,
  setOpenModalRefer,
  openModalRefer,
}: {
  dataRefer: ReferralTooltipProps["dataRefer"];
  activeTab: "code" | "link";
  setActiveTab: (tab: "code" | "link") => void;
  setOpenModalRefer: (open: boolean) => void;
  openModalRefer: boolean;
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-white mb-0">
            {dataRefer.referTotal}
          </p>
        </div>
        <div className="flex items-center">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "code" | "link")}
            // className="bg-black border rounded-lg"
          >
            <TabsList className="p-1 flex gap-1">
              <TabsTrigger value="code" className="w-[68px] h-[38px]">
                Code
              </TabsTrigger>
              <TabsTrigger value="link" className="w-[68px] h-[38px]">
                Link
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <ItemRow
        value={
          activeTab === "code" ? dataRefer.referCode : dataRefer.referLinkCode
        }
        isNew
      />

      <Button
        size="sm"
        className="font-semibold text-sm p-0 h-fit w-full hover:opacity-80"
        onClick={() => {
          setOpenModalRefer(true);
        }}
      >
        <span className="bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text">
          My Referral Dashboard
        </span>

        <ArrowRightContained className="!w-4 !h-4" />
      </Button>

      <MyReferralsDashboardModal
        isOpen={openModalRefer}
        onClose={() => {
          setOpenModalRefer(false);
        }}
      />
    </div>
  );
};

export default function ReferralTooltip({
  dataRefer,
  children,
}: ReferralTooltipProps) {
  const [activeTab, setActiveTab] = useState<"code" | "link">("code");
  const [isOpen, setIsOpen] = useState(false);
  const [openModalRefer, setOpenModalRefer] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1B21] text-white p-0" align="end">
        <ReferralContent
          dataRefer={dataRefer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setOpenModalRefer={setOpenModalRefer}
          openModalRefer={openModalRefer}
        />
      </PopoverContent>
    </Popover>
  );
}
