import BigNumber from "bignumber.js";

/**
 * Don't use the result to convert back to number.
 * It uses undefined locale which uses host language as a result.
 * Languages have different decimal separators which results in inconsistency when converting back this result to number.
 */
export const formatNumber = (
  number: string | number,
  minPrecision = 0,
  maxPrecision = 6
) => {
  if (number === null || number === undefined) return "--";

  // Convert to a number if it's a string
  const num = typeof number === "string" ? parseFloat(number) : number;

  // Handle cases where parseFloat results in NaN
  if (isNaN(num)) return "--";

  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  };
  return num.toLocaleString(undefined, options);
};

export const showFormatNumber = (
  number: string | number,
  minPrecision = 0,
  maxPrecision = 6,
  prefix = "",
  isRoundDown = false
) => {
  if (number === null || number === undefined) return "--";

  // Convert to a number if it's a string
  let num = typeof number === "string" ? parseFloat(number) : number;

  // Handle cases where parseFloat results in NaN
  if (isNaN(num)) return "--";
  if (isRoundDown) {
    num = BigNumber(num)
      .decimalPlaces(maxPrecision, BigNumber.ROUND_DOWN)
      .toNumber();
  }

  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  };

  const sml = Math.pow(10, -maxPrecision);
  if (Number(number) < sml && Number(number) > 0) {
    return `<${prefix}${sml.toLocaleString(undefined, options)}`;
  }
  return prefix + num.toLocaleString(undefined, options);
};

export const formatLocalisedCompactNumber = (
  number: number,
  isShort = true
): string => {
  const codeFromStorage = "en-US";

  const isClient = typeof window === "object";
  const isSupported = window?.Intl;

  // For clients do not support Intl, just return number
  if (isClient && !isSupported) {
    return `${number}`;
  }

  return new Intl.NumberFormat(codeFromStorage, {
    notation: "compact",
    compactDisplay: isShort ? "short" : "long",
    maximumSignificantDigits: 3,
  }).format(number);
};

/**
 * Take a formatted amount, e.g. 15 BNB and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (
  amount: BigNumber | number | string,
  decimals = 18
) => {
  return new BigNumber(amount).times(new BigNumber(10).pow(decimals));
};
export const getBalanceAmount = (
  amount: BigNumber | number | string,
  decimals: number | undefined = 18
) => {
  return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals));
};
export const getBalanceAmountForInput = (
  amount: BigNumber | number | string,
  decimals: number | undefined = 18,
  decimals_fix: number | undefined = 2
) => {
  if (!amount) return 0;
  const balance = new BigNumber(amount)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed(decimals_fix, 1);
  return new BigNumber(balance).toNumber();
};
