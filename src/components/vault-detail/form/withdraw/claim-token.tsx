import { useState, useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import Web3Button from "@/components/ui/web3-button";
import { RowItem } from "@/components/ui/row-item";
import TransactionFee from "./transaction-fee";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import Countdown, { zeroPad } from "react-countdown";
import AvgPaceIcon from "@/assets/images/avg-pace.png";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import ConversationRate from "../conversation-rate";
import AmountToken from "./amount-token";
import IconReady from "./icon-ready";

import { showFormatNumber } from "@/lib/number";
import DataClaimType from "@/types/data-claim.types.d";
import { useWithdrawVault } from "@/hooks/use-withdraw-vault";
import { METHOD_DEPOSIT } from "@/components/vault-detail/constant";

type Props = {
  data?: DataClaimType;
  balanceLp: string;
  rateLpUsd: string;
  onSuccess: () => void;
  reloadData: () => void;
};

const ClaimToken = ({
  data,
  balanceLp,
  rateLpUsd,
  onSuccess,
  reloadData,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  /**
   * HOOKS
   */
  const { redeem } = useWithdrawVault();

  const rightInput = useMemo(() => {
    return (
      <div className="flex items-center">
        <img
          src={data.tokenWithdraw.image}
          alt={data.tokenWithdraw.token_symbol}
          className="md:w-6 md:h-6 w-5 h-5 mr-2"
        />
        <span className="font-mono text-sm md:text-lg font-bold text-gray-200">
          {data.tokenWithdraw.token_symbol}
        </span>
      </div>
    );
  }, [data]);

  const balanceInput = useMemo(() => {
    return (
      <span className="text-white/80 text-sm font-medium font-sans">
        {showFormatNumber(balanceLp, 0, 6, "", true)}{" "}
        {data.tokenWithdraw.token_symbol}
      </span>
    );
  }, [balanceLp, data]);

  const balanceInputUsd = useMemo(() => {
    const amount = new BigNumber(rateLpUsd)
      .multipliedBy(data.tokenWithdraw.amount)
      .toString();
    return (
      <span className="text-white/50 text-sm font-medium font-sans">
        {showFormatNumber(amount, 0, 2, "$")}
      </span>
    );
  }, [rateLpUsd, data]);

  const method = useMemo(() => {
    return data.tokenReceives?.length > 1
      ? METHOD_DEPOSIT.DUAL
      : METHOD_DEPOSIT.SINGLE;
  }, [data]);

  /**
   * FUNCTION
   */
  const onClaim = useCallback(async () => {
    setIsLoading(true);
    const res = await redeem(data.configLp);
    if (res) {
      onSuccess();
    }
    setIsLoading(false);
  }, [data, onSuccess, redeem]);

  const renderer = ({ hours, minutes, seconds }) => {
    return (
      <div className="ml-2 flex items-center bg-amber-600/20 px-1 py-0.5 rounded-full">
        <img
          src={AvgPaceIcon}
          alt="AvgPaceIcon"
          className="w-3 h-3 md:w-4 md:h-4 mr-2"
        />
        <div className="text-amber-600 text-xs md:text-sm font-mono font-medium">
          {zeroPad(hours)}
          <span className="ai-hiden">:</span>
          {zeroPad(minutes)}
          <span className="ai-hiden">:</span>
          {zeroPad(seconds)}
        </div>
      </div>
    );
  };
  /**
   * LIFECYCLES
   */

  /**
   * RENDER
   */
  return (
    <div className="">
      <FormattedNumberInput
        value={`${data.tokenWithdraw.amount}`}
        balanceInput={balanceInput}
        balanceInputUsd={balanceInputUsd}
        rightInput={rightInput}
        disabled={true}
        onChange={() => {}}
        label="Withdraw"
      />

      <div className="p-4 border border-white/20 rounded-[12px] rounded-t-none">
        <div className="flex items-center mb-2 md:justify-start justify-between gap-3">
          {!data.isClaim ? (
            <>
              <LabelWithTooltip
                label="Est. Max Receive"
                labelClassName="text-gray-200 font-bold text-sm md:text-base"
                tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
              />
              <Countdown
                date={data.timeUnlock}
                renderer={renderer}
                onComplete={reloadData}
              />
            </>
          ) : (
            <>
              <span className="text-gray-200 font-bold text-sm md:text-base">
                Actual Receive
              </span>
              <IconReady />
            </>
          )}
        </div>

        {data?.tokenReceives?.map((token, idx) => (
          <AmountToken
            key={`amount-${idx}`}
            amount={token?.amount}
            token={token}
            className={idx > 0 ? "mt-4" : ""}
          />
        ))}

        <hr className="w-full border-t border-white/15 my-4" />
        {method === METHOD_DEPOSIT.SINGLE && (
          <ConversationRate
            className="mb-2"
            sourceToken={{ symbol: data.conversionRate.from_symbol }}
            targetToken={{ symbol: data.conversionRate.to_symbol }}
            rate={data.conversionRate.rate}
          />
        )}

        <TransactionFee />
      </div>

      <Web3Button
        className="w-full font-semibold py-3 rounded-lg	flex items-center justify-center mt-4 mb-3 text-base md:text-lg"
        onClick={onClaim}
        disabled={isLoading || !data.isClaim}
        loading={isLoading}
      >
        {isLoading ? "Waiting" : "Claim"}
      </Web3Button>

      <p className="m-0 text-white/70 font-normal text-xs text-center">
        {data.isClaim
          ? "Your fund is now available for claiming. Please proceed to claim it before initiating a new one."
          : "Please wait to claim your previous withdrawal before initiating a new one"}
      </p>
    </div>
  );
};

export default ClaimToken;
