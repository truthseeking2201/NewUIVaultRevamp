import { VaultItemData } from "./vault-list";
import { RowItem } from "@/components/ui/row-item";
import { Skeleton } from "@/components/ui/skeleton";
import Countdown, { zeroPad } from "react-countdown";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import UserHoldingTooltip from "./user-holding-tooltip";
import IconReady from "@/components/vault-detail/form/withdraw/icon-ready";

const VaultHolding = ({
  item,
  classRow = "justify-start",
  classLabel = "w-[110px] text-white/70",
  classValue = "font-medium font-mono text-white text-base",
  isOnlyWithdrawing = false,
  reloadData = () => {},
}: {
  item: VaultItemData;
  classLabel?: string;
  classRow?: string;
  classValue?: string;
  isOnlyWithdrawing?: boolean;
  reloadData: () => void;
}) => {
  const renderer = ({ hours, minutes, seconds }) => {
    return (
      <div className="ml-2 flex items-center bg-amber-600/20 px-1 pr-1.5 rounded-full">
        <svg
          className={cn(
            "mr-1 sm:w-3 sm:h-3 w-2.5 h-2.5",
            !isOnlyWithdrawing ? "text-amber-600" : "text-white"
          )}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.95 1.8C7.74 1.8 7.5625 1.7275 7.4175 1.5825C7.2725 1.4375 7.2 1.26 7.2 1.05C7.2 0.84 7.2725 0.6625 7.4175 0.5175C7.5625 0.3725 7.74 0.3 7.95 0.3C8.16 0.3 8.3375 0.3725 8.4825 0.5175C8.6275 0.6625 8.7 0.84 8.7 1.05C8.7 1.26 8.6275 1.4375 8.4825 1.5825C8.3375 1.7275 8.16 1.8 7.95 1.8ZM7.95 11.7C7.74 11.7 7.5625 11.6275 7.4175 11.4825C7.2725 11.3375 7.2 11.16 7.2 10.95C7.2 10.74 7.2725 10.5625 7.4175 10.4175C7.5625 10.2725 7.74 10.2 7.95 10.2C8.16 10.2 8.3375 10.2725 8.4825 10.4175C8.6275 10.5625 8.7 10.74 8.7 10.95C8.7 11.16 8.6275 11.3375 8.4825 11.4825C8.3375 11.6275 8.16 11.7 7.95 11.7ZM10.35 3.9C10.14 3.9 9.9625 3.8275 9.8175 3.6825C9.6725 3.5375 9.6 3.36 9.6 3.15C9.6 2.94 9.6725 2.7625 9.8175 2.6175C9.9625 2.4725 10.14 2.4 10.35 2.4C10.56 2.4 10.7375 2.4725 10.8825 2.6175C11.0275 2.7625 11.1 2.94 11.1 3.15C11.1 3.36 11.0275 3.5375 10.8825 3.6825C10.7375 3.8275 10.56 3.9 10.35 3.9ZM10.35 9.6C10.14 9.6 9.9625 9.5275 9.8175 9.3825C9.6725 9.2375 9.6 9.06 9.6 8.85C9.6 8.64 9.6725 8.4625 9.8175 8.3175C9.9625 8.1725 10.14 8.1 10.35 8.1C10.56 8.1 10.7375 8.1725 10.8825 8.3175C11.0275 8.4625 11.1 8.64 11.1 8.85C11.1 9.06 11.0275 9.2375 10.8825 9.3825C10.7375 9.5275 10.56 9.6 10.35 9.6ZM11.25 6.75C11.04 6.75 10.8625 6.6775 10.7175 6.5325C10.5725 6.3875 10.5 6.21 10.5 6C10.5 5.79 10.5725 5.6125 10.7175 5.4675C10.8625 5.3225 11.04 5.25 11.25 5.25C11.46 5.25 11.6375 5.3225 11.7825 5.4675C11.9275 5.6125 12 5.79 12 6C12 6.21 11.9275 6.3875 11.7825 6.5325C11.6375 6.6775 11.46 6.75 11.25 6.75ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0V1.2C4.66 1.2 3.525 1.665 2.595 2.595C1.665 3.525 1.2 4.66 1.2 6C1.2 7.34 1.665 8.475 2.595 9.405C3.525 10.335 4.66 10.8 6 10.8V12ZM6 7.2C5.67 7.2 5.3875 7.0825 5.1525 6.8475C4.9175 6.6125 4.8 6.33 4.8 6C4.8 5.95 4.8025 5.8975 4.8075 5.8425C4.8125 5.7875 4.825 5.735 4.845 5.685L3.6 4.44L4.44 3.6L5.685 4.845C5.725 4.835 5.83 4.82 6 4.8C6.33 4.8 6.6125 4.9175 6.8475 5.1525C7.0825 5.3875 7.2 5.67 7.2 6C7.2 6.33 7.0825 6.6125 6.8475 6.8475C6.6125 7.0825 6.33 7.2 6 7.2Z"
            fill="currentColor"
          />
        </svg>
        <div
          className={cn(
            "sm:text-xs font-mono sm:font-medium sm:leading-[22px] font-[10px] leading-[17px]",
            !isOnlyWithdrawing ? "text-amber-600" : "text-white"
          )}
        >
          {zeroPad(hours)}
          <span className="ai-hiden">:</span>
          {zeroPad(minutes)}
          <span className="ai-hiden">:</span>
          {zeroPad(seconds)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center gap-1">
      {!isOnlyWithdrawing &&
        (item.user_holdings_show || item.rewards_earned_show) && (
          <UserHoldingTooltip>
            {item.user_holdings_show && (
              <RowItem
                className={classRow}
                classNameLabel={classLabel}
                classNameValue={classValue}
                label="Available:"
              >
                {item.user_holdings_show}
              </RowItem>
            )}
            {item.rewards_earned_show && (
              <RowItem
                classNameLabel={classLabel}
                className={classRow}
                classNameValue={cn(classValue, "text-green-increase")}
                label="Rewards Earned:"
              >
                {item.is_loading_withdrawal ? (
                  <Skeleton className="w-[100px] h-5" />
                ) : (
                  item.rewards_earned_show
                )}
              </RowItem>
            )}
          </UserHoldingTooltip>
        )}

      {item.is_loading_withdrawal && !isOnlyWithdrawing && (
        <RowItem
          classNameLabel={classLabel}
          className={classRow}
          classNameValue={classValue}
          label="Withdrawing:"
        >
          <Skeleton className="w-[100px] h-5" />
        </RowItem>
      )}

      {item.withdrawing && (
        <RowItem
          classNameLabel={classLabel}
          className={classRow}
          classNameValue={classValue}
          label="Withdrawing:"
        >
          <div className="flex flex-wrap items-center text-sm">
            <span>{item.withdrawing.receive_amount_usd}</span>
            {item.withdrawing.is_ready ? (
              <IconReady
                className="!py-[2px] ml-2"
                classNameText={
                  !isOnlyWithdrawing ? "text-green-ready" : "text-white"
                }
                classNameCheck={
                  !isOnlyWithdrawing ? "text-black" : "text-white"
                }
              />
            ) : (
              // <div className="ml-2 flex items-center bg-green-ready/20 sm:px-1 px-0.5 rounded-full">
              //   <div className="sm:w-4 sm:h-4 w-3 h-3 bg-green-ready rounded-full flex items-center justify-center">
              //     <Check
              //       className={cn(
              //         !isOnlyWithdrawing ? "text-black" : "text-white"
              //       )}
              //       strokeWidth="4"
              //       size={10}
              //     />
              //   </div>
              //   <span
              //     className={cn(
              //       "sm:text-xs text-[10px] sm:leading-[22px] leading-[17px] font-mono font-bold ml-1",
              //       !isOnlyWithdrawing ? "text-green-ready" : "text-white"
              //     )}
              //   >
              //     READY
              //   </span>
              // </div>
              <Countdown
                date={item.withdrawing.countdown}
                renderer={renderer}
                onComplete={reloadData}
              />
            )}
          </div>
        </RowItem>
      )}
    </div>
  );
};

export default VaultHolding;
