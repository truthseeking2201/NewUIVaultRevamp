import { ArrowUpRight } from "lucide-react";
import SUIIcon from "@/assets/images/sui-wallet.png";
import Illustration from "@/assets/images/dashboard/illustration.png";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";

const LeftContent = () => {
  const { isWhitelisted } = useWhitelistWallet();

  return (
    <div className="w-[252px] flex-shrink-0">
      {/* <div
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 flex items-center hover:bg-white/20 transition duration-300 ease-in-out cursor-pointer"
        onClick={() => {
          window.open(`https://app.nodo.xyz`, "_blank");
        }}
      >
        <div className="flex-1">Explore Prediction Market</div>
        <div className="ml-2">
          <ArrowUpRight size={16} className="text-white" />
        </div>
      </div> */}

      <div
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center hover:bg-white/20 transition duration-300 ease-in-out cursor-pointer"
        onClick={() => {
          window.open("https://docs.nodo.xyz", "_blank");
        }}
      >
        <div className="flex-1">Read Docs</div>
        <div className="ml-2">
          <ArrowUpRight size={16} className="text-white" />
        </div>
      </div>
      {!isWhitelisted && (
        <div
          className="bg-gradient-to-b from-[#25252C] to-[#000] backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition duration-300 ease-in-out cursor-pointer mt-4 relative overflow-hidden"
          onClick={() => {
            window.open(import.meta.env.VITE_WHITELIST_FORM_URL, "_blank");
          }}
        >
          <p className="font-extrabold text-[26px] leading-8 text-white">
            Join{" "}
            <span className="bg-gradient-to-r from-[#F2BB89] via-[#F3D2B5] to-[#F5C8A4] bg-clip-text text-transparent">
              Whitelist Access{" "}
            </span>
            NODO AI Vaults Now
            <ArrowUpRight
              size={24}
              strokeWidth={3}
              className="text-white inline"
            />
          </p>
          <span className="text-md text-white/80 mt-2">
            First of its kind on
          </span>
          <div className="flex items-center gap-3 mt-1 mb-3">
            <img src={SUIIcon} width={36} height={36} />
            <span className="text-xl text-white font-medium">SUI</span>
          </div>
          <img
            src={Illustration}
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LeftContent;
