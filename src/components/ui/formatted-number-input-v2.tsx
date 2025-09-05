import { ChangeEvent, useCallback } from "react";
import { cn } from "@/lib/utils";
import iconWallet from "@/assets/icons/wallet.svg";
import useBreakpoint from "@/hooks/use-breakpoint";
import BigNumber from "bignumber.js";

const QUICK_AMOUNTS = [
  {
    label: "HALF",
    value: 0.5,
  },
  {
    label: "MAX",
    value: 1,
  },
];

const DEFAULT_MAX_AMOUNT = 1000000000;

interface FormattedNumberInputProps {
  value: string;
  placeholder?: string;
  className?: string;
  maxDecimals?: number;
  amountAvailable?: string;
  rightInput?: React.ReactNode;
  balanceInput?: React.ReactNode;
  balanceInputUsd?: React.ReactNode;
  disabled?: boolean;
  maxAmount?: number;
  label?: string | React.ReactNode;
  hideDefaultWrapper?: boolean;
  inputClassName?: string;
  maxBalanceAllowed?: string;
  onChange: (value: string) => void;
  onValidate?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const Label = ({
  title,
  className,
}: {
  title: string | React.ReactNode;
  className?: string;
}) => {
  return typeof title === "string" ? (
    <div
      className={cn("text-white/50 text-base font-medium font-sans", className)}
    >
      {title}
    </div>
  ) : (
    title
  );
};

const BalanceInput = ({ balanceInput }: { balanceInput: React.ReactNode }) => {
  return (
    <div className="flex items-center mr-1">
      <img src={iconWallet} alt="wallet" className="w-5 h-5 mr-1.5" />
      {balanceInput}
    </div>
  );
};

export function FormattedNumberInput({
  value,
  placeholder = "0.00",
  className = "",
  amountAvailable = "",
  maxDecimals = 6,
  rightInput = "",
  balanceInput = "",
  balanceInputUsd = "",
  hideDefaultWrapper = false,
  maxBalanceAllowed,
  onChange,
  onValidate,
  onBlur,
  maxAmount = DEFAULT_MAX_AMOUNT,
  label: title,
  inputClassName,
  ...props
}: FormattedNumberInputProps) {
  const { isMd } = useBreakpoint();
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
      // Only allow numbers and one decimal point
      if (!regex.test(inputValue) && inputValue !== "") {
        return;
      }

      if (inputValue && Number(inputValue) > maxAmount) {
        return;
      }

      onChange(inputValue);
      onValidate?.(inputValue);
    },
    [onChange, onValidate, maxDecimals, maxAmount]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(value);
  }, [onBlur, value]);

  return (
    <>
      {!isMd && (
        <div className="flex justify-between items-center mb-2">
          <Label title={title} />
          <BalanceInput balanceInput={balanceInput} />
        </div>
      )}
      <div
        className={cn(
          "p-4",
          !hideDefaultWrapper && "deposit_input_v2_wrapper rounded-t-lg",
          className
        )}
      >
        {isMd && <Label title={title} className="mb-2.5" />}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 mr-2">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={cn(
                "font-mono hide-arrow font-bold bg-transparent text-white placeholder:text-white/60 w-full border-0 focus-visible:outline-none",
                isMd ? "h-[42px] text-[32px]" : "h-[32px] text-[24px]",
                inputClassName
              )}
              {...props}
            />
          </div>
          {rightInput}
        </div>
        <div
          className={cn(balanceInputUsd && "flex justify-between items-center")}
        >
          {balanceInputUsd && (
            <div className="flex items-center mr-1">{balanceInputUsd}</div>
          )}
          <div className="flex items-center space-x-2">
            {isMd && balanceInput && (
              <BalanceInput balanceInput={balanceInput} />
            )}
            {(amountAvailable ? QUICK_AMOUNTS : []).map((item) => (
              <button
                key={item.label}
                className="flex items-center justify-center w-12 h-5 bg-black border border-white/25 rounded text-white text-xs font-bold opacity-80 hover:bg-white/10"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const amount = maxBalanceAllowed
                    ? maxBalanceAllowed
                    : amountAvailable;

                  onChange(
                    BigNumber(amount)
                      .multipliedBy(item.value)
                      .decimalPlaces(maxDecimals, BigNumber.ROUND_DOWN)
                      .toFixed()
                  );
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
