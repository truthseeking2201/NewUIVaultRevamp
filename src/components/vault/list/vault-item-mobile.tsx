import { RowItem } from "@/components/ui/row-item";
import { VaultItemData } from "./vault-list";
import { cn, formatVaultNameDisplay } from "@/lib/utils";
import Web3Button from "@/components/ui/web3-button";
import { ButtonGradient } from "@/components/ui/button-gradient";
import VaultHolding from "./vault-holding";
import VaultRewards from "./vault-rewards";

type VaultCardProps = {
  item: VaultItemData;
  idLoadingClaim?: string;

  reloadDataWithdraw: () => void;
  onRowClick: (item: VaultItemData) => void;
  onClaim: (item: VaultItemData) => void;
};

const VaultItemMobile = ({
  item,
  idLoadingClaim,
  onRowClick,
  onClaim,
  reloadDataWithdraw = () => {},
}: VaultCardProps) => {
  const classLabel = "text-[#9C9C9C]";
  const classValue = "font-medium font-mono text-white text-base";

  return (
    <div
      className={cn("rounded-lg border border-white/10 p-4 mt-4 first:mt-0")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRowClick(item);
      }}
    >
      <RowItem
        className="items-start"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="Pools"
      >
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center justify-center gap-2">
            {item.token_pools?.length > 0 &&
              item.token_pools.map((token, index) => (
                <img
                  key={token.name}
                  src={token.image}
                  alt={token.name}
                  className={cn(
                    "rounded-full w-[24px] h-[24px]",
                    index > 0 && "ml-[-15px]"
                  )}
                />
              ))}
            <div className="font-bold text-white text-base truncate max-w-[150px]">
              {formatVaultNameDisplay(item.vault_name)}
            </div>
          </div>
          <div className="flex gap-1 items-center text-xs font-medium">
            <img
              src={item.exchange_image}
              alt={item.exchange_name}
              className="h-[14px]"
            />
            {item.exchange_name}
          </div>
        </div>
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="TVL"
      >
        {item.total_value_usd_show}
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={cn(classValue, "text-green-increase")}
        label="APY"
      >
        {item.vault_apy_show}
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="24h Rewards"
      >
        {item.rewards_24h_usd_show}
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="Rewards"
      >
        <VaultRewards item={item} />
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="Your Holdings"
      ></RowItem>

      <div className="px-3 py-2 rounded-md bg-white bg-opacity-4 mt-1">
        <VaultHolding
          item={item}
          reloadData={reloadDataWithdraw}
          classRow="justify-between"
          classLabel="text-white/70 font-mono text-xs"
          classValue="font-medium font-mono text-white text-sm"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Web3Button
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(item);
          }}
          className="w-full text-sm h-[36px]"
        >
          Deposit
        </Web3Button>
        {item?.withdrawing?.is_ready === true && (
          <ButtonGradient
            onClick={(e: React.FormEvent) => {
              e.stopPropagation();
              e.preventDefault();
              onClaim(item);
            }}
            variant="outline"
            className="w-full"
            loading={idLoadingClaim === item.vault_id}
            disabled={!!idLoadingClaim}
            hideContentOnLoading={true}
          >
            Claim
          </ButtonGradient>
        )}
      </div>
    </div>
  );
};

export default VaultItemMobile;
