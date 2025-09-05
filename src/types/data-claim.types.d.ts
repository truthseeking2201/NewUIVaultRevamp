import LpType, { TokenType } from "@/types/lp.type";

interface ConversionRateType {
  from_symbol: string;
  to_symbol: string;
  rate: number;
}
export default interface DataClaimType {
  timeUnlock: number;
  isClaim: boolean;
  configLp: LpType;
  tokenWithdraw: TokenType;
  tokenReceives: TokenType[];
  conversionRate: ConversionRateType;
}
