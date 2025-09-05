import arrowBack from "@/assets/icons/arrow-back.svg";
import { Checkbox } from "@/components/ui/checkbox";
import VideoModal from "@/components/ui/video-modal";
import { ADD_NDLP_WALLET_TUTORIAL_LINK } from "@/config/constants";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const NdlpTutorial = () => {
  const { currentWallet } = useCurrentWallet();
  const isSlushWallet = currentWallet?.name === "Slush";
  const isHideNdlpSlushTutorial =
    localStorage.getItem("hide_ndlp_slush_tutorial") === "true";

  const [hideNdlpSlushTutorial, setHideNdlpSlushTutorial] = useState(false);
  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false);

  const handleHideNdlpSlushTutorial = (value: boolean) => {
    setHideNdlpSlushTutorial(value);
  };

  useEffect(() => {
    return () => {
      if (hideNdlpSlushTutorial) {
        localStorage.setItem(
          "hide_ndlp_slush_tutorial",
          hideNdlpSlushTutorial.toString()
        );
      }
    };
  }, [hideNdlpSlushTutorial]);

  if (isHideNdlpSlushTutorial || !isSlushWallet) return null;
  return (
    <>
      <div className="flex flex-col gap-3 p-4 border border-white/15 rounded-lg bg-white/5 mt-4 font-medium leading-5">
        Slush doesn't auto-display NDLP. You need to add it manually for each
        vault:
        <div className="text-sm font-normal font-sans mt-2 border border-b-white/20 pb-4">
          To show NDLP:
          <ul className="list-disc ml-8 mt-1">
            <li>Open Slush Wallet and search for “NDLP”</li>
            <li>Enable it and pin to your home screen </li>
          </ul>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hideNdlpSlushTutorial}
              onCheckedChange={handleHideNdlpSlushTutorial}
            />
            Hide this next time
          </div>
          <div
            className="flex items-center gap-2 rounded-md font-sans text-sm bg-white/10 p-2 px-2 cursor-pointer"
            onClick={() => setTutorialVideoOpen(true)}
          >
            <img src={arrowBack} alt="Arrow Back" className="w-6 h-6" />
            Watch Tutorial
          </div>
        </div>
      </div>
      <VideoModal
        title="Show NDLP in Slush Wallet"
        videoUrl={ADD_NDLP_WALLET_TUTORIAL_LINK}
        open={tutorialVideoOpen}
        onOpenChange={() => setTutorialVideoOpen(false)}
      />
    </>
  );
};

export default NdlpTutorial;
