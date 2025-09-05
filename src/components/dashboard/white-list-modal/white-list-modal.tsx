import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import RegisterForWhiteListButton from "../request-whitelist-button/register-for-white-list-button";
import RealizeYields from "@/assets/images/whitelist/realize-yields.png";
import VIPAccess from "@/assets/images/whitelist/vip-access.png";
import SeamlessLiquidity from "@/assets/images/whitelist/seamless-liquidity.png";
import PlayCircle from "@/assets/images/whitelist/play-circle.png";
import RegisterIcon from "@/assets/images/whitelist/register.png";
import ConfirmEmail from "@/assets/images/whitelist/confirm-email.png";
import WhitelistAddress from "@/assets/images/whitelist/whitelist-address.png";
import NDLPIcon from "@/assets/images/NDLP.png";
import Background from "@/assets/images/whitelist/background.png";
import { Key, useState } from "react";
import DemoVideoModal from "./demo-video-modal";
import AutonomousManagementIcon from "@/assets/images/whitelist/autonomous-management.png";
import OptimizedYields from "@/assets/images/whitelist/optimized-yields.png";

type StatementProps = {
  header: JSX.Element;
  data: Array<HowItWorksItem | WhyNDLPItem>;
};
type HowItWorksItem = {
  icon: string;
  label: string;
  description?: JSX.Element; // Optional description for items in "How It Works"
};

type WhyNDLPItem = {
  icon: string;
  label: string;
  description: JSX.Element;
};

const howItWorks = {
  header: <div className="text-lg font-bold text-white">How It Works</div>,
  data: [
    {
      icon: RegisterIcon,
      label: "Register via Form",
    },
    {
      icon: ConfirmEmail,
      label: "Get confirmation email",
    },
    {
      icon: WhitelistAddress,
      label: "Connect whitelisted address",
    },
  ],
};

const whyNDLP = {
  header: (
    <div className="text-lg font-bold text-white">Why NODO AI Vaults?</div>
  ),
  data: [
    {
      icon: OptimizedYields,
      label: "Optimized Yields",
      description: (
        <span className="text-sm">
          Access the highest-APR pools across top DEXes.
        </span>
      ),
    },
    {
      icon: AutonomousManagementIcon,
      label: "Autonomous Management",
      description: (
        <span className="text-sm">
          Automatic rebalancing based on real-time market.
        </span>
      ),
    },
    {
      icon: SeamlessLiquidity,
      label: "Seamless Liquidity",
      description: (
        <span className="text-sm">
          <span className="font-bold"> Minimal requirements</span> for unbonding
          & fees.
        </span>
      ),
    },
  ],
};

const renderItem = (item: HowItWorksItem | WhyNDLPItem, index: Key) => {
  return (
    <div key={index} className="flex items-center gap-2 text-white/70">
      <img src={item.icon} alt={item.label} className="w-[50px] h-[50px]" />
      <div className="flex flex-col">
        <span className="text-medium text-white font-medium">{item.label}</span>
        {item.description}
      </div>
    </div>
  );
};

const renderCardItem = (state: StatementProps) => {
  return (
    <div
      className="w-[480px] p-4 "
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "16px",
      }}
    >
      <div className="text-lg font-bold text-white">{state.header}</div>
      <div className="flex flex-col gap-2 mt-4">
        {state.data.map((item: HowItWorksItem | WhyNDLPItem, index: number) =>
          renderItem(item, index)
        )}
      </div>
    </div>
  );
};

const WhiteListModal = ({ open, onClose }) => {
  const [openDemoVideo, setOpenDemoVideo] = useState(false);
  const handleJoinWhiteList = () => {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSc6RNsisPxo5cDAVu8pnY-16jziJJ8vyLwe_d73-GCt0gBiGw/viewform",
      "_blank"
    );
  };

  const handleViewDemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDemoVideo(true);
  };

  return (
    <>
      {open && (
        <div
          data-state="open"
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 p-2"
          style={{ pointerEvents: "auto" }}
          data-aria-hidden="true"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="p-12 bg-black/40 rounded-lg backdrop-blur-xl w-full h-full relative flex flex-col justify-between">
            <div className="flex gap-3 items-center">
              <div className="bg-[white]/5 rounded-full p-4 w-fit relative hover:cursor-pointer hover:bg-[white]/10 transition-all duration-200">
                <MoveLeft
                  size={24}
                  className="text-white cursor-pointer"
                  onClick={onClose}
                />
              </div>
              <div className={"text-lg"}>Back to app</div>
            </div>
            <div className="">
              <div
                className="text-[60px] leading-[64px] font-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                Be The First to Access
              </div>
              <div className="text-[60px] leading-[64px] font-bold">
                NODO AI Vaults
              </div>
              <div className="text-[18px] mt-6">
                Unlock access to the first agentic DeFAI vaults on Sui by
                registering for the whitelist now.
              </div>
              <div className="mt-6 relative flex justify-start gap-4">
                <RegisterForWhiteListButton
                  onClick={handleJoinWhiteList}
                  label={"Join Whitelist"}
                  icon={<></>}
                  customClassName="!w-[280px] !h-[66px] !rounded-full !top-0 !left-0 !transform-none"
                />
                <Button
                  variant="outline"
                  className="w-[280px] h-[66px] rounded-full font-semibold text-lg text-white bg-white/20"
                  onClick={(e) => handleViewDemo(e)}
                >
                  <img src={PlayCircle} alt="Play" className="w-6 h-6 mr-2" />
                  View Demo
                </Button>
              </div>
              <div className="mt-6 flex gap-4">
                {renderCardItem(howItWorks)}
                {renderCardItem(whyNDLP)}
              </div>
            </div>
          </div>
        </div>
      )}

      <DemoVideoModal
        open={openDemoVideo}
        onOpenChange={() => setOpenDemoVideo(false)}
      />
    </>
  );
};

export default WhiteListModal;
