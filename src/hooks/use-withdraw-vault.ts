import { Buffer } from "buffer";
import React, { useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "./use-wallet";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import {
  useGetVaultConfig,
  useEstimateWithdraw,
  useEstimateWithdrawDual,
} from "./use-vault";
import { Transaction } from "@mysten/sui/transactions";
import { useMergeCoins } from "./use-merge-coins";
import { RATE_DENOMINATOR, CLOCK } from "@/config/vault-config";
import {
  getDecimalAmount,
  getBalanceAmount,
  showFormatNumber,
} from "@/lib/number";
import { sleep, getImage } from "@/lib/utils";
import LpType, { TokenType } from "@/types/lp.type";
import DataClaimType from "@/types/data-claim.types.d";
import BigNumber from "bignumber.js";
import {
  executionProfitData,
  getWithdrawalRequestsMultiTokens,
  getVaultBasicDetails,
} from "@/apis/vault";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { IconCheckSuccess } from "@/components/ui/icon-check-success";
import { IconErrorToast } from "@/components/ui/icon-error-toast";

const successIcon: React.ReactNode = React.createElement(IconCheckSuccess, {
  size: 14,
  className: "h-6 w-6",
});
const errorIcon: React.ReactNode = React.createElement(IconErrorToast);

export const useWithdrawVault = () => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();
  const { toast } = useToast();
  const { mergeCoins } = useMergeCoins();

  /**
   *
   * @param senderAddress
   * @param configLp
   * @param configVault
   * @returns
   */
  const getRequestClaim = async (
    senderAddress: string,
    configLp: LpType,
    configVault: any
  ): Promise<DataClaimType[]> => {
    try {
      if (!configVault?.id_pending_redeems || !senderAddress) return null;
      const data: any = await suiClient.getDynamicFieldObject({
        parentId: configVault?.id_pending_redeems,
        name: {
          type: "address",
          value: senderAddress,
        },
      });

      const values = data?.data?.content?.fields?.value || [];
      if (!values?.length) return [];
      let dataRequest: any = null;

      for (let index = 0; index < 10; index++) {
        dataRequest = await getWithdrawalRequestsMultiTokens({
          wallet_address: senderAddress,
          vault_id: configLp.vault_id,
        });
        if (dataRequest.length) {
          break;
        }
        await sleep(2000);
      }

      return dataRequest?.map((val) => {
        const tokenWithdraw = {
          token_symbol: configLp.lp_symbol,
          token_address: configLp.lp_coin_type,
          decimal: configLp.lp_decimals,
          image: configLp.lp_image,
        };
        const withdrawAmount = getBalanceAmount(
          val?.withdrawal_ndlp_amount || 0,
          tokenWithdraw.decimal
        )?.toNumber();
        let receive_amounts = val?.receive_amounts;
        if (receive_amounts?.length == 1 && Number(receive_amounts[0]) == 0) {
          // for old request
          receive_amounts = [val.receive_amount];
        }
        const tokenReceives = val?.receive_tokens?.map((token, idx) => {
          return {
            ...token,
            image: getImage(token.token_symbol),
            amount: getBalanceAmount(
              receive_amounts[idx] || 0,
              token?.decimal
            ).toNumber(),
          };
        });
        const conversionRate = {
          from_symbol: tokenWithdraw.token_symbol,
          to_symbol: tokenReceives[0].to_symbol,
          rate: new BigNumber(tokenReceives[0].amount)
            .dividedBy(withdrawAmount)
            .toNumber(),
        };

        return {
          timeUnlock: Number(val?.countdown || 0),
          isClaim: val.is_ready,
          tokenWithdraw: { ...tokenWithdraw, amount: withdrawAmount },
          tokenReceives: tokenReceives,
          conversionRate: conversionRate,
          configLp: configLp,
        };
      });
    } catch (error) {
      console.error("Error withdrawal request:", error);
      return [];
    }
  };

  /**
   *
   * @param senderAddress
   * @param configLp
   * @param configVault
   * @returns
   */
  const getLatestRequestClaim = async (
    senderAddress: string,
    configLp: LpType,
    configVault: any
  ): Promise<DataClaimType> => {
    const res = await getRequestClaim(senderAddress, configLp, configVault);
    if (!res || !res?.length) {
      return null;
    }
    const req_availabe = res?.filter((el) => el.isClaim);
    if (req_availabe?.length) return req_availabe[0];

    return res[0];
  };

  /**
   *
   * @param amountLp
   * @param fee
   * @param configLp
   * @returns
   */
  const withdraw = async (
    amountLp: number,
    configLp: LpType,
    tokenReceives: TokenType[]
  ) => {
    try {
      // Mock mode: skip wallet execution and return success immediately
      if (!address) {
        throw new Error("No account connected");
      }
      if (!tokenReceives || !tokenReceives?.length) {
        throw new Error("No payout token selected");
      }
      return { digest: "0xMOCK" } as any;
    } catch (error) {
      console.error("Error in withdraw:", error);
      toast({
        title: "Withdraw failed",
        description: (error as any)?.message || String(error),
        variant: "error",
        duration: 5000,
        icon: errorIcon,
      });
      return null;
    }
  };

  /**
   *
   * @param configLp
   * @returns
   */
  const redeem = async (configLp: LpType) => {
    try {
      if (!address) {
        throw new Error("No account connected");
      }
      // Mock mode: immediate success toast
      toast({
        title: "Withdraw successful!",
        description: `Your assets have been sent to your wallet. Check your wallet for Tx details`,
        variant: "success",
        duration: 5000,
        hideClose: true,
        icon: successIcon,
      });
      return { digest: "0xMOCK" } as any;
    } catch (error) {
      console.error("Error in redeem:", error);
      toast({
        title: "Claim failed",
        description: (error as any)?.message || String(error),
        variant: "error",
        duration: 5000,
        icon: errorIcon,
      });
      return null;
    }
  };

  const redeemWithVaultId = async (vault_id: string) => {
    try {
      const response = await getVaultBasicDetails(vault_id, "");
      const vault = response as unknown as BasicVaultDetailsType;

      const lpData = {
        package_id: vault.metadata.package_id,
        vault_config_id: vault.metadata.vault_config_id,
        vault_id: vault.vault_id,
        lp_coin_type: vault.vault_lp_token,
        lp_decimals: vault.vault_lp_token_decimals,
        collateral_coin_type: vault.collateral_token,
        clock: CLOCK,
      };
      return redeem(lpData);
    } catch (error) {
      toast({
        title: "Claim failed",
        description: error?.message || error,
        variant: "error",
        duration: 5000,
        icon: errorIcon,
      });
      return null;
    }
  };

  return {
    getRequestClaim,
    getLatestRequestClaim,
    withdraw,
    redeem,
    redeemWithVaultId,
  };
};

export const useWithdrawVaultConfig = (configLp: LpType) => {
  const { vaultConfig, refetch } = useGetVaultConfig(configLp?.vault_id);
  const configVault = useMemo(() => {
    const fields = vaultConfig;
    const rate = fields?.rate || "0";
    const lpToTokenRateRaw = getDecimalAmount(1, configLp.lp_decimals)
      .times(rate)
      .dividedBy(RATE_DENOMINATOR);
    const lpToTokenRate =
      getBalanceAmount(
        lpToTokenRateRaw,
        configLp.collateral_decimals
      )?.toNumber() || 0;

    return {
      withdraw: fields?.withdraw?.fields || {
        fee_bps: "0",
        min: "0",
        total_fee: "0",
      },
      lock_duration_ms: fields?.lock_duration_ms || "0",
      available_liquidity: fields?.available_liquidity || "0",
      id_pending_redeems: fields?.pending_redeems?.fields?.id?.id || "",
      rate,
      lpToTokenRate,
    };
  }, [vaultConfig, configLp]);

  return {
    configVault,
    refetch,
  };
};

export const useWithdrawEtsAmountReceive = (
  lpData: LpType,
  amountLp: number,
  tokenReceives: TokenType[]
) => {
  const min_amount_receive = 0.000001;

  const tokenReceive = useMemo(() => {
    return tokenReceives?.length ? tokenReceives[0] : null;
  }, [tokenReceives]);

  const isDual = useMemo(() => {
    return tokenReceives.length > 1;
  }, [tokenReceives]);

  const {
    data: dataEst,
    refetch: refetchEstimateWithdraw,
    error: errorEstimateWithdraw,
    isLoading: isLoadingEstimateWithdraw,
  } = useEstimateWithdraw(lpData?.vault_id, {
    ndlp_amount: getDecimalAmount(1, lpData.lp_decimals).toString(),
    payout_token:
      !isDual && tokenReceive?.token_address
        ? encodeURIComponent(tokenReceive?.token_address)
        : null,
  });

  const {
    data: dataEstDual,
    refetch: refetchEstimateWithdrawDual,
    error: errorEstimateWithdrawDual,
    isLoading: isLoadingEstimateWithdrawDual,
  } = useEstimateWithdrawDual(
    lpData?.vault_id,
    getDecimalAmount(amountLp || 1, lpData.lp_decimals).toString(),
    !!amountLp && isDual
  );

  const rate_lp_per_token_receive = useMemo(() => {
    return dataEst?.ndlp_per_payout_rate || 0;
  }, [dataEst]);

  const amount_receive = useMemo(() => {
    return BigNumber(amountLp).times(rate_lp_per_token_receive).toNumber();
  }, [amountLp, rate_lp_per_token_receive]);

  const receives = useMemo<TokenType[]>(() => {
    if (!isDual) {
      const _amount = BigNumber(amountLp)
        .times(rate_lp_per_token_receive)
        .toNumber();
      return tokenReceives.map((token) => {
        return { ...token, amount: _amount };
      });
    } else {
      // dual
      return tokenReceives.map((token, idx) => {
        const _amount =
          idx === 0 ? dataEstDual?.amount_a : dataEstDual?.amount_b;
        return {
          ...token,
          amount: getBalanceAmount(_amount, token.decimal)?.toNumber(),
        };
      });
    }
  }, [amountLp, tokenReceives, isDual, dataEstDual, rate_lp_per_token_receive]);

  const errorEstimate = useMemo(() => {
    if (errorEstimateWithdraw && !isDual) {
      return typeof errorEstimateWithdraw === "string"
        ? errorEstimateWithdraw
        : errorEstimateWithdraw?.message;
    }
    if (errorEstimateWithdrawDual && isDual) {
      return typeof errorEstimateWithdrawDual === "string"
        ? errorEstimateWithdrawDual
        : errorEstimateWithdrawDual?.message;
    }
    if (isLoadingEstimateWithdraw && !isDual) return "";
    if (isLoadingEstimateWithdrawDual && isDual) return "";

    for (let index = 0; index < receives.length; index++) {
      const amount = receives[index]?.amount;
      if (Number(amountLp) && BigNumber(amount).lt(min_amount_receive)) {
        return "Amount received is too small.";
      }
    }

    return "";
  }, [
    amountLp,
    isDual,
    receives,
    errorEstimateWithdraw,
    isLoadingEstimateWithdraw,
    errorEstimateWithdrawDual,
    isLoadingEstimateWithdrawDual,
  ]);

  const conversion_rate = useMemo(() => {
    return {
      from_symbol: lpData?.lp_symbol,
      to_symbol: tokenReceive?.token_symbol,
      amount: rate_lp_per_token_receive,
    };
  }, [lpData, tokenReceive, rate_lp_per_token_receive]);

  return {
    receives,
    amount: amountLp,
    conversion_rate: conversion_rate,
    errorEstimateWithdraw: errorEstimate,
    isLoadingEst: isLoadingEstimateWithdraw || isLoadingEstimateWithdrawDual,
    refreshRate: refetchEstimateWithdraw,
  };
};

export const useHasWithdrawRequest = (
  vaultId: string,
  walletAddress: string
) => {
  return useQuery<boolean, Error>({
    queryKey: ["vault-has-withdrawing", vaultId, walletAddress],
    queryFn: async () => {
      const dataRequest: any = await getWithdrawalRequestsMultiTokens({
        wallet_address: walletAddress,
        vault_id: vaultId,
      });
      return !!dataRequest?.length;
    },
    enabled: !!vaultId && !!walletAddress,
    refetchOnWindowFocus: true,
  });
};
