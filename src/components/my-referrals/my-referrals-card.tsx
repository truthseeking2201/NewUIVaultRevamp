import { useState, useEffect, useMemo } from "react";
import { ItemRow } from "./item-row";
import { MyReferralsDashboardModal } from "./my-referrals-dashboard-modal";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";
import { useWallet } from "@/hooks";
interface MyReferralsCardProps {
  className?: string;
}

export function MyReferralsCard({ className = "" }: MyReferralsCardProps) {
  const [openModalRefer, setOpenModalRefer] = useState(false);
  const { isAuthenticated } = useWallet();

  /**
   * HOOKS
   */
  const { walletDetails, refetch } = useWhitelistWallet();
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isAuthenticated && !walletDetails?.invite_code?.code) {
        refetch();
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [isAuthenticated, walletDetails, refetch]);

  /**
   * RENDER
   */
  return (
    <>
      {dataRefer?.referCode && (
        <div
          className={`bg-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 font-sans text-left flex flex-col gap-4 ${className}`}
        >
          <h3 className="text-white text-xl font-bold mb-0">My Referrals</h3>
          <ItemRow title="Your Referral Code" value={dataRefer.referCode} />
          <ItemRow title="Your Referral Link" value={dataRefer.referLinkCode} />
          <div>
            <div className="text-075 text-sm mb-2">Total Referrals</div>
            <div className="text-white text-2xl font-bold font-mono">
              {dataRefer.referTotal}
            </div>
          </div>

          <Button
            size="lg"
            className="font-semibold text-base p-0 h-fit"
            onClick={() => {
              setOpenModalRefer(true);
            }}
          >
            <span className="gradient-3rd-underline hover:opacity-80">
              My Referral Dashboard
            </span>

            <ExternalLink
              size={40}
              strokeWidth={2}
              className="text-[#F2BB89]"
            />
          </Button>

          <MyReferralsDashboardModal
            isOpen={openModalRefer}
            onClose={() => {
              setOpenModalRefer(false);
            }}
          />
        </div>
      )}
    </>
  );
}
