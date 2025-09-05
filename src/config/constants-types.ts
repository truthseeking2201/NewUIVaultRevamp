import { OptionsSelectType } from "@/types/options-select.types.ts";

export const TIME_FILTER = {
  all: "ALL_TIME",
  today: "TODAY",
  thisWeek: "THIS_WEEK",
  last7days: "LAST_7_DAYS",
  thisMonth: "THIS_MONTH",
  last30days: "LAST_30_DAYS",
  thisYear: "THIS_YEAR",
};

export const TIME_FILTER_OPTIONS_REFERRAL: OptionsSelectType[] = [
  { value: TIME_FILTER.all, label: "All Time" },
  { value: TIME_FILTER.today, label: "Today" },
  { value: TIME_FILTER.thisWeek, label: "This Week" },
  { value: TIME_FILTER.last7days, label: "Last 7 Days" },
  { value: TIME_FILTER.thisMonth, label: "This Month" },
  { value: TIME_FILTER.last30days, label: "Last 30 Days" },
  { value: TIME_FILTER.thisYear, label: "This Year" },
];

export const SORT_TYPE = {
  asc: "ASC",
  desc: "DESC",
};
