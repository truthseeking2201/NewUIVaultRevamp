import { useEffect } from "react";
import "@/styles/design-tokens.css";

import { PageContainer } from "@/components/layout/page-container";
import { VaultList } from "@/components/vault/list";
import { useWallet } from "@/hooks/use-wallet";
import { useNavigate, useSearchParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import HeroBanner from "@/components/dashboard/hero-banner-simple";

export default function NodoAIVaults() {
  const { openConnectWalletDialog } = useWallet();
  const { isMd } = useBreakpoint();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get("invite-ref");

  useEffect(() => {
    if (referralCode) {
      window.sessionStorage.setItem("ref-code", referralCode);
      navigate("/");
      openConnectWalletDialog();
    }
  }, [referralCode]);

  return (
    <>
      {!isMd && <HeroBanner />}
      <PageContainer className={`${isMd ? "py-8" : "py-6"}`}>
        {isMd && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <HeroBanner />
          </Suspense>
        )}

        <VaultList />
      </PageContainer>
    </>
  );
}
