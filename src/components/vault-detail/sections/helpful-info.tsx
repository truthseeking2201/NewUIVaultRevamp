import AIInvestIcon from "@/assets/images/dashboard/ai_invest.png";
import AutoCompoundingIcon from "@/assets/images/dashboard/auto_compounding.png";
import DepositIcon from "@/assets/images/dashboard/deposit.png";
import EarnWithdrawIcon from "@/assets/images/dashboard/earn_withdraw.png";
import ExclusiveBenefits from "@/assets/images/dashboard/exclusive_benefits.png";
import LimitedSupplyIcon from "@/assets/images/dashboard/limited_supply.png";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpfulInfo = ({ isDetailLoading }: { isDetailLoading?: boolean }) => {
  return (
    <DetailWrapper
      title="Helpful Information"
      isLoading={isDetailLoading}
      loadingStyle="h-[140px] w-full"
    >
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="!pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-white" />
              <div className="text-white text-md ">What is NDLP?</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 md:text-balance text-left">
            <div className="space-y-4">
              <p className="text-sm text-100 mb-6">
                When you deposit into any NODO vault, you receive $NDLP Tokens
                that automatically grow in value
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img
                    src={AutoCompoundingIcon}
                    alt="auto compounding"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1">
                    Auto-Compounding
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    Exponential yield via autonomous reinvesting
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img
                    src={ExclusiveBenefits}
                    alt="exclusive benefits"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-100">
                    Exclusive Benefits
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    Priority access to premium AI features
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img
                    src={LimitedSupplyIcon}
                    alt="limited supply"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-100">
                    Limited Supply
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    Early adopters gain maximum potential.
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="mt-4">
          <AccordionTrigger className="!pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-white" />
              <div className="text-white !text-md">How Nodo AI Vaut Works</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img src={DepositIcon} alt="deposit" className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-100">
                    Deposit
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    Simply Enter NODO AI Vault, then receive $NDLP as your
                    collateral token
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img src={AIInvestIcon} alt="AI invest" className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-100">
                    AI Invest
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    AI auto-allocates to top LP pools for max yield.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <img
                    src={EarnWithdrawIcon}
                    alt="earn withdraw"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-100">
                    Earn & Withdraw
                  </div>
                  <div className="md:text-sm text-xs text-white/70">
                    Earn yield + $NDLP. Withdraw $NDLP anytime
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DetailWrapper>
  );
};

export default HelpfulInfo;
