import ReferralConfirmIcon from "@/assets/images/wallet/referral-confirm.png";
import { Wallet, Check, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkReferralCode } from "@/apis/wallet";
import { useState, useEffect } from "react";

type ConfirmReferralProps = {
  onNextStep: () => void;
  linkRefCode?: string; // Optional referral code prop
};

const ConfirmReferral = ({ onNextStep, linkRefCode }: ConfirmReferralProps) => {
  const [isValidCode, setIsValidCode] = useState(true);

  const handleCheckReferralCode = async (code: string) => {
    try {
      const response = await checkReferralCode(code);
      if (response) {
        setIsValidCode(response?.valid);
      }
    } catch (error) {
      console.error("Error checking referral code:", error);
    }
  };

  useEffect(() => {
    if (linkRefCode) {
      handleCheckReferralCode(linkRefCode);
    }
  }, [linkRefCode]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4 pb-6">
      <img
        src={ReferralConfirmIcon}
        alt="Confirm Referral"
        className="w-[62px] h-[100px] mb-4"
      />
      <span className="text-xl font-bold text-white mb-2 text-center">
        You’ve Been Invited!
      </span>
      <span className="text-gray-400 mb-6 text-center text-base">
        Welcome! Looks like a friend referred you. Just
        <br /> connect your wallet and make a deposit to unlock
        <br /> rewards for both of you.
      </span>
      <div className="border border-[#2C2C2C] rounded-lg px-3 py-2 w-full">
        <span className="font-medium font-mono">{linkRefCode}</span>
      </div>
      <div className="flex items-center justify-start mb-6 mt-2 w-full">
        {isValidCode ? (
          <>
            <Check size={12} className="text-green-500 mr-2" />
            <span className="text-gray-400 text-sm">
              Code automatically applied from referral link
            </span>
          </>
        ) : (
          <>
            <CircleAlert size={12} className="text-red-error mr-2" />
            <span className="text-red-error text-xs">
              Invalid referral code. Please check the link or try another code.
            </span>
          </>
        )}
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={onNextStep}
        className="w-full font-semibold text-sm h-[44px] rounded-lg"
      >
        <Wallet className="inline !w-6 !h-6" />
        {isValidCode ? "Connect Wallet" : "Connect Without Code"}
      </Button>
    </div>
  );
};

export default ConfirmReferral;
