export class SuiPriceServiceConnection {
  constructor(public _url: string, public _opts?: any) {}
  async getLatestPriceFeedsUpdateData(_ids: string[]) {
    return new Uint8Array([1, 2, 3]);
  }
}

export class SuiPythClient {
  constructor(_suiClient: any, _pythStateId: string, _wormholeStateId: string) {}
  async updatePriceFeeds(_tx: any, _priceUpdateData: any, _priceIDs: string[]) {
    return ["0xPRICEOBJ1", "0xPRICEOBJ2"];
  }
}

