import AIInvestIcon from "@/assets/images/dashboard/ai_invest.png";
import AutoCompoundingIcon from "@/assets/images/dashboard/auto_compounding.png";
import DepositIcon from "@/assets/images/dashboard/deposit.png";
import EarnWithdrawIcon from "@/assets/images/dashboard/earn_withdraw.png";
import ExclusiveBenefits from "@/assets/images/dashboard/exclusive_benefits.png";
import LimitedSupplyIcon from "@/assets/images/dashboard/limited_supply.png";
import { BalanceCard } from "@/components/wallet/balance-card";
import { MyReferralsCard } from "@/components/my-referrals/my-referrals-card";
import { useWallet } from "@/hooks";

const RightContent = () => {
  const { isAuthenticated } = useWallet();

  return (
    <div className="w-[252px] flex-shrink-0">
      {/* Balance Card - Only visible when wallet is connected */}
      {isAuthenticated && <BalanceCard className="mb-6" />}

      {/* My Referrals Card - Only visible when wallet is connected */}
      {isAuthenticated && <MyReferralsCard className="mb-6" />}

      {/* Introducing NDLP Card */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-100 mb-4 font-bold text-lg">Introducing</h3>

        <div className="flex items-center gap-2 mb-3">
          <img src="/coins/ndlp.png" alt="NDLP" className="w-10" />
          <span className="font-heading-md text-100">$NDLP</span>
        </div>

        <p className="font-body text-100 mb-6">
          When you deposit into any NODO vault, you receive $NDLP Tokens that
          automatically grow in value
        </p>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <img
                src={AutoCompoundingIcon}
                alt="auto compounding"
                className="w-8 h-8"
              />
            </div>
            <div>
              <div className="font-body font-medium mb-1 text-100">
                Auto-Compounding
              </div>
              <div className="font-caption text-white/70">
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
              <div className="font-body font-medium mb-1 text-100">
                Exclusive Benefits
              </div>
              <div className="font-caption text-white/70">
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
              <div className="font-body font-medium mb-1 text-100">
                Limited Supply
              </div>
              <div className="font-caption text-white/70">
                Early adopters gain maximum potential
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How NODO AI Vault works */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6">
        <h3 className="font-bold text-lg text-100 mb-4">
          How NODO AI Vault works
        </h3>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-075 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <img src={DepositIcon} alt="deposit" className="w-8 h-8" />
            </div>
            <div>
              <div className="font-body font-medium mb-1 text-100">Deposit</div>
              <div className="font-caption text-white/70">
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
              <div className="font-body font-medium mb-1 text-100">
                AI Invest
              </div>
              <div className="font-caption text-white/70">
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
              <div className="font-body font-medium mb-1 text-100">
                Earn & Withdraw
              </div>
              <div className="font-caption text-white/70">
                Earn yield + $NDLP. Withdraw $NDLP anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RightContent;
