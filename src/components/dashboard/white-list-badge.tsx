import { useWallet, useWhitelistWallet } from "@/hooks";
import { cn } from "@/lib/utils";
import ConditionRenderer from "../shared/condition-renderer";

const baseColor = "#656565";

const WhiteListBadge = () => {
  const { isAuthenticated } = useWallet();
  const { isWhitelisted, isLoading } = useWhitelistWallet();
  const styles = isWhitelisted
    ? {
        background: "linear-gradient(87deg, #0CF -0.54%, #00FF5E 97.84%)",
      }
    : {
        border: `1px solid ${baseColor}`,
        background: "rgba(255, 255, 255, 0.15)",
      };

  return (
    <ConditionRenderer when={isAuthenticated} fallback={null}>
      <div
        style={{
          borderRadius: "90px",
          height: "28px",
          ...styles,
        }}
      >
        <div className="flex items-center justify-center gap-2 h-full">
          <div
            className={cn(
              isWhitelisted ? "bg-white" : "bg-[#656565]",
              "rounded-full w-7 h-7 flex items-center justify-center"
            )}
          >
            <ConditionRenderer
              when={!isWhitelisted}
              fallback={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                >
                  <path
                    d="M14.1777 2.00049L5.92773 10.0005L2.17773 6.36412"
                    stroke="black"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="4"
                viewBox="0 0 16 4"
                fill="none"
              >
                <path
                  d="M2.21094 2H14.2109"
                  stroke="#909090"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </ConditionRenderer>
          </div>
          <div
            className={cn(
              isWhitelisted ? "text-black" : "text-white",
              "text-sm font-medium font-mono pr-4"
            )}
          >
            {isWhitelisted ? "WHITELISTED" : "NON-WHITELISTED"}
          </div>
        </div>
      </div>
    </ConditionRenderer>
  );
};

export default WhiteListBadge;
