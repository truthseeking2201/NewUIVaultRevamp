const DEFAULT_REFETCH_INTERVAL_SECONDS =
  import.meta.env.VITE_DEFAULT_REFETCH_INTERVAL_SECONDS || 300;

export const REFETCH_VAULT_DATA_INTERVAL =
  +DEFAULT_REFETCH_INTERVAL_SECONDS * 1000;

export const ADD_NDLP_WALLET_TUTORIAL_LINK =
  "https://d2g8s4wkah5pic.cloudfront.net/nodo-ai/slush-ndlp-guide.mp4";
