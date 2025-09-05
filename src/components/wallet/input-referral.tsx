import ExistingUserIcon from "@/assets/images/wallet/existing-account.png";
import ExistingUserErrorIcon from "@/assets/images/wallet/existing-account-error.png";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleAlert, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  checkReferralCode,
  linkReferralCode,
  skipReferralCode,
} from "@/apis/wallet";
import { useWallet } from "@/hooks";

type InputReferralProps = {
  onClose: () => void;
  onNextStep: (referralCode: string) => void;
  isLoading?: boolean;
};

const InputReferral = ({
  onClose,
  onNextStep,
  isLoading,
}: InputReferralProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm({
    defaultValues: {
      referralCode: "",
    },
  });
  const { address } = useWallet();

  const handleCheckReferralCode = async (referralCode: string) => {
    try {
      const response = await checkReferralCode(referralCode);
      return response.valid;
    } catch (error) {
      console.error("Error checking referral code:", error);
    }
  };

  const handleSkipReferral = async () => {
    try {
      const res = await skipReferralCode();
      if (res) {
        onClose();
      }
    } catch (error) {
      console.error("Error skipping referral code:", error);
      setFieldError();
    }
  };

  const handleLinkReferralCode = async (referralCode: string) => {
    try {
      const res = await linkReferralCode({
        invite_code: referralCode,
      });

      return res;
    } catch (error) {
      console.error("Error linking referral code:", error);
    }
  };

  const setFieldError = () => {
    setError("referralCode", {
      type: "value",
      message: "Failed to link referral code. Please try again.",
    });
  };

  const onSubmit = async (data: { referralCode: string }) => {
    if (data.referralCode !== "") {
      const isValid = await handleCheckReferralCode(data.referralCode);
      if (isValid) {
        const res = await handleLinkReferralCode(data.referralCode);
        if (res.success) {
          onNextStep(data.referralCode);
        } else {
          setFieldError();
        }
      } else {
        setFieldError();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4 w-full pb-6">
      <img
        src={errors.referralCode ? ExistingUserErrorIcon : ExistingUserIcon}
        alt="Existing User"
        className="w-16 h-16 mb-6"
      />
      <div className="text-2xl font-bold text-white mb-2 text-center">
        Were You Referred?
      </div>
      <div className="text-gray-400 mb-6 text-center">
        If someone invited you to NODO AI Vaults,
        <br /> enter their referral code below
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-gray-400 mb-2">Referral Code (Optional)</div>
        <Controller
          name="referralCode"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Enter referral code"
              className="w-full px-4 py-2 bg-ai/5 border border-ai/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ai"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />
        {errors.referralCode && (
          <div className="text-red-error text-sm mt-1 font-sans">
            <CircleAlert className="inline-block mr-1" size={16} />
            {errors.referralCode.message}
          </div>
        )}
        <div className="flex items-center justify-center mb-2 w-full gap-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkipReferral}
            className="w-full font-semibold text-sm h-[44px] rounded-lg"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              "Skip"
            )}
          </Button>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full font-semibold text-sm h-[44px] rounded-lg"
            disabled={isSubmitting || isLoading || !isDirty}
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InputReferral;
