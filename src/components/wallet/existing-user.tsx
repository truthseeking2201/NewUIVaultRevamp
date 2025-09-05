import DefaultAvatar from "@/assets/images/wallet/default-avatar.png";
import ExistingUserIcon from "@/assets/images/wallet/existing-account.png";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/components/wallet/constants.ts";
import type { UserType } from "@/types/user";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { ArrowRight, Loader2 } from "lucide-react";

type ExistingUserProps = {
  onNextStep: (step?: string) => void;
  user: UserType;
  isLoading?: boolean;
};
const ExistingUser = ({ onNextStep, user, isLoading }: ExistingUserProps) => {
  const handleBackToConnectWallet = () => {
    triggerWalletDisconnect();
    onNextStep(STEPS.CONNECT_WALLET);
  };
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4 pb-6">
      <img
        src={ExistingUserIcon}
        alt="Existing User"
        className="w-16 h-16 mb-6"
      />
      <div className="text-2xl font-bold text-white mb-2 text-center">
        Existing Account Detected
      </div>
      <div className="text-gray-400 mb-6 text-center">
        This wallet is linked to your NODO account. Your referral code is now
        active on NODO AI Vaults.
      </div>
      <div className="flex flex-col items-center justify-center mb-6 w-full bg-white/5 py-3 px-4 rounded-lg">
        <img
          src={DefaultAvatar}
          alt="Default Avatar"
          className="w-[42px] h-[42px] mb-4 rounded-full"
        />
        <div className="text-base font-semibold text-white">
          {user.invite_code.nodo_account.full_name}
        </div>
        <div className="text-sm text-gray-400">{user.email}</div>
        <div className="flex items-center justify-between mt-3 w-full bg-white/15 py-[6px] px-3 rounded-md">
          <div className="text-sm text-gray-400">Referral Code:</div>
          <div className="font-mono font-bold text-sm text-white">
            {user.invite_code.code}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mb-2 w-full gap-4">
        <Button
          variant="ai-outline"
          size="lg"
          onClick={handleBackToConnectWallet}
          className="w-full max-w-xs font-semibold text-sm h-[44px] rounded-lg"
        >
          Login with another wallet
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => onNextStep()}
          className="w-full max-w-xs font-semibold text-sm h-[44px] rounded-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : (
            <>
              Confirm login
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExistingUser;
