export const formatCurrency = (
  value: number | string,
  decimal: number | string = 0,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2,
  style: "currency" | "decimal" = "decimal",
  currency: string = "USD"
) => {
  const decimalNum = Number(decimal ?? 0);
  const currencyValue = Number(value) / Math.pow(10, decimalNum);
  if (style === "decimal") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(currencyValue);
  }
  return new Intl.NumberFormat("en-US", {
    style,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(currencyValue);
};

export const formatShortCurrency = (
  value: number | string,
  precision: number = 2
) => {
  const currencyValue = Number(value);

  const absValue = Math.abs(currencyValue);

  let shortValue: number;
  let suffix: string;

  if (absValue >= 1e9) {
    shortValue = currencyValue / 1e9;
    suffix = "B";
  } else if (absValue >= 1e6) {
    shortValue = currencyValue / 1e6;
    suffix = "M";
  } else if (absValue >= 1e3) {
    shortValue = currencyValue / 1e3;
    suffix = "K";
  } else {
    return `$${currencyValue.toFixed(precision)}`;
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(shortValue);

  return `$${formattedNumber}${suffix}`;
};

export const convertTokenBase = (
  price: number | undefined,
  isInvert: boolean
): number => {
  if (typeof price !== "number" || isNaN(price) || price === 0) {
    return 0;
  }

  return isInvert ? 1 / Number(price) : price;
};
