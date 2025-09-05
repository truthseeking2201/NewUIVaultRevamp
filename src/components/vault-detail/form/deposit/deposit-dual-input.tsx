import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import { cn, formatAmount } from "@/lib/utils";
import {
  DepositToken,
  EstimateDualDepositToken,
} from "@/types/deposit-token.types";
import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DualDepositForm } from "./dual-deposit-form";
import { TriangleAlert } from "lucide-react";
import useBreakpoint from "@/hooks/use-breakpoint";
import { validateDepositBalance } from "./helpers";
import { SUI_CONFIG } from "@/config";

type DepositInputProps = {
  tokenA: DepositToken;
  tokenB: DepositToken;
  estimateDualDeposit: EstimateDualDepositToken;
  onTokenChange: (token: string) => void;
};

const TEXT_ERROR_CLASS = "text-[#FF8077]";

const calculateTargetAmount = (
  sourceAmount: string,
  estimateDualDeposit: EstimateDualDepositToken,
  coinType: "token_a" | "token_b",
  decimals: number,
  minTargetAmount: number
) => {
  const { amount_a, amount_b } = estimateDualDeposit;
  if (coinType === "token_a") {
    const result = new BigNumber(
      (Number(sourceAmount) * Number(amount_a)) / Number(amount_b)
    );

    if (result.lt(minTargetAmount)) {
      return "0";
    }

    return result.toFixed(decimals);
  } else if (coinType === "token_b") {
    const result = new BigNumber(
      (Number(sourceAmount) * Number(amount_b)) / Number(amount_a)
    );
    if (result.lt(minTargetAmount)) {
      return "0";
    }

    return result.toFixed(decimals);
  }
  return 0;
};

const DepositDualInput = ({
  tokenA,
  tokenB,
  estimateDualDeposit,
  onTokenChange,
}: DepositInputProps) => {
  const { watch, control, formState, setValue } =
    useFormContext<DualDepositForm>();
  const formTokenA = watch("token_a");
  const formTokenB = watch("token_b");
  const { isMd } = useBreakpoint();
  const errors = formState.errors;
  const hasError = errors?.token_a?.amount || errors?.token_b?.amount;
  const tokenAError = errors?.token_a?.amount;
  const tokenBError = errors?.token_b?.amount;
  const isBothNotEnoughBalance =
    tokenAError?.type === "max" && tokenBError?.type === "max";

  const tokenAUsd = useMemo(() => {
    return new BigNumber(formTokenA?.amount || "0")
      .multipliedBy(tokenA.usd_price || 0)
      .toNumber();
  }, [tokenA, formTokenA?.amount]);

  const tokenBUsd = useMemo(() => {
    return new BigNumber(formTokenB?.amount || "0")
      .multipliedBy(tokenB.usd_price || 0)
      .toNumber();
  }, [tokenB, formTokenB?.amount]);

  const minDepositAmountA = new BigNumber(1)
    .div(10 ** tokenA?.decimals)
    .toNumber();

  const minDepositAmountB = new BigNumber(1)
    .div(10 ** tokenB?.decimals)
    .toNumber();

  return (
    <div className={cn(isMd && "deposit_input_v2_wrapper rounded-t-lg")}>
      <Controller
        name="token_a.amount"
        control={control}
        rules={{
          required: {
            value: true,
            message: `Please enter ${tokenA?.symbol} amount.`,
          },
          pattern: {
            value: /^\d*\.?\d*$/,
            message: `Please enter a valid ${tokenA?.symbol} amount`,
          },
          min: {
            value: minDepositAmountA,
            message: `Minimum deposit is of ${
              tokenA?.symbol
            } ${minDepositAmountA.toFixed(tokenA?.decimals)}`,
          },
          validate: (value) => validateDepositBalance(value, tokenA),
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormattedNumberInput
            value={value ? `${value}` : ""}
            amountAvailable={`${tokenA?.balance}`}
            maxDecimals={tokenA?.decimals}
            onChange={(...args) => {
              const [value] = args;
              const targetAmount = calculateTargetAmount(
                value,
                estimateDualDeposit,
                "token_b",
                tokenB.decimals,
                minDepositAmountB
              );
              if (targetAmount) {
                setValue("token_b.amount", targetAmount.toString(), {
                  shouldValidate: true,
                });
              }
              onChange(...args);
              onTokenChange(tokenA.token_address);
            }}
            onBlur={onBlur}
            maxBalanceAllowed={
              tokenA.token_address === SUI_CONFIG.coinType
                ? new BigNumber(tokenA?.balance)
                    .minus(SUI_CONFIG.gas_fee)
                    .abs()
                    .toString()
                : tokenA?.balance
            }
            hideDefaultWrapper={isMd}
            inputClassName={tokenAError ? TEXT_ERROR_CLASS : ""}
            label={isMd ? "" : "Deposit Amount"}
            className={cn(!isMd && hasError ? "rounded-t-lg" : "rounded-lg")}
            balanceInput={
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm font-medium font-sans">
                  {tokenA
                    ? formatAmount({
                        amount: tokenA.balance,
                        precision: tokenA.decimals,
                      })
                    : "--"}{" "}
                  {tokenA?.symbol}
                </span>
              </div>
            }
            balanceInputUsd={
              <span className="text-white/50 text-sm font-medium font-sans">
                {tokenA
                  ? formatAmount({
                      amount: tokenAUsd,
                      precision: 2,
                      minimumDisplay: 0.01,
                      sign: "$",
                    })
                  : "$--"}{" "}
              </span>
            }
            rightInput={
              <div className="flex items-center">
                <img
                  src={`/coins/${tokenA.symbol?.toLowerCase()}.png`}
                  alt={tokenA.symbol}
                  className="md:w-6 md:h-6 mr-2 w-5 h-5"
                />
                <span className="font-mono text-sm md:text-lg font-bold text-gray-200">
                  {tokenA.symbol}
                </span>
              </div>
            }
          />
        )}
      />
      {!isBothNotEnoughBalance && (tokenAError || tokenBError) && (
        <div className="flex flex-row items-center bg-red-error/20 gap-2 py-2 px-4 max-md:mt-0">
          <TriangleAlert className="w-4 h-4 text-[#FF8077]" />
          <span className="text-[#FF8077] text-xs font-medium font-sans">
            {tokenAError?.message || tokenBError?.message}
          </span>
        </div>
      )}
      {!tokenAError && !isBothNotEnoughBalance && !tokenBError && isMd && (
        <div className="px-4">
          <div className="bg-white/20 h-[1px] w-full" />
        </div>
      )}
      {isBothNotEnoughBalance && (
        <div className="flex flex-row items-center bg-red-error/20 gap-2 py-2 px-4 max-md:mt-0">
          <TriangleAlert className="w-4 h-4 text-[#FF8077]" />
          <span className="text-[#FF8077] text-xs font-medium font-sans">
            Not enough {tokenA?.symbol} & {tokenB?.symbol} balance. Try smaller
            amount
          </span>
        </div>
      )}
      <div className="max-md:mb-2" />
      <Controller
        name="token_b.amount"
        control={control}
        rules={{
          required: {
            value: true,
            message: `Please enter ${tokenB?.symbol} amount.`,
          },
          pattern: {
            value: /^\d*\.?\d*$/,
            message: `Please enter a valid ${tokenB?.symbol} amount`,
          },
          min: {
            value: minDepositAmountB,
            message: `Minimum deposit is of ${
              tokenB?.symbol
            } ${minDepositAmountB.toFixed(tokenB?.decimals)}`,
          },
          validate: (value) => validateDepositBalance(value, tokenB),
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormattedNumberInput
            value={value ? `${value}` : ""}
            amountAvailable={`${tokenB?.balance}`}
            maxDecimals={tokenB?.decimals}
            className={cn(!isMd && "rounded-lg")}
            label={isMd ? "" : "Deposit Amount"}
            onChange={(...args) => {
              const [value] = args;
              const targetAmount = calculateTargetAmount(
                value,
                estimateDualDeposit,
                "token_a",
                tokenA.decimals,
                minDepositAmountA
              );
              if (targetAmount) {
                setValue("token_a.amount", targetAmount.toString(), {
                  shouldValidate: true,
                });
              }
              onChange(...args);
              onTokenChange(tokenB.token_address);
            }}
            onBlur={onBlur}
            maxBalanceAllowed={
              tokenB.token_address === SUI_CONFIG.coinType
                ? new BigNumber(tokenB?.balance)
                    .minus(SUI_CONFIG.gas_fee)
                    .abs()
                    .toString()
                : tokenB?.balance
            }
            hideDefaultWrapper={isMd}
            inputClassName={tokenBError ? "text-[#FF8077]" : ""}
            balanceInput={
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm font-medium font-sans">
                  {tokenB
                    ? formatAmount({
                        amount: tokenB.balance,
                        precision: tokenB.decimals,
                      })
                    : "--"}{" "}
                  {tokenB?.symbol}
                </span>
              </div>
            }
            balanceInputUsd={
              <span className="text-white/50 text-sm font-medium font-sans">
                {tokenB
                  ? formatAmount({
                      amount: tokenBUsd,
                      precision: 2,
                      minimumDisplay: 0.01,
                      sign: "$",
                    })
                  : "$--"}{" "}
              </span>
            }
            rightInput={
              <div className="flex items-center">
                <img
                  src={`/coins/${tokenB.symbol?.toLowerCase()}.png`}
                  alt={tokenB.symbol}
                  className="md:w-6 md:h-6 mr-2 w-5 h-5"
                />
                <span className="font-mono text-sm md:text-lg font-bold text-gray-200">
                  {tokenB.symbol}
                </span>
              </div>
            }
          />
        )}
      />
    </div>
  );
};

export default DepositDualInput;
