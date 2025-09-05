export class SuiClient {
  constructor(_cfg?: any) {}

  async getCoins(_args: { owner: string; coinType?: string; cursor?: string | null; limit?: number }) {
    const { coinType } = _args;
    const data: any[] = [];
    // Seed a couple of coins so UI can compute balances
    if (!coinType || coinType.includes("::usdc::USDC")) {
      data.push({
        coinType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        coinObjectId: "0xUSDC01",
        balance: "1000000000000", // 1,000,000 USDC (6 decimals)
      });
    }
    if (!coinType || coinType.includes("::sui::SUI")) {
      data.push({
        coinType:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
        coinObjectId: "0xSUI01",
        balance: "1000000000000000", // 1,000,000 SUI (9 decimals)
      });
    }
    return { data, hasNextPage: false, nextCursor: null };
  }

  async getAllCoins(_args: { owner: string; cursor?: string | null; limit?: number }) {
    // Return a mix of SUI and USDC coins to populate assets list
    return {
      data: [
        {
          coinType:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          coinObjectId: "0xSUI01",
          balance: "1000000000000000",
        },
        {
          coinType:
            "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
          coinObjectId: "0xUSDC01",
          balance: "1000000000000",
        },
      ],
      hasNextPage: false,
      nextCursor: null,
    } as any;
  }

  async getAllBalances(_args: { owner: string }) {
    // Used to map total balances by coin type
    return [
      { coinType: "0x2::sui::SUI", totalBalance: "1000000000000000" },
      {
        coinType:
          "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        totalBalance: "1000000000000",
      },
    ];
  }

  async getCoinMetadata(_args: { coinType: string }) {
    const { coinType } = _args;
    if (coinType.includes("::usdc::USDC")) {
      return { name: "USDC", symbol: "USDC", decimals: 6 } as any;
    }
    if (coinType.includes("::sui::SUI")) {
      return { name: "SUI", symbol: "SUI", decimals: 9 } as any;
    }
    // NDLP default
    return { name: "NDLP", symbol: "NDLP", decimals: 6 } as any;
  }

  async multiGetObjects(_args: any) {
    const ids: string[] = _args?.ids || [];
    // Provide minimal shape with empty fields to avoid spreading undefined
    return ids.map((id: string) => ({
      data: {
        objectId: id,
        content: { fields: {} },
      },
    }));
  }

  async getObject(_args: any) {
    return { data: { content: null, display: null, type: "mock" } } as any;
  }

  async waitForTransaction(_args: { digest: string; options?: any }) {
    return {
      events: [
        {
          type: "0xMOCK::vault::DepositWithSigTimeEvent",
          parsedJson: { amount: "1000000", lp: "990000" },
        },
      ],
      effects: {},
    } as any;
  }
}

export function useSuiClient() {
  return new SuiClient();
}

export function getFullnodeUrl(_net: "mainnet" | "testnet" | "devnet") {
  return "http://localhost/mock";
}
