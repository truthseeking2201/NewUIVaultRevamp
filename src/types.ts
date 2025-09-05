export interface Vault {
  id: string;
  name: string;
  tvl: number;
  apr: number;
  riskLevel: string;
  strategy: string;
  tokens: string[];
  description: string;
  performance: {
    day: number;
    week: number;
    month: number;
    allTime: number;
  };
} 