export const RATE_DENOMINATOR = 1000000;

export const CLOCK = "0x6";

export const EXCHANGE_CODES_MAP: Record<
  number,
  {
    code: string;
    name: string;
    image: string;
  }
> = {
  1: {
    code: "cetus",
    name: "Cetus",
    image: "/dexs/cetus.png",
  },
  2: {
    code: "pancake",
    name: "Pancake",
    image: "/dexs/pancake.png",
  },
  3: {
    code: "mmt",
    name: "Momentum",
    image: "/dexs/mmt.png",
  },
  5: {
    code: "bluefin",
    name: "Bluefin",
    image: "/dexs/bluefin.png",
  },
  6: {
    code: "kriya",
    name: "Kriya",
    image: "/dexs/kriya.png",
  },
  8: {
    code: "turbos",
    name: "Turbos",
    image: "/dexs/turbos.png",
  },
  9: {
    code: "flowx",
    name: "FlowX",
    image: "/dexs/flowx.png",
  },
};

export const DUAL_TOKEN_DEPOSIT_CONFIG = {
  price_feed_config:
    "0x04e3a1bb44ea289d85ab955d2b6c9fa1da669c8c9bc96de92e50b97e1922a070",
  mmt_version:
    "0x2375a0b1ec12010aaea3b2545acfa2ad34cfbba03ce4b59f4c39e1e25eed1b2a",
  cetus_global_config:
    "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
  bluefin_global_config:
    "0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352",
};
