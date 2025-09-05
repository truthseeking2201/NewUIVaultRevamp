import suiWallet from "@/assets/images/sui-wallet.png";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Button } from "@/components/ui/button";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { RowItem } from "@/components/ui/row-item";
import { useToast } from "@/components/ui/use-toast";
import DepositModal from "@/components/vault/deposit/deposit-modal";
import {
  useCurrentDepositVault,
  useGetDepositVaults,
  useGetVaultConfig,
  useWhiteListModalStore,
} from "@/hooks";
import {
  useCalculateNDLPReturn,
  useCollateralLPRate,
  useDepositVault,
} from "@/hooks/use-deposit-vault";
import {
  useGetCoinBalance,
  useGetVaultTokenPair,
  useMyAssets,
} from "@/hooks/use-my-assets";
import { useWallet } from "@/hooks/use-wallet";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";
import { formatNumber } from "@/lib/number";
import { formatAmount } from "@/lib/utils";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import SuccessfulToast from "./successful-toast";

type DepositSuccessData = {
  amount: number;
  apr: number;
  ndlp: number;
  conversionRate: number;
};

const MIN_DEPOSIT_AMOUNT = 0.01;

export default function DepositVaultSection() {
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState<string>("");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<number>(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DepositSuccessData>(null);

  const depositVault = useCurrentDepositVault();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();
  const { refetch: refetchNdlpBalance } = useGetCoinBalance(
    depositVault.vault_lp_token,
    depositVault.vault_lp_token_decimals
  );
  const apr = depositVault?.apr;
  const { openConnectWalletDialog, isAuthenticated } = useWallet();
  const { refreshBalance } = useMyAssets();
  const { deposit } = useDepositVault(depositVault.vault_id);
  const { toast, dismiss } = useToast();

  const { isWhitelisted } = useWhitelistWallet();

  const { collateralToken } = useGetVaultTokenPair();

  const collateralTokenName = collateralToken?.display_name || "";

  const { setIsOpen: openWhiteListModal } = useWhiteListModalStore();

  const ndlpAmountWillGet = useCalculateNDLPReturn(
    Number(depositAmount),
    depositVault.collateral_token_decimals,
    depositVault.vault_lp_token_decimals,
    depositVault.vault_id
  );

  const { vaultConfig } = useGetVaultConfig(depositVault.vault_id);
  const conversionRate = useCollateralLPRate(false, vaultConfig);

  const handleValidateDepositAmount = (value: string) => {
    if (!value) {
      setError("Please enter an amount.");
      return;
    }

    if (value && Number(value) < MIN_DEPOSIT_AMOUNT) {
      setError(
        `Minimum amount is ${MIN_DEPOSIT_AMOUNT} ${collateralToken?.display_name}.`
      );
      return;
    }

    if (value && Number(value) > Number(collateralToken?.balance)) {
      setError("Not enough balance to deposit. Please top-up your wallet.");
      return;
    }

    setError("");
  };

  const handleMaxAmount = () => {
    handleValidateDepositAmount(collateralToken?.balance.toString() || "0");
    setDepositAmount(collateralToken?.balance.toString() || "0");
  };

  const handleConnectWallet = () => {
    openConnectWalletDialog();
  };

  const handleDeposit = () => {
    if (!isWhitelisted) {
      openWhiteListModal(true);
      return;
    }

    if (isAuthenticated) {
      // TODO: Handle deposit
      setIsDepositModalOpen(true);
    } else {
      handleConnectWallet();
    }
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
  };

  const handleSendRequestDeposit = async () => {
    // Skip wallet execution: jump straight to success modal
    setLoading(true);
    handleDepositSuccessCallback({
      amount: Number(depositAmount),
      apr: apr,
      ndlp: +ndlpAmountWillGet || 0,
      conversionRate: conversionRate,
      digest: "0xMOCK",
    });
  };

  const handleDepositSuccessCallback = (data) => {
    setDepositSuccessData(data);
    refreshBalance();
    setLoading(false);
    setDepositStep(2);
    refetchDepositVaults();
    refetchNdlpBalance();
  };

  const handleDone = () => {
    setDepositSuccessData(null);
    setIsDepositModalOpen(false);
    setDepositStep(1);
    setDepositAmount("");
    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={`${formatAmount({
            amount: Number(depositAmount),
          })} ${collateralTokenName} deposited — ${formatAmount({
            amount: +ndlpAmountWillGet || 0,
            precision: 6,
          })} NDLP minted to your account. Check your wallet for Tx details`}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  };

  const disabledDeposit = useMemo(() => {
    if (!isAuthenticated) return false;
    return !!error || !depositAmount;
  }, [isAuthenticated, error, depositAmount]);

  const poolName = depositVault.pool.pool_name;
  const token1 = poolName.split("-")[0];
  const token2 = poolName.split("-")[1];

  return (
    <div className="p-6 bg-black rounded-b-2xl rounded-tr-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 ml-6 mb-5">
          <div className="relative flex">
            <img
              src={`/coins/${token1?.toLowerCase()}.png`}
              alt="deep"
              className=" absolute right-[18px] z-0"
            />
            <img
              src={`/coins/${token2?.toLowerCase()}.png`}
              alt="deep"
              className="w-6 h-6 z-10"
            />
          </div>

          <span className="font-sans text-white font-bold text-xl">
            {depositVault?.pool?.pool_name}
          </span>
        </div>
        <div className="flex justify-between">
          <div className="font-body text-075 !font-medium">
            Amount ({collateralTokenName})
          </div>
          <div className="font-body text-075">
            Balance:{" "}
            <span className="font-mono text-text-primary">
              {isAuthenticated ? `${formatNumber(1000000)} ${collateralTokenName}` : "--"}
            </span>
          </div>
        </div>
        <FormattedNumberInput
          value={depositAmount}
          onChange={setDepositAmount}
          onValidate={handleValidateDepositAmount}
          onMaxAmount={handleMaxAmount}
          onBlur={handleValidateDepositAmount}
          placeholder="0.00"
          className="input-vault w-full font-heading-lg"
        />
        {error && (
          <div className="text-red-error text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
      <div className="mb-6 p-4 border border-white/15 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-200 font-medium">You will get</div>
          <div className="flex items-center">
            <img src="/coins/ndlp.png" alt="NDLP" className="w-6 h-6 mr-1" />
            <span className="font-mono font-bold text-lg">
              {formatAmount({ amount: +ndlpAmountWillGet || 0, precision: 6 })}{" "}
              NDLP
            </span>
          </div>
        </div>
        <hr className="w-full border-t border-white/15" />
        <RowItem label="Conversion Rate" className="mt-3">
          {conversionRate
            ? `1 ${collateralTokenName} = ${formatAmount({
                amount: conversionRate,
                precision: 6,
              })} NDLP`
            : "Unable to fetch conversion rate. Please try again later."}
        </RowItem>

        <RowItem label="Network" className="mt-3">
          <div className="flex items-center">
            <img src={suiWallet} className="w-5 h-5 mr-2" />
            <span className="font-mono">SUI</span>
          </div>
        </RowItem>
      </div>

      <ConditionRenderer
        when={isAuthenticated}
        fallback={
          <Button
            variant="primary"
            size="xl"
            onClick={handleConnectWallet}
            className="w-full font-semibold text-lg"
          >
            Connect Wallet
            <ArrowRight size={16} className="ml-2" />
          </Button>
        }
      >
        <Button
          variant="primary"
          size="xl"
          onClick={handleDeposit}
          disabled={isWhitelisted ? disabledDeposit : false}
          className="w-full font-semibold text-lg"
        >
          Deposit
        </Button>
      </ConditionRenderer>

      <DepositModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        confirmData={{
          amount: Number(depositAmount),
          apr,
          ndlp: Number(ndlpAmountWillGet),
          conversionRate: conversionRate,
        }}
        depositSuccessData={depositSuccessData}
        loading={loading}
        collateralTokenName={collateralTokenName}
      />
    </div>
  );
}
