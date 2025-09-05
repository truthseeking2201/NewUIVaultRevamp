import { LP_TOKEN_CONFIG } from "@/config";
import { RATE_DENOMINATOR } from "@/config/vault-config";
import { getBalanceAmount } from "@/lib/number";
import { SCVaultConfig } from "@/types/vault-config.types";
import BigNumber from "bignumber.js";

export const truncateStringWithSeparator = (
  strVal: string | null | undefined,
  length: number,
  separator: string | null | undefined,
  frontCharsLength: number
) => {
  const str = `${strVal}`;

  if (!length || str.length <= length) return str;

  separator = separator || "...";

  const sepLen = separator.length;
  const charsToShow = length - sepLen;
  let frontChars = 0;
  let backChars = 0;

  if (frontCharsLength > 0) {
    frontChars = frontCharsLength;
    backChars = charsToShow - frontChars;
  } else {
    frontChars = Math.ceil(charsToShow / 2);
    backChars = Math.floor(charsToShow / 2);
  }

  return (
    str.substr(0, frontChars) + separator + str.substr(str.length - backChars)
  );
};

/**
 * Calculates the interest based on APR and principal amount
 * @param {number} principal - The principal amount
 * @param {number} apr - Annual Percentage Rate (as a percentage, e.g., 18.7)
 * @param {number} years - Number of years (default: 1)
 * @returns {number} The interest amount
 */
export const calculateInterest = (
  principal: number,
  apr: number,
  years = 1
) => {
  // Convert APR from percentage to decimal
  const aprDecimal = apr / 100;

  // Calculate interest
  const interest = principal * aprDecimal * years;

  // Return the interest rounded to 2 decimal places
  return Math.round(interest * 100) / 100;
};

export const calculateUserHoldings = (
  ndlpBalance: string,
  user_pending_withdraw_ndlp: string,
  vault_lp_token_decimals: number,
  ndlp_price_usd: string
) => {
  let holdings = new BigNumber(ndlpBalance);

  if (user_pending_withdraw_ndlp) {
    const pendingWithdraw = getBalanceAmount(
      user_pending_withdraw_ndlp,
      vault_lp_token_decimals
    );
    holdings = holdings.plus(pendingWithdraw);
  }

  return holdings.multipliedBy(ndlp_price_usd).toNumber();
};

export const getNDLPTotalSupply = (
  vaultConfig: SCVaultConfig,
  decimals: number
) => {
  if (!vaultConfig) return "0";

  return new BigNumber(
    vaultConfig?.treasury_cap?.fields?.total_supply?.fields?.value
  )
    .dividedBy(new BigNumber(10).pow(decimals))
    .toNumber();
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const detectIsSlushApp = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isSlushApp = /Slush|SlushWallet/i.test(userAgent);
  return isSlushApp;
};
