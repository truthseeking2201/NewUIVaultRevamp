import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import BigNumber from "bignumber.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const formatAmount = ({
  amount,
  precision = 2,
  stripZero = true,
  minimumDisplay,
  sign,
}: {
  amount: number | string;
  precision?: number;
  stripZero?: boolean;
  minimumDisplay?: number;
  sign?: string;
}) => {
  let formatted = new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(new BigNumber(amount).toNumber());

  if (stripZero) {
    formatted = formatted.replace(/\.?0+$/, "");
  }

  if (sign) {
    formatted = sign + formatted;
  }

  if (amount && minimumDisplay && Number(amount) < minimumDisplay) {
    if (sign) {
      formatted = "<" + sign + minimumDisplay;
    } else {
      formatted = "<" + minimumDisplay;
    }
  }

  return formatted;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const roundDownBalance = (balance: number, decimal: number = 4) => {
  return Math.floor(balance * 10 ** decimal) / 10 ** decimal;
};

export const formatPercentage = (value: number) => {
  return formatAmount({ amount: value, precision: 2, stripZero: false }) + "%";
};

export const getImage = (symbol: string) => {
  if (!symbol) return "";
  return `/coins/${symbol?.toLowerCase()}.png`;
};

// Display-only transformer for vault names across the app.
// - Replace all occurrences of "NDLP" (case-insensitive) with "SUI"
// - Replace all slashes "/" with hyphens "-"
export const formatVaultNameDisplay = (name?: string) => {
  if (!name) return "";
  return name
    .replace(/NDLP/gi, "SUI")
    .replace(/\//g, "-");
};
