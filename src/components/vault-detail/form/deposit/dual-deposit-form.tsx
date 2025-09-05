import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import SuccessfulToast from "@/components/vault/deposit/successful-toast";
import {
  useGetLpToken,
  useGetVaultConfig,
  useRefreshAssetsBalance,
  useUserAssetsStore,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import useBreakpoint from "@/hooks/use-breakpoint";
import {
  useDepositDualVault,
  useEstimateDualDeposit,
} from "@/hooks/use-deposit-vault";
import { useToast } from "@/hooks/use-toast";
import { useTokenPrices } from "@/hooks/use-token-price";
import { DEV_BAL, getBalanceAmountForInput, isDevBalEnabled, toSafeNumber } from "@/lib/number";
import { cn, formatAmount } from "@/lib/utils";
import debounce from "lodash-es/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DepositDualInput from "./deposit-dual-input";
import DepositDualModal from "./deposit-dual-modal";
import ConditionRenderer from "@/components/shared/condition-renderer";
import DualDepositSkeleton from "./dual-deposit-skeleton";
import RiskDisclosuresPopup from "./risk-disclosure-popup";
import { useRiskDisclosure } from "@/hooks/use-risk-disclosure";

export type DualDepositSuccessData = {
  digest: string;
  ndlpReceived: number;
  actualInputAmountTokenA: number;
  actualInputAmountTokenB: number;
};

export type DualDepositForm = {
  token_a: {
    amount: string;
    address: string;
  };
  token_b: {
    amount: string;
    address: string;
  };
};

const DepositForm = ({ vault_id }: { vault_id: string }) => {
  const { openConnectWalletDialog, isConnected } = useWallet();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { assets } = useUserAssetsStore();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DualDepositSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: vault, refetch: refetchVaultBasicDetails } =
    useVaultBasicDetails(vault_id);

  const pool = vault?.pool;
  const inputtingToken = useRef<string>("");

  const { refetch: refetchVaultConfig } = useGetVaultConfig(vault_id);
  const [debounceAmountTokenA, setDebounceAmountTokenA] = useState<string>("0");
  const [debounceAmountTokenB, setDebounceAmountTokenB] = useState<string>("0");

  const { isMd } = useBreakpoint();
  const { toast, dismiss } = useToast();

  const { deposit } = useDepositDualVault(vault_id);
  const { isAuthenticated } = useWallet();

  const { visibleDisclaimer, setVisibleDisclaimer } = useRiskDisclosure();
  const [isOpenRiskDisclosure, setIsOpenRiskDisclosure] = useState(false);

  const paymentTokens = useMemo(() => {
    const dev = isDevBalEnabled();
    return [pool?.token_a, pool?.token_b]?.filter(Boolean)?.map((token) => {
      const asset = assets.find((a) => a.coin_type === token?.token_address);
      const rawBal = asset?.balance ?? "0";
      const safeBal = dev ? String(DEV_BAL) : String(toSafeNumber(rawBal, 0));
      return {
        token_id: token?.token_id,
        symbol: token?.token_symbol,
        decimals: token?.decimal ?? 6,
        balance: safeBal,
        token_address: token?.token_address,
        price_feed_id: token?.price_feed_id,
      };
    });
  }, [pool, assets]);

  const tokenIds = useMemo(() => {
    return paymentTokens?.map((token) => token?.token_id) || [];
  }, [paymentTokens]);

  const { data: tokenPrices } = useTokenPrices(tokenIds);

  const tokenA = useMemo(() => {
    const token = paymentTokens.find(
      (token) => token.token_address === pool?.token_a_address
    );
    return {
      ...token,
      usd_price: tokenPrices?.[token?.token_id] || 0,
    };
  }, [paymentTokens, pool, tokenPrices]);

  const tokenB = useMemo(() => {
    const token = paymentTokens.find(
      (token) => token.token_address === pool?.token_b_address
    );
    return {
      ...token,
      usd_price: tokenPrices?.[token?.token_id] || 0,
    };
  }, [paymentTokens, pool, tokenPrices]);

  const lpToken = useGetLpToken(vault?.vault_lp_token || "", vault_id);

  const methods = useForm({
    defaultValues: {
      token_a: {
        amount: "",
        address: pool?.token_a_address || "",
      },
      token_b: {
        amount: "",
        address: pool?.token_b_address || "",
      },
    },
    mode: "onChange",
  });

  const { watch, formState, resetField, reset } = methods;

  // Debounced effect for estimate deposit API call
  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      setDebounceAmountTokenA(formValue.token_a.amount || "0");
      setDebounceAmountTokenB(formValue.token_b.amount || "0");
    }, 500);
    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, tokenA?.token_address, tokenB?.token_address]);

  const { data: estimateDualDeposit, isLoading: isEstimateDualDepositLoading } =
    useEstimateDualDeposit(vault_id);

  useEffect(() => {
    if (isAuthenticated) {
      resetField("token_a.amount");
      resetField("token_b.amount");
    }
  }, [isAuthenticated, resetField]);

  const conversionRate = useMemo(() => {
    // todo: skip for now
    return 1;
  }, []);

  const ndlpAmount = useMemo(() => {
    const estimated_ndlp = estimateDualDeposit?.estimated_ndlp;
    const amount_a = estimateDualDeposit?.amount_a;
    const amount_b = estimateDualDeposit?.amount_b;
    if (!estimated_ndlp || !amount_a || !amount_b) return 0;
    if (inputtingToken.current === tokenA.token_address) {
      return (
        (Number(debounceAmountTokenA) * Number(estimated_ndlp)) /
        Number(amount_a)
      );
    } else if (inputtingToken.current === tokenB.token_address) {
      return (
        (Number(debounceAmountTokenB) * Number(estimated_ndlp)) /
        Number(amount_b)
      );
    }
    return 0;
  }, [
    estimateDualDeposit,
    debounceAmountTokenA,
    debounceAmountTokenB,
    tokenA,
    tokenB,
  ]);

  const onSubmit = (data: DualDepositForm) => {
    if (visibleDisclaimer) {
      setIsOpenRiskDisclosure(true);
    } else {
      setIsDepositModalOpen(true);
    }
  };

  const handleReadDisclaimer = () => {
    setVisibleDisclaimer();
    setIsDepositModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setLoading(false);
  };

  const handleDepositSuccessCallback = ({
    digest,
    ...rest
  }: DualDepositSuccessData) => {
    setDepositSuccessData({
      digest,
      actualInputAmountTokenA: getBalanceAmountForInput(
        rest?.actualInputAmountTokenA,
        tokenA.decimals,
        tokenA.decimals
      ),
      actualInputAmountTokenB: getBalanceAmountForInput(
        rest?.actualInputAmountTokenB,
        tokenB.decimals,
        tokenB.decimals
      ),
      ndlpReceived: rest?.ndlpReceived
        ? getBalanceAmountForInput(
            rest.ndlpReceived,
            vault?.vault_lp_token_decimals || 6,
            vault?.vault_lp_token_decimals || 6
          )
        : +ndlpAmount,
    });
    setLoading(false);
    setDepositStep(2);
    refreshAllBalance();
  };

  const handleSendRequestDeposit = async () => {
    // Skip wallet execution: jump straight to success modal
    setLoading(true);
    handleDepositSuccessCallback({
      digest: "0xMOCK",
      ndlpReceived: 0,
      actualInputAmountTokenA: 0,
      actualInputAmountTokenB: 0,
    });
  };

  const handleDone = () => {
    const message = `${formatAmount({
      amount: Number(depositSuccessData?.actualInputAmountTokenA),
      precision: tokenA?.decimals,
    })} ${tokenA?.symbol} and ${formatAmount({
      amount: Number(depositSuccessData?.actualInputAmountTokenB),
      precision: tokenB?.decimals,
    })} ${tokenB?.symbol} have been deposited to ${
      vault?.vault_name
    }. Check your wallet for Tx details`;

    reset();
    setIsDepositModalOpen(false);
    setDepositSuccessData(null);
    setDepositStep(1);
    setDebounceAmountTokenA("0");
    setDebounceAmountTokenB("0");
    refetchVaultBasicDetails();
    refetchVaultConfig();
    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={message}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  };

  const isDisabled = useMemo(() => {
    return Object.keys(formState.errors).length > 0;
  }, [formState.errors]);

  return (
    <FormProvider {...methods}>
      <ConditionRenderer
        when={!isEstimateDualDepositLoading}
        fallback={<DualDepositSkeleton />}
      >
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <DepositDualInput
            tokenA={tokenA}
            tokenB={tokenB}
            estimateDualDeposit={estimateDualDeposit}
            onTokenChange={(token) => {
              inputtingToken.current = token;
            }}
          />
          <div className="max-md:rounded-lg rounded-b-lg border border-white/0.20 p-4 mb-3 max-md:mt-3">
            <div className=" bg-black flex items-center justify-between pb-2">
              <LabelWithTooltip
                label="Est. Receive"
                labelClassName="text-gray-200 text-base font-bold md:text-base text-sm"
                tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
              />
            </div>
            <div className="flex md:flex-row md:justify-between text-gray-200 font-bold font-mono items-center mb-2 md:mb-3 justify-end flex-row-reverse">
              <DynamicFontText
                maxWidth={300}
                breakpoints={[
                  { minLength: 0, fontSize: isMd ? "text-3xl" : "text-2xl" },
                  { minLength: 15, fontSize: isMd ? "text-2xl" : "text-xl" },
                  { minLength: 20, fontSize: isMd ? "text-xl" : "text-lg" },
                ]}
                defaultFontSize={isMd ? "text-2xl" : "text-xl"}
              >
                {ndlpAmount
                  ? ` ${formatAmount({
                      amount: ndlpAmount,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })} `
                  : "--"}
              </DynamicFontText>
              <div
                className={
                  "flex items-center gap-2 font-bold text-sm md:text-lg"
                }
              >
                <img
                  src="/coins/ndlp.png"
                  alt="NDLP"
                  className="w-6 h-6 max-md:mr-2"
                />
                {isMd && lpToken?.display_name}
              </div>
            </div>
            <hr className="w-full border-t border-white/15" />
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center md:justify-between">
                <div
                  className={cn(
                    "font-sans text-sm text-white/80 md:text-sm max-md:mb-1.5 text-13px"
                  )}
                >
                  Network
                </div>
                <div className="text-sm font-mono text-white inline-flex items-center md:text-sm text-13px">
                  <img
                    src="/chains/sui.png"
                    alt="SUI"
                    className="w-6 h-6 mr-2"
                  />
                  SUI
                </div>
              </div>
            </div>
          </div>

          <Web3Button
            className="w-full rounded-lg py-3 font-semibold text-lg"
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!isConnected) {
                openConnectWalletDialog();
              } else {
                methods.handleSubmit(onSubmit)();
              }
            }}
          >
            Deposit
          </Web3Button>
        </form>
      </ConditionRenderer>

      <RiskDisclosuresPopup
        isOpen={isOpenRiskDisclosure}
        setIsOpen={setIsOpenRiskDisclosure}
        setVisibleDisclaimer={handleReadDisclaimer}
      />
      <DepositDualModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        ndlpAmount={ndlpAmount}
        depositSuccessData={depositSuccessData}
        loading={loading}
        tokenA={{
          amount: debounceAmountTokenA,
          decimals: tokenA?.decimals || 6,
          symbol: tokenA?.symbol || "",
        }}
        tokenB={{
          amount: debounceAmountTokenB,
          decimals: tokenB?.decimals || 6,
          symbol: tokenB?.symbol || "",
        }}
        vault={vault}
      />
    </FormProvider>
  );
};

export default DepositForm;
