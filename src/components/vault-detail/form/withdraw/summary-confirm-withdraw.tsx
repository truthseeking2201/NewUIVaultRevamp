import { RowItem } from "@/components/ui/row-item";
import DepositMethod from "@/components/vault-detail/form/deposit-method";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import TransactionFee from "@/components/vault-detail/form/deposit/transaction-fee";

import { showFormatNumber } from "@/lib/number";
import { cn } from "@/lib/utils";
import { METHOD_DEPOSIT } from "@/components/vault-detail/constant";
// import { truncateStringWithSeparator } from "@/utils/helpers";

type Props = {
  summary?: any;
  lpData?: any;
  configVault?: any;
  address?: string;
  method: (typeof METHOD_DEPOSIT)[keyof typeof METHOD_DEPOSIT];
};

const SummaryConfirmWithdraw = ({
  summary,
  lpData,
  configVault,
  address,
  method,
}: Props) => {
  const classToken = "max-md:w-5 max-md:h-5 w-6 h-6";
  const classLable = "text-text-secondary text-base font-sans max-md:text-sm";
  return (
    <div className="p-3 md:p-4 border border-white/15 rounded-lg">
      <RowItem
        label="Vault"
        classNameLabel={classLable}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-s flex max-md:text-sm">
            <img
              src={lpData.token_image}
              alt={lpData.token_symbol}
              className="absolute right-[18px] z-0 flex-shrink-0"
            />
            <img
              src={lpData.quote_image}
              alt={lpData.quote_symbol}
              className={cn(classToken, "z-10 flex-shrink-0")}
            />
          </div>

          <span className="font-mono max-md:text-13px text-lg text-white truncate max-w-[180px] sm:max-w-[280px]">
            {lpData.vault_name}
          </span>
        </div>
      </RowItem>
      {lpData?.exchange && (
        <RowItem
          label="DEX"
          className="mt-3 max-md:mt-2"
          classNameLabel={classLable}
        >
          <div className="flex items-center gap-1">
            <img
              src={lpData.exchange.image}
              alt={lpData.exchange.name}
              className=" w-4 h-4 inline"
            />
            <span className="font-sans max-md:text-sm text-base font-bold text-white">
              {lpData.exchange.name}
            </span>
          </div>
        </RowItem>
      )}
      <RowItem
        label="Amount"
        className="mt-3 max-md:mt-2"
        classNameLabel={classLable}
      >
        <div className="flex items-center max-md:text-sm">
          <img
            src={lpData?.lp_image}
            alt="NODOAIx Token"
            className={cn(classToken, "mr-2")}
          />
          {showFormatNumber(summary?.amount || 0)} {lpData?.lp_symbol}
        </div>
      </RowItem>
      {/* <RowItem
        label="Conversion Rate"
        className="mt-3 max-md:mt-2 tracking-tighter max-md:text-sm"
        classNameLabel="max-md:text-13px"
        classNameValue="max-md:text-sm"
      >
        <span className="mr-1.5">1</span>
        {summary?.conversion_rate?.from_symbol}
        <span className="mx-1.5">=</span>
        {showFormatNumber(summary?.conversion_rate?.amount, 0, 4)}
        <span className="ml-1.5">{summary?.conversion_rate?.to_symbol}</span>
      </RowItem> */}
      <RowItem
        label="Withdraw Method"
        className="mt-3 max-md:mt-2"
        classNameLabel={classLable}
        classNameValue="max-md:text-sm"
      >
        <DepositMethod method={method} />
      </RowItem>
      <hr className="w-full border-t border-white/15 mt-3 mb-3" />

      <TransactionFee labelClassName="!text-base max-md:text-sm" />

      <hr className="w-full border-t border-white/15 mt-3 mb-3" />
      <RowItem className="items-start">
        <RowItem.Label>
          <LabelWithTooltip
            label="Est. Max Receive"
            labelClassName={cn(classLable)}
            iconClassName="mt-0"
            tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
            asChild={true}
          />
        </RowItem.Label>
        <RowItem.Value>
          {summary?.receives?.map((token, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-end",
                idx > 0 ? "mt-2" : ""
              )}
            >
              <img
                src={token?.image}
                alt={token?.token_symbol}
                className={cn(classToken, "mr-2")}
              />
              <span className="text-gray-200 font-bold max-md:text-sm">
                {showFormatNumber(token?.amount || "0")} {token?.token_symbol}
              </span>
            </div>
          ))}
        </RowItem.Value>
      </RowItem>
      {/* <RowItem
        label="Recipient"
        className="mt-3"
      >
        {truncateStringWithSeparator(address, 13, "...", 6)}
      </RowItem> */}
    </div>
  );
};

export default SummaryConfirmWithdraw;
