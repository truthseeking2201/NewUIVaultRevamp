export class Transaction {
  gas: any;
  pure: any;
  constructor() {
    this.gas = "0xGAS";
    const pureFn = ((typeOrVal: any, maybeVal?: any) => {
      // Support tx.pure("vector<vector<u8>>", ...)
      if (typeof typeOrVal === "string") return maybeVal;
      return typeOrVal;
    }) as any;
    pureFn.u64 = (v: any) => Number(v);
    pureFn.u128 = (v: any) => Number(v);
    pureFn.u32 = (v: any) => Number(v);
    pureFn.bool = (b: any) => !!b;
    pureFn.address = (a: string) => a;
    pureFn.vector = (_inner: string, v: any) => v;
    this.pure = pureFn;
  }

  object(id: string) {
    return id;
  }

  splitCoins(_from: any, _parts: any[]) {
    return ["0xSPLITCOIN"];
  }

  transferObjects(_objs: string[], _to: any) {}

  mergeCoins(_primary: any, _coins: any[]) {}

  moveCall(_opts: { target: string; typeArguments?: string[]; arguments?: any[] }) {}
}
