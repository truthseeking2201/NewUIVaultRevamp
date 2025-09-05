export const PERIOD_TABS = [
  { value: "ONE_DAY", label: "1D" },
  { value: "ONE_WEEK", label: "1W" },
];

export const PERIOD_TABS_1W = [{ value: "ONE_WEEK", label: "1W" }];

export const ANALYTICS_TABS = [
  { value: "POSITION_PRICE", label: "Position Price" },
  { value: "APY_YIELDS", label: "APY & Yields" },
];

export const ACTIVITIES_TABS = [
  { value: "ALL", label: "All" },
  { value: "SWAP", label: "Swap" },
  { value: "ADD_LIQUIDITY", label: "Add" },
  { value: "REMOVE_LIQUIDITY", label: "Remove" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSE", label: "Close" },
];

export const METHOD_DEPOSIT = {
  SINGLE: "SINGLE",
  DUAL: "DUAL",
};
export const METHOD_DEPOSIT_TABS = [
  { value: METHOD_DEPOSIT.SINGLE, label: "Single" },
  { value: METHOD_DEPOSIT.DUAL, label: "Dual" },
];

export const ITEMS_PER_PAGE = 5;
export const ADD_LIQUIDITY_TYPES = [
  "ADD_LIQUIDITY",
  "OPEN",
  "ADD_PROFIT_UPDATE_RATE",
  "CLAIM_REWARDS",
];
export const REMOVE_LIQUIDITY_TYPES = ["REMOVE_LIQUIDITY", "CLOSE"];
export const SWAP_TYPES = ["SWAP"];

export const ACTIVITIES_TIME_TABS = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
];

// Lightweight mock series for UserPosition chart (NDLP vs Break-even zones)
export const mockDataLiveChart = Array.from({ length: 24 }).map((_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  percentage: Math.sin(i / 6) * 8, // ±8%
  price: i,
}));
export const mockDataLiveChart2 = Array.from({ length: 7 * 24 }).map((_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  percentage: Math.sin(i / 12) * 6, // ±6%
  price: i,
}));
