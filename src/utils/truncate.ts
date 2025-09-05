const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

const truncateBetween = (str: string, start: number, end: number): string => {
  if (str.length <= start + end) return str;
  return str.slice(0, start) + "..." + str.slice(-end);
};

export { truncate, truncateBetween };