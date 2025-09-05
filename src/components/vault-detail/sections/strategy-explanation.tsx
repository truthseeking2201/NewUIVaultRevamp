import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import drawdownIcon from "@/assets/icons/drawdown.svg";
import useBreakpoint from "@/hooks/use-breakpoint";

type VaultInfoProps = {
  vault: BasicVaultDetailsType;
  isDetailLoading: boolean;
};

const GradientText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text}
    </div>
  );
};

const StrategyExplanation = ({ vault, isDetailLoading }: VaultInfoProps) => {
  const pair = vault?.pool?.pool_name?.split("-") || [];
  const maxDrawdown = vault?.max_drawdown || "";
  const { isMd } = useBreakpoint();
  return (
    <DetailWrapper
      title="Strategy Explanation"
      isLoading={isDetailLoading}
      loadingStyle="h-[134px] w-full"
    >
      <p className="text-white !mb-0 md:text-base text-xs">
        This vault maintains a balanced approach to liquidity provision on{" "}
        {pair[0]}/{pair[1]}, using AI to predict optimal rebalancing times while
        minimizing impermanent loss. The strategy focuses on sustainable yields
        with controlled risk exposure.
      </p>

      <div
        className="rounded-xl p-2 mt-6 flex max-md:flex-col md:items-center md:gap-6 gap-3"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 232, 201, 0.20) 0%, rgba(249, 244, 233, 0.20) 25%, rgba(227, 246, 255, 0.20) 60%, rgba(201, 212, 255, 0.20) 100%)",
        }}
      >
        <div className="p-3 md:p-4 bg-black rounded-lg flex gap-2 max-md:w-fit">
          <img src={drawdownIcon} alt="drawdown" />
          <div>
            <GradientText
              text={"Max Drawdown"}
              className="font-sans text-xs font-normal"
            />
            <GradientText
              text={maxDrawdown + "%"}
              className="font-mono text-2xl font-bold"
            />
          </div>
        </div>
        <div className="text-white/80 text-xs max-w-[540px] font-sans">
          If your vault position drops by {maxDrawdown}%, it will automatically
          exit and move funds to stablecoins, helping protect your capital from
          further loss
        </div>
      </div>
    </DetailWrapper>
  );
};

export default StrategyExplanation;
