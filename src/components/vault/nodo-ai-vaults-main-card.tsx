import { ArrowUpRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import DepositVaultSection from "@/components/vault/deposit/deposit-vault-section";
import WithdrawVaultSection from "@/components/vault/withdraw/withdraw-vault-section";

export default function NodoAIVaultsMainCard() {
  const [depositWithdrawTab, setDepositWithdrawTab] = useState("deposit");

  /**
   * FUNCTION
   */

  /**
   * LIFECYCLES
   */
  useEffect(() => {});

  /**
   * RENDER
   */
  return (
    <div className="rounded-xl">
      {/* Tabs for Deposit/Withdraw */}
      <div className="flex font-mono">
        <div className="flex bg-[#202124] rounded-t-2xl">
          <button
            className={`tab px-6 ${
              depositWithdrawTab === "deposit" ? "active" : ""
            }`}
            onClick={() => setDepositWithdrawTab("deposit")}
            aria-label="Deposit tab - press Command+1 to access"
          >
            <div className="flex items-center">
              <Plus size={24} className="mr-2" />
              <span className="font-mono">Deposit</span>
            </div>
          </button>
          <button
            className={`tab px-6 ${
              depositWithdrawTab === "withdraw" ? "active" : ""
            }`}
            onClick={() => setDepositWithdrawTab("withdraw")}
            aria-label="Withdraw tab - press Command+2 to access"
          >
            <div className="flex items-center">
              <ArrowUpRight size={24} className="mr-2" />
              <span className="font-mono">Withdraw</span>
            </div>
          </button>
        </div>
      </div>

      {/* Deposit Tab Content */}
      <div
        className={`${depositWithdrawTab === "deposit" ? "block" : "hidden"}`}
      >
        <DepositVaultSection />
      </div>

      {/* Withdraw Tab Content */}
      <div
        className={`${depositWithdrawTab === "withdraw" ? "block" : "hidden"}`}
      >
        <WithdrawVaultSection />
      </div>
    </div>
  );
}
