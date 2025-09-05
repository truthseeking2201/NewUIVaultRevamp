import axios from "axios";
const baseURL = import.meta.env.VITE_NODO_APP_URL || "https://api-dev.nodo.xyz";

const URLS = {
  login: "/data-management/auth/login",
  refreshToken: "/data-management/auth/refresh",
};

export const loginWallet = async (payload: {
  signature: string;
  timestamp: number;
  address: string;
  bytes?: string; // optional raw bytes of the signed message (base64)
}) => {
  const res = await axios.post(`${baseURL}${URLS.login}`, payload, {
    timeout: 10000,
  });
  return res.data?.data;
};
