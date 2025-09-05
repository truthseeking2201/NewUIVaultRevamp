import { SUI_CONFIG } from "@/config";
import { DepositToken } from "@/types/deposit-token.types";
import BigNumber from "bignumber.js";

export const validateDepositBalance = (
  value: string | number,
  currentToken: DepositToken
) => {
  if (+value > +currentToken?.balance) {
    return `Not enough ${currentToken?.symbol} balance. Try smaller amount`;
  }

  if (currentToken.token_address === SUI_CONFIG.coinType) {
    const validAmount = new BigNumber(currentToken?.balance)
      .minus(SUI_CONFIG.gas_fee)
      .toNumber();

    if (+value > validAmount && +value <= +currentToken?.balance) {
      return `You need to retain some SUI to pay gas fee.`;
    }
  }
};
