import Web3Button from "@/components/ui/web3-button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import ClaimToken from "./claim-token";
import WithdrawForm from "./withdraw-form";
import WithdrawSkeleton from "./withdraw-skeleton";

import {
  useGetDepositVaults,
  useGetLpToken,
  useRefreshAssetsBalance,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import {
  useWithdrawVault,
  useWithdrawVaultConfig,
} from "@/hooks/use-withdraw-vault";
import BigNumber from "bignumber.js";
import { sleep, getImage } from "@/lib/utils";
import { CLOCK } from "@/config/vault-config";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import DataClaimType from "@/types/data-claim.types.d";

export default function WithdrawVaultSection({
  vault_id,
}: {
  vault_id: string;
}) {
  const [dataClaim, setDataClaim] = useState<DataClaimType>();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * HOOKS
   */
  const { openConnectWalletDialog, isConnected, address } = useWallet();
  const { refreshAllBalance: refreshBalance } = useRefreshAssetsBalance();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();
  const { data: vault, refetch: refetchVaultBasicDetails } =
    useVaultBasicDetails(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const lpData = useMemo(() => {
    const token1 = (vault as any).pool?.token_a;
    const token2 = (vault as any).pool?.token_b;
    const exchange = EXCHANGE_CODES_MAP[vault.exchange_id] || null;
    return {
      package_id: vault.metadata.package_id,
      vault_config_id: vault.metadata.vault_config_id,
      vault_id: vault.vault_id,
      clock: CLOCK,
      vault_name: vault.vault_name,

      lp_coin_type: vault.vault_lp_token,
      lp_symbol: lpToken?.display_name,
      lp_decimals: vault.vault_lp_token_decimals,
      lp_image: lpToken?.image_url,
      is_token_only: false,

      collateral_coin_type: vault.collateral_token,
      collateral_decimals: vault.collateral_token_decimals,

      token_coin_type: token1?.token_address,
      token_image: getImage(token1?.token_symbol),
      token_symbol: token1?.token_symbol,

      quote_coin_type: token2?.token_address,
      quote_image: getImage(token2?.token_symbol),
      quote_symbol: token2?.token_symbol,
      receive_tokens: [
        { ...token1, image: getImage(token1?.token_symbol) },
        { ...token2, image: getImage(token2?.token_symbol) },
      ],
      exchange,
      is_enable_dual_token: vault?.metadata?.is_enable_dual_token,
    };
  }, [vault, lpToken]);

  const balanceInputLpUsd = useMemo(() => {
    return new BigNumber(lpToken?.balance || "0")
      .multipliedBy(lpToken?.usd_price || "0")
      .toString();
  }, [lpToken?.balance, lpToken?.usd_price]);

  const tokens = useMemo(() => {
    const tmp = (vault as any)?.tokens || [];
    return tmp?.map((i) => {
      return {
        ...i,
        image: getImage(i?.token_symbol),
      };
    });
  }, [vault]);

  const { configVault } = useWithdrawVaultConfig(lpData);
  const { getLatestRequestClaim } = useWithdrawVault();

  /**
   * FUNCTION
   */

  const initDataClaim = async () => {
    try {
      // If we have a local claim object, flip to claimable when timeUnlock reached
      if (dataClaim) {
        if (!dataClaim.isClaim && Date.now() >= Number(dataClaim.timeUnlock)) {
          const updated = { ...dataClaim, isClaim: true } as DataClaimType;
          setDataClaim(updated);
          return updated;
        }
        return dataClaim;
      }
      // Fallback to API if no local claim is present
      const res = await getLatestRequestClaim(address, lpData, configVault);
      setDataClaim(res);
      return res;
    } catch (error) {
      setDataClaim(null);
    }
  };

  const onSuccessWithdraw = async (mockData?: DataClaimType) => {
    // Mock: set claimable data immediately and refresh
    setLoading(true);
    if (mockData) {
      setDataClaim(mockData);
    }
    refreshBalance();
    refetchDepositVaults();
    refetchVaultBasicDetails();
    setLoading(false);
  };

  const onSuccessClaim = async () => {
    // Mock: clear claim state and refresh without polling
    setLoading(true);
    setDataClaim(null);
    refreshBalance();
    refetchDepositVaults();
    refetchVaultBasicDetails();
    setLoading(false);
  };

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    const init = async () => {
      await initDataClaim();
      setReady(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, configVault]);

  useEffect(() => {
    if (dataClaim && dataClaim.isClaim === false && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        initDataClaim();
      }, 30000); // 30s
    }

    if ((!dataClaim || dataClaim?.isClaim === true) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataClaim]);

  /**
   * RENDER
   */
  return (
    <Spinner loading={loading}>
      <div>
        {!isConnected && (
          <div>
            <Web3Button
              onClick={openConnectWalletDialog}
              className="flex items-center justify-center w-full font-semibold text-lg py-3"
            >
              <span>Connect Wallet</span>
              <ArrowRight
                size={16}
                className="ml-2"
              />
            </Web3Button>
          </div>
        )}

        {!ready && <WithdrawSkeleton />}

        {isConnected && (
          <>
            {dataClaim && ready && (
              <ClaimToken
                balanceLp={"1000000"}
                rateLpUsd={lpToken?.usd_price || "0"}
                data={dataClaim}
                onSuccess={onSuccessClaim}
                reloadData={initDataClaim}
              />
            )}
            {!dataClaim && ready && (
              <WithdrawForm
                balanceLp={"1000000"}
                rateLpUsd={lpToken?.usd_price || "0"}
                lpData={lpData}
                tokens={tokens}
                lockDuration={vault?.metadata?.withdraw_interval || 3600}
                onSuccess={onSuccessWithdraw}
              />
            )}
          </>
        )}
      </div>
    </Spinner>
  );
}
