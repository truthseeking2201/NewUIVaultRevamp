import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { truncateBetween } from "@/utils/truncate";
import { Copy } from "@/assets/icons";
import { useToast } from "@/hooks/use-toast";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import TableMobile, {
  RowTokens,
  RowType,
  RowTime,
  RowValue,
  RowAction,
  RowSkeleton,
} from "@/components/ui/table-mobile";
import { formatCurrency } from "@/utils/currency";
import gradientLink from "@/assets/icons/gradient-arrow-link.svg";
import { formatAmount } from "@/lib/utils";
import { ADD_NDLP_WALLET_TUTORIAL_LINK } from "@/config/constants";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import VideoModal from "@/components/ui/video-modal";
import { useState } from "react";
import { RowItem } from "@/components/ui/row-item";
import { CoinMetadata } from "@mysten/sui/client";
import { cn } from "@/lib/utils";

const MRowItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <RowItem
      className="mt-2"
      classNameLabel="text-xs text-[rgba(255, 255, 255, 0.80)]"
      classNameValue="text-white font-medium text-xs"
    >
      {children}
    </RowItem>
  );
};

const RowItemValue = ({ children }: { children: React.ReactNode }) => (
  <div className="text-white font-medium">{children}</div>
);

const VaultInfoMobile = ({
  vaultDetails,
  isDetailLoading,
  lpTokenMetadata,
  handleCheckAddress,
  handleCopy,
  openCoinInfo,
  setTutorialVideoOpen,
}: {
  vaultDetails: BasicVaultDetailsType;
  isDetailLoading: boolean;
  lpTokenMetadata: CoinMetadata;
  handleCheckAddress: (address: any) => void;
  handleCopy: (e: any, address: string) => void;
  openCoinInfo: (address: string) => void;
  setTutorialVideoOpen: (open: boolean) => void;
}) => {
  return (
    <div>
      <TableMobile>
        <div className="font-medium mb-2">NODO Platform Fees</div>
        <RowValue
          label="Management Fee"
          value={`${formatCurrency(
            vaultDetails?.management_fee || 0,
            2,
            2,
            2,
            "decimal",
            ""
          )}%`}
        />
        <RowValue
          label="Performance Fee"
          value={`${formatCurrency(
            vaultDetails?.performance_fee || 0,
            2,
            2,
            2,
            "decimal",
            ""
          )}%`}
        />
        <RowValue
          label="24h Rewards"
          value={formatCurrency(
            vaultDetails?.rewards_24h_usd || 0,
            2,
            2,
            2,
            "currency",
            "USD"
          )}
        />
        <hr className="bg-white/80 my-4" />
        <div className="font-medium mb-2">Contracts</div>
        <RowAction label="Vault Contract Address">
          <div
            className="text-white hover:cursor-pointer hover:underline text-xs font-mono"
            onClick={() => handleCheckAddress(vaultDetails?.vault_address)}
          >
            {truncateBetween(vaultDetails?.vault_address || "", 6, 6)}
            <Copy
              className="inline-block ml-1 h-4 w-4 cursor-pointer"
              onClick={(e) => {
                handleCopy(e, vaultDetails.vault_address || "");
              }}
            />
          </div>
        </RowAction>
        <RowAction label="Liquidity Pool Address">
          <div
            className="text-white hover:cursor-pointer hover:underline text-xs font-mono"
            onClick={() => handleCheckAddress(vaultDetails?.pool?.pool_address)}
          >
            {truncateBetween(vaultDetails?.pool?.pool_address || "", 6, 6)}
            <Copy
              className="inline-block ml-1 h-4 w-4 cursor-pointer"
              onClick={(e) => {
                handleCopy(e, vaultDetails?.pool?.pool_address || "");
              }}
            />
          </div>
        </RowAction>
        <hr className="bg-white/80 my-4" />
        <div className="font-medium">NDLP Token Info</div>
        <MRowItem>
          <RowItem.Label>Name</RowItem.Label>
          <RowItem.Value>{lpTokenMetadata?.name || "NDLP"}</RowItem.Value>
        </MRowItem>
        <MRowItem>
          <RowItem.Label>Symbol</RowItem.Label>
          <RowItem.Value>
            <img
              className="w-4 h-4"
              src={lpTokenMetadata?.iconUrl || "/coins/ndlp.png"}
              alt={lpTokenMetadata?.name}
            />
          </RowItem.Value>
        </MRowItem>
        <MRowItem>
          <RowItem.Label>Price</RowItem.Label>
          <RowItem.Value>
            <span className="text-xs">
              $
              {formatAmount({
                amount: vaultDetails?.ndlp_price,
                precision: 4,
              })}{" "}
              <span className="text-xs">
                ({vaultDetails?.ndlp_price_change_7d > 0 ? "+" : ""}
                <span
                  className={cn(
                    vaultDetails?.ndlp_price_change_7d > 0
                      ? "text-[#64EBBC]"
                      : "text-red-400"
                  )}
                >
                  {formatAmount({
                    amount: vaultDetails?.ndlp_price_change_7d,
                  })}
                  %
                </span>{" "}
                in 7d)
              </span>
            </span>
          </RowItem.Value>
        </MRowItem>
        <MRowItem>
          <RowItem.Label>Contract Address</RowItem.Label>
          <RowItem.Value>
            <div className="text-white text-xs font-mono">
              {truncateBetween(vaultDetails?.vault_lp_token || "", 6, 6)}
              <Copy
                className="inline-block ml-1 h-4 w-4 cursor-pointer"
                onClick={(e) => {
                  handleCopy(e, vaultDetails?.vault_lp_token || "");
                }}
              />
              <img
                onClick={() => openCoinInfo(vaultDetails?.vault_lp_token)}
                src={gradientLink}
                alt="gradient-link"
                className="inline-block ml-1 h-4 w-4 cursor-pointer"
              />
            </div>
          </RowItem.Value>
        </MRowItem>
        <MRowItem>
          <RowItem.Label>Can't see NDLP in wallet?</RowItem.Label>
          <RowItem.Value>
            <div className="text-white text-xs font-mono">
              <span className="mr-2">Watch Tutorial</span>
              <img
                onClick={() => setTutorialVideoOpen(true)}
                src={gradientLink}
                alt="gradient-link"
                className="inline-block ml-1 h-4 w-4 cursor-pointer"
              />
            </div>
          </RowItem.Value>
        </MRowItem>
      </TableMobile>
    </div>
  );
};

const VaultInfo = ({
  vaultDetails,
  isDetailLoading,
}: {
  vaultDetails: BasicVaultDetailsType;
  isDetailLoading: boolean;
}) => {
  const { toast } = useToast();
  const { isMobile } = useBreakpoint();
  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false);
  const { data: lpTokenMetadata } = useSuiClientQuery("getCoinMetadata", {
    coinType: vaultDetails?.vault_lp_token,
  });

  const handleCheckAddress = (address: any) => {
    window.open(`https://suiscan.xyz/mainnet/object/${address}`, "_blank");
  };

  const openCoinInfo = (address: string) => {
    window.open(`https://suiscan.xyz/mainnet/coin/${address}`, "_blank");
  };

  const handleCopy = (e: any, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    toast({
      variant: "success",
      title: "Address copied",
      description: "Address copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <DetailWrapper
      title="Vault Information"
      isLoading={isDetailLoading}
      loadingStyle="h-[190px] w-full"
    >
      <ConditionRenderer
        when={!isMobile}
        fallback={
          <VaultInfoMobile
            vaultDetails={vaultDetails}
            isDetailLoading={isDetailLoading}
            lpTokenMetadata={lpTokenMetadata}
            handleCheckAddress={handleCheckAddress}
            handleCopy={handleCopy}
            openCoinInfo={openCoinInfo}
            setTutorialVideoOpen={setTutorialVideoOpen}
          />
        }
      >
        <div>
          <div className="text-white text-md font-medium">
            NODO Platform Fees
          </div>
          <div className="flex items-center gap-16 mt-4">
            <div className="w-[200px]">
              <div className="text-[#9CA3AF] text-xs pb-1">Management Fee</div>
              <div className="text-white text-sm font-mono">
                {(vaultDetails?.management_fee || 0).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[#9CA3AF] text-xs pb-1">
                Performance Fee (From fees and rewards)
              </div>
              <div className="text-white font-mono text-sm">
                {(vaultDetails?.performance_fee || 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 mb-6 h-[1px] border-t border-white-200" />
        <div>
          <div className="text-white text-md font-medium">Contracts</div>
          <div className="flex items-center gap-16 mt-4">
            <div className="w-[200px]">
              <div className="text-[#9CA3AF] text-xs pb-1">
                Vault Contract Address
              </div>
              <div
                className="text-white hover:cursor-pointer hover:underline text-sm font-mono"
                onClick={() => handleCheckAddress(vaultDetails?.vault_address)}
              >
                {truncateBetween(vaultDetails?.vault_address || "", 6, 6)}
                <Copy
                  className="inline-block ml-1 h-4 w-4 cursor-pointer"
                  onClick={(e) => {
                    handleCopy(e, vaultDetails.vault_address || "");
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-[#9CA3AF] text-xs pb-1">
                Liquidity Pool Address
              </div>
              <div
                className="text-white hover:cursor-pointer hover:underline text-sm font-mono"
                onClick={() =>
                  handleCheckAddress(vaultDetails?.pool?.pool_address)
                }
              >
                {truncateBetween(vaultDetails?.pool?.pool_address || "", 6, 6)}
                <Copy
                  className="inline-block ml-1 h-4 w-4 cursor-pointer"
                  onClick={(e) => {
                    handleCopy(e, vaultDetails?.pool?.pool_address || "");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 mb-6 h-[1px] border-t border-white-200" />
        <div>
          <div className="text-white text-md font-medium">NDLP Token Info</div>
          <div className="flex items-center gap-16 mt-4">
            <div className="w-[200px]">
              <div className="text-[#9CA3AF] text-xs pb-1">Name</div>
              <div className="text-white text-sm font-mono">
                {lpTokenMetadata?.name || "NDLP"}
              </div>
            </div>
            <div className="w-[150px]">
              <div className="text-[#9CA3AF] text-xs pb-1">Symbol</div>
              <img
                className="w-4 h-4"
                src={lpTokenMetadata?.iconUrl || "/coins/ndlp.png"}
                alt={lpTokenMetadata?.name}
              />
            </div>
            <div>
              <div className="text-[#9CA3AF] text-xs pb-1">Price</div>
              <div className="text-white text-xs font-mono">
                $
                {formatAmount({
                  amount: vaultDetails?.ndlp_price_usd,
                  precision: 4,
                })}
                <span>
                  ({vaultDetails?.ndlp_price_change_7d > 0 ? "+" : ""}
                  <span
                    className={cn(
                      vaultDetails?.ndlp_price_change_7d > 0
                        ? "text-[#64EBBC]"
                        : "text-red-400"
                    )}
                  >
                    {formatAmount({
                      amount: vaultDetails?.ndlp_price_change_7d,
                    })}
                    %
                  </span>{" "}
                  in 7d)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-16 mt-4">
            <div className="w-[200px]">
              <div className="text-[#9CA3AF] text-xs pb-1">
                Contract Address
              </div>
              <div className="text-white text-sm font-mono">
                {truncateBetween(vaultDetails?.vault_lp_token || "", 6, 6)}
                <Copy
                  className="inline-block ml-1 h-4 w-4 cursor-pointer"
                  onClick={(e) => {
                    handleCopy(e, vaultDetails?.vault_lp_token || "");
                  }}
                />
                <img
                  onClick={() => openCoinInfo(vaultDetails?.vault_lp_token)}
                  src={gradientLink}
                  alt="gradient-link"
                  className="inline-block ml-1 h-4 w-4 cursor-pointer"
                />
              </div>
            </div>
            <div>
              <div className="text-[#9CA3AF] text-xs pb-1">
                Can't see NDLP in wallet?
              </div>
              <div className="text-white text-sm font-mono">
                <span className="mr-2">Watch Tutorial</span>
                <img
                  onClick={() => setTutorialVideoOpen(true)}
                  src={gradientLink}
                  alt="gradient-link"
                  className="inline-block ml-1 h-4 w-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </ConditionRenderer>
      <VideoModal
        title="Show NDLP in Slush Wallet"
        videoUrl={ADD_NDLP_WALLET_TUTORIAL_LINK}
        open={tutorialVideoOpen}
        onOpenChange={() => setTutorialVideoOpen(false)}
      />
    </DetailWrapper>
  );
};

export default VaultInfo;
